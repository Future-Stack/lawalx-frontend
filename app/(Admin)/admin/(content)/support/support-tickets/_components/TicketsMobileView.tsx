import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/redux/api/admin/support/adminSupportTicketApi';
import { StatusBadge, PriorityBadge } from './TicketsBadges';

interface TicketsMobileViewProps {
  tickets: Ticket[];
  isLoading: boolean;
  setViewTicket: (ticket: Ticket) => void;
  setEditTicket: (ticket: Ticket) => void;
  handleOpenWorkload: (ticket: Ticket) => void;
}

export default function TicketsMobileView({
  tickets,
  isLoading,
  setViewTicket,
  setEditTicket,
  handleOpenWorkload,
}: TicketsMobileViewProps) {
  return (
    <div className="xl:hidden space-y-4 p-4">
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">No tickets found.</div>
      ) : (
        tickets.map((ticket: Ticket) => (
          <div
            key={ticket.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ticket.ticketId}
                </span>
                <StatusBadge status={ticket.status} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewTicket(ticket)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  aria-label="View ticket"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditTicket(ticket)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  aria-label="Edit ticket"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden',
                  !ticket.company.imageUrl && ticket.company.iconBg
                )}
              >
                {ticket.company.imageUrl ? (
                  <img
                    src={(process.env.NEXT_PUBLIC_BASE_URL || '').replace('/api/v1', '') + ticket.company.imageUrl}
                    alt={ticket.company.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  ticket.company.iconText
                )}
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {ticket.company.name}
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200 mr-1">Subject:</span>
              {ticket.subject}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-800 dark:text-gray-200 mr-1">Desc:</span>
              <span className="line-clamp-2 inline">{ticket.description}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                <PriorityBadge priority={ticket.priority} />
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {ticket.lastUpdated}
              </span>
            </div>

            {ticket.ticketTags && ticket.ticketTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {ticket.ticketTags.map((t) => (
                  <span
                    key={t.id}
                    className="text-[10px] px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300"
                    title={t.name}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Assigned To:</span>
              <div className="flex items-center gap-2">
                {ticket.assignedTo ? (
                  <>
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center border border-border">
                      {ticket.assignedToImage ? (
                        <img
                          src={(process.env.NEXT_PUBLIC_BASE_URL || '').replace('/api/v1', '') + ticket.assignedToImage}
                          alt={ticket.assignedTo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          {ticket.assignedTo.initials || ticket.assignedTo.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[110px]">
                      {ticket.assignedTo.name}
                    </span>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenWorkload(ticket)}
                    className="text-xs text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap"
                  >
                    + Assign Supporter
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
