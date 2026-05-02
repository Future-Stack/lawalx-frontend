'use client';

import { useRef, useEffect, useState } from 'react';
import { Paperclip, Send, X, FileIcon, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTicketChat } from '@/hooks/useTicketChat';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import {
  useGetAssignedTicketDetailsQuery,
  useResolveTicketMutation,
} from '@/redux/api/supporter/supporterTicketApi';
import { useUploadSupportFileMutation } from '@/redux/api/users/support/supportApi';
import type { ChatAttachment, ChatMessage } from '@/types/chat';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

interface Ticket {
  id: string;
  ticketId: string;
  clientName: string;
  issueType: string;
  status: string;
}

interface TicketConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

function roleLabel(role?: string): string {
  if (!role) return 'Support';
  const r = role.toUpperCase();
  if (r === 'USER') return 'Client';
  if (r === 'SUPPORTER') return 'Supporter';
  if (r === 'ADMIN' || r === 'SUPERADMIN') return 'Admin';
  return role;
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
}

function AttachmentPreview({ att, isOwn }: { att: ChatAttachment; isOwn: boolean }) {
  const fullUrl = att.fileUrl.startsWith('http') ? att.fileUrl : `${BASE_URL}/${att.fileUrl}`;
  const isImg = isImageUrl(att.fileUrl);
  return isImg ? (
    <a href={fullUrl} target="_blank" rel="noreferrer" className="block mt-1.5">
      <img
        src={fullUrl}
        alt={att.fileName}
        className="max-w-[160px] max-h-[120px] rounded-lg object-cover"
      />
    </a>
  ) : (
    <a
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex items-center gap-1 text-xs underline truncate max-w-[180px] mt-1',
        isOwn ? 'text-indigo-500' : 'text-blue-600 dark:text-blue-400'
      )}
    >
      <FileIcon className="w-3 h-3 flex-shrink-0" />
      {att.fileName}
    </a>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TicketConversationDialog({
  open,
  onOpenChange,
  ticket,
}: TicketConversationDialogProps) {
  const [message, setMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAppSelector(selectCurrentUser);
  const [uploadSupportFile] = useUploadSupportFileMutation();
  const [resolveTicket, { isLoading: isResolving }] = useResolveTicketMutation();

  const handleResolve = async () => {
    if (!ticket?.id) return;
    try {
      await resolveTicket(ticket.id).unwrap();
      toast.success('Ticket marked as resolved');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to resolve ticket');
    }
  };

  const { currentData: ticketDetails } = useGetAssignedTicketDetailsQuery(
    ticket?.id || '',
    { skip: !open || !ticket?.id, refetchOnMountOrArgChange: true }
  );

  // Build senderId → { name, role } map from ticket details
  const senderLookup: Record<string, { name: string; role: string }> = {};
  if (ticketDetails?.data) {
    const d = ticketDetails.data;
    if (d.userId) {
      senderLookup[d.userId] = { name: d.user?.username ?? 'Client', role: 'Client' };
    }
  }

  const initialMessages = (ticketDetails?.data?.messages ?? []).map((m: any) => ({
    id: m.id,
    ticketId: ticket?.id ?? '',
    text: m.text,
    senderId: m.sender?.id,
    senderName: m.sender?.full_name || m.sender?.username || senderLookup[m.sender?.id]?.name,
    senderRole: m.sender?.role || senderLookup[m.sender?.id]?.role,
    createdAt: m.createdAt,
    attachments: m.attachments ?? [],
    sender: m.sender,
  }));

  const { messages, sendMessage, isConnected } = useTicketChat(
    ticket ? ticket.id : null,
    initialMessages
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [open, messages]);

  if (!ticket) return null;

  // ── File upload ────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await uploadSupportFile(fd).unwrap();
        if (res.success) {
          setPendingAttachments((prev) => [
            ...prev,
            { tempFileId: res.data.tempFileId, fileUrl: res.data.fileUrl, fileName: res.data.fileName },
          ]);
        }
      }
    } catch {
      toast.error('File upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (idx: number) =>
    setPendingAttachments((prev) => prev.filter((_, i) => i !== idx));

  // ── Send ───────────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!message.trim() && pendingAttachments.length === 0) return;
    // Backend only accepts one tempFileId per message
    const tempFileId = pendingAttachments[0]?.tempFileId;
    sendMessage(message, tempFileId);
    setMessage('');
    setPendingAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const getSenderDisplay = (msg: ChatMessage) => {
    const isOwn = msg.senderId === currentUser?.id;
    if (isOwn) return { isOwn: true, displayName: 'You', displayRole: 'Supporter' };
    const lookup = senderLookup[msg.senderId];
    const rLabel = lookup?.role ?? roleLabel(msg.senderRole);
    const name = lookup?.name ?? msg.senderName ?? rLabel;
    return { isOwn: false, displayName: name, displayRole: rLabel };
  };

  const canSend = (message.trim().length > 0 || pendingAttachments.length > 0) && isConnected && !isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-xl lg:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl bg-navbarBg border-border">
        <DialogHeader className="p-4 sm:p-6 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
              Support Ticket Query
            </DialogTitle>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700">
              <span
                className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full',
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'
                )}
              />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            {ticket?.status !== 'Resolved' && (
              <button
                type="button"
                onClick={handleResolve}
                disabled={isResolving}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50 whitespace-nowrap ml-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {isResolving ? 'Resolving...' : 'Resolve'}
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Inner conversation card */}
        <div className="mx-4 sm:mx-6 my-4 sm:my-5 rounded-xl overflow-hidden flex flex-col">
          {/* Ticket meta header */}
          <div className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 bg-gray-50 dark:bg-gray-800/60 border border-border rounded-t-xl">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Conversation
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ticket ID :{' '}
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  {ticket.ticketId.replace('#', '')}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Issue :{' '}
                <span className="text-gray-700 dark:text-gray-300">{ticket.issueType}</span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Client:</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                {ticket.clientName}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="px-4 sm:px-5 py-4 custom-scrollbar space-y-4 bg-white dark:bg-gray-950 border-x border-border min-h-[220px] max-h-[260px] sm:max-h-[300px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-xs italic">
                {isConnected ? 'No messages yet. Start the conversation!' : 'Connecting to chat...'}
              </div>
            ) : (
              messages.map((msg, index) => {
                const { isOwn, displayName, displayRole } = getSenderDisplay(msg);
                return isOwn ? (
                  /* Supporter (own) — right */
                  <div key={msg.id ?? index} className="flex items-end gap-2.5 justify-end">
                    <div className="min-w-0 max-w-[80%] sm:max-w-[75%]">
                      <div className="bg-[#F5F8FA] dark:bg-gray-800 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
                        {msg.text && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div>
                            {msg.attachments.map((att, i) => (
                              <AttachmentPreview key={i} att={att} isOwn />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right mr-1">
                        {formatTime(msg.createdAt)}
                        <span className="ml-1 text-gray-300 dark:text-gray-600">· {displayRole}</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-indigo-500 dark:text-indigo-400">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  /* Other — left */
                  <div key={msg.id ?? index} className="flex items-end gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 max-w-[80%] sm:max-w-[75%]">
                      <div className="bg-[#F5F8FA] dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                          {displayName}
                        </p>
                        {msg.text && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div>
                            {msg.attachments.map((att, i) => (
                              <AttachmentPreview key={i} att={att} isOwn={false} />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">
                        {formatTime(msg.createdAt)}
                        <span className="ml-1 text-gray-300 dark:text-gray-600">· {displayRole}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white dark:bg-gray-900 mt-4 space-y-2">
            {/* Pending attachments */}
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-1">
                {pendingAttachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                  >
                    <Paperclip className="w-3 h-3 flex-shrink-0" />
                    <span className="max-w-[120px] truncate">{att.fileName}</span>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your message here..."
                rows={3}
                className="w-full px-4 sm:px-5 pt-3.5 pb-1 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent border-none outline-none resize-none"
              />
              <div className="flex items-center justify-between px-4 sm:px-5 pb-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('[SupporterChat] Clip icon clicked');
                      fileInputRef.current?.click();
                    }}
                    disabled={isUploading}
                    className="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-50"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  {isUploading && (
                    <span className="text-[10px] text-gray-400 animate-pulse">Uploading...</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend || isUploading}
                  className={cn(
                    'flex items-center gap-2 px-4 py-1.5 bg-[#1C73E0] cursor-pointer hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm',
                    (!canSend || isUploading) && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  Send
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
