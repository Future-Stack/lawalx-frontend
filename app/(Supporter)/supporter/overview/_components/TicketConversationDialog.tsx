'use client';

import { useRef, useEffect, useState } from 'react';
import { Paperclip, SmilePlus, Pen, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useTicketChat } from '@/hooks/useTicketChat';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentUser } from '@/redux/features/auth/authSlice';

interface Ticket {
  id: string;
  ticketId: string;
  clientName: string;
  issueType: string;
}

interface TicketConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: Ticket | null;
}

export default function TicketConversationDialog({
  open,
  onOpenChange,
  ticket,
}: TicketConversationDialogProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector(selectCurrentUser);

  const { messages, sendMessage, isConnected } = useTicketChat(
    open && ticket ? ticket.id : null
  );

  // Scroll to bottom when dialog opens or new messages arrive
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    }
  }, [open, messages]);

  if (!ticket) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-xl lg:max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl">
        {/* Dialog title */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight">
            Support Ticket Query
          </DialogTitle>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'
                }`}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Inner conversation card */}
        <div className="mx-4 sm:mx-6 my-4 sm:my-5 rounded-xl overflow-hidden flex flex-col">

          {/* Ticket meta header */}
          <div className="flex items-start justify-between gap-4 px-4 sm:px-5 py-3.5 border-gray-200 dark:border-gray-700 bg-[#F7F9FA] dark:bg-gray-900">
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
                <span className="text-gray-700 dark:text-gray-300">
                  {ticket.issueType}
                </span>
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Client:
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                {ticket.clientName}
              </p>
            </div>
          </div>

          {/* Messages scrollable area */}
          <div className="px-4 sm:px-5 py-4 space-y-4 dark:bg-gray-950 min-h-[220px] max-h-[260px] sm:max-h-[300px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-xs italic">
                {isConnected
                  ? 'No messages yet. Start the conversation!'
                  : 'Connecting to chat...'}
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUser?.id;
                return isOwn ? (
                  /* Supporter (own) — right side */
                  <div key={msg.id ?? index} className="flex items-start gap-2.5 justify-end">
                    <div className="min-w-0 max-w-[80%] sm:max-w-[75%]">
                      <div className="bg-[#F5F8FA] dark:bg-gray-800 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm">
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right mr-1">
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                    {/* Supporter avatar */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-indigo-500 dark:text-indigo-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  /* Customer — left side */
                  <div key={msg.id ?? index} className="flex items-start gap-2.5">
                    {/* Avatar */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mt-1 shadow-sm">
                      {msg.senderName?.charAt(0)?.toUpperCase() ?? 'C'}
                    </div>
                    <div className="min-w-0 max-w-[80%] sm:max-w-[75%]">
                      <div className="bg-[#F5F8FA] dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                        {msg.senderName && (
                          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {msg.text}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-1">
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="bg-white dark:bg-gray-900 mt-5">
            <div className='border rounded-md'>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your message here..."
                rows={3}
                className="w-full px-4 sm:px-5 pt-3.5 pb-1 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent border-none outline-none resize-none"
              />
              <div className="flex items-end justify-end px-4 sm:px-5 pb-3.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    aria-label="Attach file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                    aria-label="Format"
                  >
                    <Pen className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* Send button */}
            <div className="flex items-end justify-end px-4 sm:px-5 pb-3.5 mt-5">
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || !isConnected}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 bg-[#1C73E0] hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm cursor-pointer',
                  (!message.trim() || !isConnected) && 'opacity-70 cursor-not-allowed'
                )}
              >
                Send
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
