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
  openEnterprisePlan: (ticket: Ticket) => void;
}

export default function TicketsMobileView({
  tickets,
  isLoading,
  setViewTicket,
  setEditTicket,
  handleOpenWorkload,
  openEnterprisePlan,
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ticket.ticketId}
                </span>
                <div className="flex-shrink-0">
                  <StatusBadge status={ticket.status} />
                </div>
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
                {ticket.ticketTags?.some(
                  (t: { name: string; key?: string }) =>
                    t.key === "NEEDS_ENTERPRISE_PLAN" || t.name === "Needs_Enterprise_Plan"
                ) && (
                  <button
                    onClick={() => openEnterprisePlan(ticket)}
                    title="View Enterprise Plan"
                    className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
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

            <div className="flex items-center gap-2.5 min-w-0">
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
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                {ticket.company.name}
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 break-all">
              <span className="font-semibold text-gray-800 dark:text-gray-200 mr-1">Subject:</span>
              {ticket.subject}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-all">
              <span className="font-semibold text-gray-800 dark:text-gray-200 mr-1">Desc:</span>
              {ticket.description}
            </div>

            <div className="flex flex-wrap items-center justify-between text-sm gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">Priority:</span>
                <div className="flex-shrink-0">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
              <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {ticket.lastUpdated}
              </span>
            </div>

            {ticket.ticketTags && ticket.ticketTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {ticket.ticketTags.map((t) => (
                  <span
                    key={t.id}
                    className="text-xs px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 max-w-full truncate"
                    title={t.name}
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Assigned To:</span>
              <div className="flex items-center gap-2 min-w-0">
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
