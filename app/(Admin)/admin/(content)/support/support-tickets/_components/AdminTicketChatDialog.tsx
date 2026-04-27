'use client';

import { useRef, useEffect, useState } from 'react';
import { Paperclip, Send, X, FileIcon, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTicketChat } from '@/hooks/useTicketChat';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';
import { 
  useGetAdminTicketDetailsQuery,
  useResolveTicketByAdminMutation,
} from '@/redux/api/admin/support/adminSupportTicketApi';
import { useUploadSupportFileMutation } from '@/redux/api/users/support/supportApi';
import type { ChatAttachment, ChatMessage } from '@/types/chat';
import type { Ticket } from '@/redux/api/admin/support/adminSupportTicketApi';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? '';

interface AdminTicketChatDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
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

// ── Message bubble ────────────────────────────────────────────────────────────

interface BubbleProps {
  msg: ChatMessage;
  isOwn: boolean;
  displayRole: string;
  displayName: string;
}

function MessageBubble({ msg, isOwn, displayRole, displayName }: BubbleProps) {
  return isOwn ? (
    <div className="flex items-end gap-2.5 justify-end">
      <div className="min-w-0 max-w-[78%]">
        {/* Bubble */}
        <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
          {msg.text && (
            <p className="text-xs text-white leading-relaxed">{msg.text}</p>
          )}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {msg.attachments.map((att, i) => (
                <AttachmentPreview key={i} att={att} isOwn />
              ))}
            </div>
          )}
        </div>
        {/* Timestamp + role */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right mr-1">
          {formatTime(msg.createdAt)}
          <span className="ml-1 text-gray-300 dark:text-gray-600">· Admin</span>
        </p>
      </div>
      {/* Admin avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
        A
      </div>
    </div>
  ) : (
    <div className="flex items-end gap-2.5">
      {/* Sender avatar */}
      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[11px] font-bold flex-shrink-0 shadow-sm">
        {displayName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 max-w-[78%]">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-0.5">
            {displayName}
          </p>
          {msg.text && (
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{msg.text}</p>
          )}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {msg.attachments.map((att, i) => (
                <AttachmentPreview key={i} att={att} isOwn={false} />
              ))}
            </div>
          )}
        </div>
        {/* Timestamp + role */}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">
          {formatTime(msg.createdAt)}
          <span className="ml-1 text-gray-300 dark:text-gray-600">· {displayRole}</span>
        </p>
      </div>
    </div>
  );
}

