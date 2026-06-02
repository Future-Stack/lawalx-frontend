import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { SupporterTableTicket } from './SupportTicketTable';
import { PRIORITY_STYLES, STATUS_STYLES } from './SupportTicketsHelpers';

interface SupportTicketsDesktopViewProps {
  paginatedTickets: SupporterTableTicket[];
  isLoading: boolean;
  openConversation: (ticket: SupporterTableTicket) => void;
}

export default function SupportTicketsDesktopView({
  paginatedTickets,
  isLoading,
  openConversation,
}: SupportTicketsDesktopViewProps) {
  return (
    <div className="hidden lg:block">
      <Table wrapperClassName="overflow-visible">
        <TableHeader>
          <TableRow className="border-0 bg-navbarBg hover:bg-navbarBg">
            {['Ticket ID', 'Client Name', 'Priority', 'Issue Type', 'Status', 'Description', 'Action'].map(
              (col) => (
                <TableHead
                  key={col}
                  className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap border-b border-border"
                >
                  {col}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow className="border-0">
              <TableCell
                colSpan={7}
                className="text-center py-12 text-sm text-gray-500 dark:text-gray-400"
              >
                Loading tickets...
              </TableCell>
            </TableRow>
          ) : paginatedTickets.length === 0 ? (
            <TableRow className="border-0">
              <TableCell
                colSpan={7}
                className="text-center py-12 text-sm text-gray-500 dark:text-gray-400"
              >
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedTickets.map((ticket, idx) => (
              <TableRow
                key={ticket.id}
                className={cn(
                  'border-0 transition-colors border-b border-border',
                  idx % 2 === 1
                    ? 'bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                )}
              >
                {/* Ticket ID */}
                <TableCell className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  {ticket.ticketId}
                </TableCell>

                {/* Client Name */}
                <TableCell className="px-4 py-3 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
                  {ticket.clientName}
                </TableCell>

                {/* Priority */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center px-3 py-0.5 rounded text-xs font-medium',
                      PRIORITY_STYLES[ticket.priority] || 'text-gray-600 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                    )}
                  >
                    {ticket.priority}
                  </span>
                </TableCell>

                {/* Issue Type */}
                <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {ticket.issueType}
                </TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center justify-center px-3 py-0.5 rounded text-xs font-medium',
                      STATUS_STYLES[ticket.status] || 'text-gray-600 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
                    )}
                  >
                    {ticket.status}
                  </span>
                </TableCell>

                {/* Description */}
                <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-[200px]">
                  <span className="truncate block">
                    {ticket.description}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="px-4 py-3">
                  <button
                    onClick={() => openConversation(ticket)}
                    className={cn(
                      'px-4 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap cursor-pointer border border-[#4881FF] text-[#4881FF] hover:bg-[#4881FF]/20'
                    )}
                  >
                    Open
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
