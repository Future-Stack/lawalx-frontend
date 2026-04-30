import React from 'react';
import { User, FileIcon } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: any;
  isConnected: boolean;
  selectedTicket: any;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  roleLabel: (role?: string) => string;
  isImageUrl: (url: string) => boolean;
  BASE_URL: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  isConnected,
  selectedTicket,
  messagesEndRef,
  roleLabel,
  isImageUrl,
  BASE_URL,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-navbarBg scrollbar-hide">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="mb-2 text-sm text-center">
            {selectedTicket?.description || 'No description provided.'}
          </p>
          <p className="text-xs italic">
            {isConnected ? 'No messages yet. Start the conversation!' : 'Connecting to chat...'}
          </p>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isOwn = msg.senderId === currentUser?.id;
          const rLabel = isOwn ? 'Client' : roleLabel(msg.senderRole);
          const senderDisplay = isOwn
            ? 'You'
            : (msg.sender?.full_name || msg.sender?.username || msg.senderName || rLabel);
          
          return (
            <div
              key={msg.id ?? index}
              className={`flex gap-4 ${isOwn ? 'flex-row-reverse' : ''}`}
            >
              <div className="shrink-0">
                {isOwn ? (
                  <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                ) : (
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {senderDisplay.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className={`max-w-[85%] sm:max-w-md ${isOwn ? 'text-right' : ''}`}>
                {!isOwn && (
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {senderDisplay}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 text-left ${isOwn
                    ? 'bg-gray-800 dark:bg-white/20 text-white'
                    : 'bg-cardBackground2 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                >
                  {msg.text && (
                    <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                  )}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.attachments.map((att, i) => {
                        const fullUrl = att.fileUrl.startsWith('http') ? att.fileUrl : `${BASE_URL}/${att.fileUrl}`;
                        const isImg = isImageUrl(att.fileUrl);
                        return isImg ? (
                          <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className="block">
                            <img src={fullUrl} alt={att.fileName} className="max-w-[200px] max-h-[160px] rounded-lg object-cover" />
                          </a>
                        ) : (
                          <a key={i} href={fullUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-1 text-xs underline truncate max-w-[220px] ${isOwn ? 'text-blue-200' : 'text-blue-600 dark:text-blue-400'}`}>
                            <FileIcon className="w-3 h-3 flex-shrink-0" />
                            {att.fileName}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                  <span className="ml-1 text-gray-400 dark:text-gray-600">· {rLabel}</span>
                </p>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
