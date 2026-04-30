import React from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import type { ChatAttachment } from '@/types/chat';

interface ChatInputProps {
  newMessage: string;
  setNewMessage: (msg: string) => void;
  pendingAttachments: ChatAttachment[];
  onRemoveAttachment: (idx: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  isUploading: boolean;
  isConnected: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const ChatInput: React.FC<ChatInputProps> = ({
  newMessage,
  setNewMessage,
  pendingAttachments,
  onRemoveAttachment,
  onFileSelect,
  onSendMessage,
  isUploading,
  isConnected,
  fileInputRef,
}) => {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-cardBackground2">
      {pendingAttachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {pendingAttachments.map((att, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs border border-gray-200 dark:border-gray-700"
            >
              <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="max-w-[140px] truncate">{att.fileName}</span>
              <button
                onClick={() => onRemoveAttachment(i)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          multiple
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <textarea
          placeholder={isUploading ? 'Uploading file...' : 'Type your message...'}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          rows={1}
          className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-sm text-gray-900 dark:text-white resize-none"
        />

        <button
          onClick={onSendMessage}
          disabled={(!newMessage.trim() && pendingAttachments.length === 0) || isUploading || !isConnected}
          className="px-5 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0"
        >
          <span className="hidden sm:inline">Send</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
