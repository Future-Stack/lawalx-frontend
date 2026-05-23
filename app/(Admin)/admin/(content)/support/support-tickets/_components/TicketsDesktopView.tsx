import React from 'react';
import { Eye, Pencil } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/redux/api/admin/support/adminSupportTicketApi';
import { StatusBadge, PriorityBadge } from './TicketsBadges';

interface TicketsDesktopViewProps {
  tickets: Ticket[];
  isLoading: boolean;
  setViewTicket: (ticket: Ticket) => void;
  setEditTicket: (ticket: Ticket) => void;
  handleOpenWorkload: (ticket: Ticket) => void;
}

export default function TicketsDesktopView({
  tickets,
  isLoading,
  setViewTicket,
  setEditTicket,
  handleOpenWorkload,
}: TicketsDesktopViewProps) {
  return (
    <div className="hidden xl:block">
      <Table wrapperClassName="overflow-visible">
        <TableHeader>
          <TableRow className="bg-navbarBg hover:bg-navbarBg">
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Ticket ID
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Company Name
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Subject
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Status
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Last Updated
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Priority
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Tags
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Assigned To
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Description
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="py-12 text-center text-sm text-gray-400">
                Loading tickets...
              </TableCell>
            </TableRow>
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
              >
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket: Ticket) => (
              <TableRow
                key={ticket.id}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-border'
                )}
              >

                {/* Ticket ID */}
                <TableCell className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {ticket.ticketId}
                  </span>
                </TableCell>

                {/* Company */}
                <TableCell className="px-4 py-3">
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
                </TableCell>

                {/* Subject */}
                <TableCell className="px-4 py-3 max-w-[180px]">
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                    {ticket.subject}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3">
                  <StatusBadge status={ticket.status} />
                </TableCell>

                {/* Last Updated */}
                <TableCell className="px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {ticket.lastUpdated}
                  </span>
                </TableCell>

                {/* Priority */}
                <TableCell className="px-4 py-3">
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>

                {/* Tags */}
                <TableCell className="px-4 py-3">
                  {ticket.ticketTags && ticket.ticketTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {ticket.ticketTags.slice(0, 2).map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 whitespace-nowrap"
                          title={t.name}
                        >
                          {t.name}
                        </span>
                      ))}
                      {ticket.ticketTags.length > 2 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 cursor-help" title={ticket.ticketTags.slice(2).map(t => t.name).join(', ')}>
                          +{ticket.ticketTags.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">...</span>
                  )}
                </TableCell>

                {/* Assigned To */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {ticket.assignedTo ? (
                      <>
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center border border-border">
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
                </TableCell>
                
                {/* Description */}
                <TableCell className="px-4 py-3 max-w-[200px]">
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                    {ticket.description}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="px-4 py-3">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
