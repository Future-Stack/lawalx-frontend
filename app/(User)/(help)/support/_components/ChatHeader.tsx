import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ChatHeaderProps {
  selectedTicket: any;
  isConnected: boolean;
  onBack: () => void;
  assignedTo: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedTicket,
  isConnected,
  onBack,
  assignedTo,
}) => {
  return (
    <div className="min-h-20 flex items-center justify-between px-4 sm:px-6 bg-cardBackground2 border-b border-gray-200 dark:border-gray-700">
      {/* Back button for mobile */}
      <button
        onClick={onBack}
        className="lg:hidden mr-3 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Left - Title + ID */}
      <div className="flex items-center gap-6 sm:gap-8 min-w-0 flex-1">
        <div className="truncate">
          <h3 className="text-[0.825rem] xs:text-sm sm:text-base font-medium text-gray-900 dark:text-gray-300 tracking-wider truncate">
            {selectedTicket.subject || selectedTicket.title}
          </h3>
          <p className="text-[0.7rem] xs:text-xs text-gray-500 dark:text-gray-400">
            ID: {selectedTicket.customId || selectedTicket.id}
          </p>
        </div>
      </div>

      {/* Right - Connection status + Assigned To */}
      <div className="text-right min-w-0 flex-shrink-0 flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${isConnected
              ? 'bg-green-500'
              : 'bg-gray-400 dark:bg-gray-600'
              }`}
          />
          <span className="text-[0.65rem] text-gray-400 dark:text-gray-500">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
        <p className="text-[0.7rem] xs:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          Assigned to
        </p>
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-300 truncate max-w-32 sm:max-w-none">
          {assignedTo}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
