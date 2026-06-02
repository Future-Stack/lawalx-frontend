import React from 'react';
import { cn } from '@/lib/utils';
import type { SupporterTableTicket } from './SupportTicketTable';
import { PRIORITY_STYLES, STATUS_STYLES } from './SupportTicketsHelpers';

interface SupportTicketsMobileViewProps {
  paginatedTickets: SupporterTableTicket[];
  isLoading: boolean;
  openConversation: (ticket: SupporterTableTicket) => void;
}

export default function SupportTicketsMobileView({
  paginatedTickets,
  isLoading,
  openConversation,
}: SupportTicketsMobileViewProps) {
  return (
    <div className="lg:hidden space-y-4 p-4">
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading tickets...
        </div>
      ) : paginatedTickets.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No tickets found.
        </div>
      ) : (
        paginatedTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 break-all">
                {ticket.ticketId}
              </span>
              <span
                className={cn(
                  'inline-flex flex-shrink-0 items-center justify-center px-2 py-0.5 rounded text-[10px] font-medium',
                  STATUS_STYLES[ticket.status] || 'text-gray-600 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {ticket.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1 min-w-[120px]">
                {ticket.clientName}
              </div>
              <span
                className={cn(
                  'inline-flex flex-shrink-0 items-center justify-center px-2 py-0.5 rounded text-[10px] font-medium',
                  PRIORITY_STYLES[ticket.priority] || 'text-gray-600 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                )}
              >
                {ticket.priority}
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 break-all">
              <span className="font-medium mr-1 text-gray-800 dark:text-gray-200">Issue Type:</span>
              {ticket.issueType}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium mr-1 text-gray-800 dark:text-gray-200">Desc:</span>
              <span className="line-clamp-2 inline break-all">{ticket.description}</span>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => openConversation(ticket)}
                className={cn(
                  'w-full py-2 rounded text-sm font-medium transition-colors cursor-pointer border border-[#4881FF] text-[#4881FF] hover:bg-[#4881FF]/20'
                )}
              >
                Open Ticket
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
