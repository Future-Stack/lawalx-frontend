import React from 'react';
import { cn } from '@/lib/utils';
import type { SupporterTableTicket } from './SupportTicketTable';
import { PRIORITY_STYLES, STATUS_STYLES } from './SupportTicketsHelpers';

interface SupportTicketsMobileViewProps {
  paginatedTickets: SupporterTableTicket[];
  isLoading: boolean;
  openConversation: (ticket: SupporterTableTicket) => void;
  openEnterprisePlan: (ticket: SupporterTableTicket) => void;
}

export default function SupportTicketsMobileView({
  paginatedTickets,
  isLoading,
  openConversation,
  openEnterprisePlan,
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

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 justify-end">
              <button
                onClick={() => openConversation(ticket)}
                title="View Ticket"
                className="p-2 rounded-md text-[#4881FF] bg-[#4881FF]/10 hover:bg-[#4881FF]/20 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
              {ticket.ticketTags?.some(
                (t: { tag?: { key: string } }) =>
                  t.tag?.key === "NEEDS_ENTERPRISE_PLAN",
              ) && (
                <button
                  onClick={() => openEnterprisePlan(ticket)}
                  title="View Enterprise Plan"
                  className="p-2 rounded-md text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