function AttachmentPreview({ att, isOwn }: { att: ChatAttachment; isOwn: boolean }) {
  const fullUrl = att.fileUrl.startsWith('http') ? att.fileUrl : `${BASE_URL}/${att.fileUrl}`;
  const isImg = isImageUrl(att.fileUrl);
  return isImg ? (
    <a href={fullUrl} target="_blank" rel="noreferrer" className="block">
      <img
        src={fullUrl}
        alt={att.fileName}
        className="max-w-[180px] max-h-[140px] rounded-lg object-cover border border-white/20"
      />
    </a>
  ) : (
    <a
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex items-center gap-1.5 text-xs underline truncate max-w-[200px]',
        isOwn ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'
      )}
    >
      <FileIcon className="w-3 h-3 flex-shrink-0" />
      {att.fileName}
    </a>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminTicketChatDialog({
  ticket,
  open,
  onClose,
}: AdminTicketChatDialogProps) {
  const [text, setText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUser = useAppSelector(selectCurrentUser);
  const [uploadSupportFile] = useUploadSupportFileMutation();
  const [resolveTicket, { isLoading: isResolving }] = useResolveTicketByAdminMutation();

  const handleResolve = async () => {
    console.log('[AdminChat] CLICKED RESOLVE BUTTON');
    if (!ticket?.id) {
      console.error('[AdminChat] No ticket ID found');
      toast.error('Ticket ID not found');
      return;
    }
    try {
      await resolveTicket(ticket.id).unwrap();
      toast.success('Ticket marked as resolved');
      onClose();
    } catch (err: any) {
      console.error('[AdminChat] resolve error:', err);
      toast.error(err?.data?.message || 'Failed to resolve ticket');
    }
  };

  // Fetch full ticket details for initial message history
  const { data: ticketDetails, isLoading: isLoadingDetails } = useGetAdminTicketDetailsQuery(
    ticket?.id ?? '',
    { skip: !open || !ticket?.id, refetchOnMountOrArgChange: true }
  );

  // Build a senderId → { name, role } lookup from the ticket detail data
  const senderLookup: Record<string, { name: string; role: string }> = {};
  if (ticketDetails?.data) {
    const d = ticketDetails.data;
    // Ticket owner = Client
    if (d.userId) {
      senderLookup[d.userId] = {
        name: d.user?.username ?? 'Client',
        role: 'Client',
      };
    }
    // Assigned supporters
    d.assignments?.forEach((a) => {
      if (a.user) {
        // assignment doesn't expose userId directly — use role hint for fallback
        // real-time messages will use msg.sender instead
      }
    });
  }

  // Build initial messages from REST response
  const initialMessages = (ticketDetails?.data?.messages ?? []).map((m) => ({
    id: m.id,
    ticketId: ticket?.id ?? '',
    text: m.text,
    senderId: m.senderId,
    senderName: senderLookup[m.senderId]?.name,
    senderRole: senderLookup[m.senderId]?.role,
    createdAt: m.createdAt,
    attachments: m.attachments ?? [],
  }));

  const { messages, sendMessage, isConnected } = useTicketChat(
    ticket ? ticket.id : null,   // connect as soon as dialog mounts, not only when open
    initialMessages
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
    console.log('[AdminChat] handleSend called. text:', text, 'attachments:', pendingAttachments.length);
    if (!text.trim() && pendingAttachments.length === 0) return;
    // Backend only accepts one tempFileId per message
    const tempFileId = pendingAttachments[0]?.tempFileId;
    sendMessage(text, tempFileId);
    setText('');
    setPendingAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Resolve sender display info ────────────────────────────────────────────

  const getSenderDisplay = (msg: ChatMessage) => {
    const isOwn = msg.senderId === currentUser?.id;
    if (isOwn) return { displayName: 'You', displayRole: 'Admin', isOwn: true };

    // Real-time socket messages include full sender object — use it first
    if (msg.sender) {
      const name = msg.sender.full_name || msg.sender.username;
      return { displayName: name, displayRole: roleLabel(msg.senderRole), isOwn: false };
    }

    // Fallback: senderLookup (built from REST ticket details)
    const lookup = senderLookup[msg.senderId];
    if (lookup) return { displayName: lookup.name, displayRole: lookup.role, isOwn: false };

    const rLabel = roleLabel(msg.senderRole);
    const name = msg.senderName || rLabel;
    return { displayName: name, displayRole: rLabel, isOwn: false };
  };

  const canSend = text.trim().length > 0 || pendingAttachments.length > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 gap-0 sm:max-w-2xl focus:outline-none overflow-hidden rounded-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 sm:text-left pr-12">
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
              Reply to Customer
            </DialogTitle>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700">
              <span
                className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full',
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-600'
                )}
              />
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {isConnected ? 'Live' : 'Connecting...'}
              </span>
            </div>
            {ticket?.status !== 'Resolved' && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 whitespace-nowrap ml-1"
                onClick={handleResolve}
                disabled={isResolving}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {isResolving ? 'Resolving...' : 'Mark as Resolve'}
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Ticket meta */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-x-6 gap-y-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ticket:{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {ticket.ticketId}
            </span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {ticket.subject}
          </p>
          {ticket.assignedTo && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Assigned:{' '}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {ticket.assignedTo.name}
              </span>
            </p>
          )}
        </div>

        {/* Messages */}
        <div className="px-6 py-4 space-y-4 min-h-[280px] max-h-[380px] overflow-y-auto">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gray-400">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                {isConnected
                  ? 'No messages yet. Start the conversation!'
                  : 'Connecting to chat...'}
              </p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const { displayName, displayRole, isOwn } = getSenderDisplay(msg);
              return (
                <MessageBubble
                  key={msg.id ?? i}
                  msg={msg}
                  isOwn={isOwn}
                  displayName={displayName}
                  displayRole={displayRole}
                />
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 pb-5 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Pending attachments */}
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  <Paperclip className="w-3 h-3 flex-shrink-0" />
                  <span className="max-w-[140px] truncate">{att.fileName}</span>
                  <button
                    onClick={() => removeAttachment(i)}
                    className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Textarea + file input */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your reply..."
              rows={3}
              className="w-full px-4 pt-3.5 pb-1 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-white dark:bg-gray-900 border-none outline-none resize-none"
            />
            <div className="flex items-center justify-between px-4 pb-3 bg-white dark:bg-gray-900">
              <button
                type="button"
                onClick={() => {
                  console.log('[AdminChat] Clip icon clicked');
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
                className={cn(
                  "p-2 -m-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center justify-center",
                  isUploading && "opacity-50 pointer-events-none"
                )}
                aria-label="Attach file"
              >
                <Paperclip className="w-5 h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                  onChange={handleFileChange}
                />
              </button>
              <span className="text-xs text-gray-300 dark:text-gray-600">
                {isUploading ? 'Uploading...' : 'Enter to send · Shift+Enter for new line'}
              </span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" className="h-9" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5 flex items-center gap-2"
              onClick={handleSend}
              disabled={!canSend || isUploading}
            >
              Send Reply
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
