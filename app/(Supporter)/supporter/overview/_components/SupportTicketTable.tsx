'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import TicketConversationDialog from './TicketConversationDialog';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useGetAssignedTicketsQuery, useResolveTicketMutation } from '@/redux/api/supporter/supporterTicketApi';

type Priority = 'High' | 'Medium' | 'Low' | string;
type TicketStatus = 'open' | 'In progress' | 'Resolved' | string;

export interface SupporterTableTicket {
  id: string;
  ticketId: string;
  clientName: string;
  priority: Priority;
  issueType: string;
  status: TicketStatus;
  raw?: any;
}

const ITEMS_PER_PAGE = 11;

const PRIORITY_STYLES: Record<string, string> = {
  High: 'text-red-500 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400',
  Medium: 'text-amber-500 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400',
  Low: 'text-green-600 border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400',
};

const STATUS_STYLES: Record<string, string> = {
  'open': 'text-green-600 border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400',
  'In progress': 'text-teal-600 border border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-400',
  'Resolved': 'text-blue-600 border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400',
};

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function SupportTicketTable() {
  const { data: ticketsResponse, isLoading } = useGetAssignedTicketsQuery();
  const [resolveTicket] = useResolveTicketMutation();

  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupporterTableTicket | null>(null);

  const openConversation = (ticket: SupporterTableTicket) => {
    setActiveTicket(ticket);
    setConversationOpen(true);
  };

  const tickets = useMemo(() => {
    if (!ticketsResponse?.data) return [];
    return ticketsResponse.data.map((t) => ({
      id: t.id,
      ticketId: t.customId || t.id,
      clientName: t.user?.full_name || t.user?.username || 'Unknown',
      priority: t.priority as Priority,
      issueType: t.issueType?.[0]?.replace('_', ' ') || 'Support Request',
      status: (t.status === 'InProgress' ? 'In progress' : t.status === 'Open' ? 'open' : t.status) as TicketStatus,
      raw: t,
    }));
  }, [ticketsResponse]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      const mappedStatus = t.status === 'InProgress' ? 'In progress' : t.status === 'Open' ? 'open' : t.status;
      if (statusFilter !== 'all' && mappedStatus !== statusFilter) return false;
      return true;
    });
  }, [priorityFilter, statusFilter, tickets]);

  const TOTAL_COUNT = filtered.length;
  const totalPages = Math.max(1, Math.ceil(TOTAL_COUNT / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE + (TOTAL_COUNT > 0 ? 1 : 0);
  const end = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_COUNT);

  const paginatedTickets = useMemo(() => {
    return filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* Table header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          Support Ticket Query
        </h2>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Priority filter */}
          <Select
            value={priorityFilter}
            onValueChange={(val) => {
              setPriorityFilter(val);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="h-8 text-xs px-3 gap-1.5 border-gray-200 dark:border-gray-700 rounded-lg flex-1 sm:flex-none sm:min-w-[110px]">
              <SelectValue placeholder="Priority" />
              <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              handleFilterChange();
            }}
          >
            <SelectTrigger className="h-8 text-xs px-3 gap-1.5 border-gray-200 dark:border-gray-700 rounded-lg flex-1 sm:flex-none sm:min-w-[110px]">
              <SelectValue placeholder="All Status" />
              <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="In progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-0 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/60">
              {['Ticket ID', 'Client Name', 'Priority', 'Issue Type', 'Status', 'Action'].map(
                (col) => (
                  <TableHead
                    key={col}
                    className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap"
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
                  colSpan={6}
                  className="text-center py-12 text-sm text-gray-500 dark:text-gray-400"
                >
                  Loading tickets...
                </TableCell>
              </TableRow>
            ) : paginatedTickets.length === 0 ? (
              <TableRow className="border-0">
                <TableCell
                  colSpan={6}
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
                    'border-0 transition-colors',
                    idx % 2 === 1
                      ? 'bg-[#F7F9FA] dark:bg-gray-800/40 hover:bg-[#eef0f2] dark:hover:bg-gray-800/60'
                      : 'bg-white dark:bg-gray-900 hover:bg-[#F7F9FA] dark:hover:bg-gray-800/30'
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

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {start} to {end} of{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {TOTAL_COUNT}
          </span>{' '}
          Files
        </p>

        <div className="flex items-center gap-1 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </button>

          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-gray-400 dark:text-gray-500"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  currentPage === p
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Conversation dialog */}
      <TicketConversationDialog
        open={conversationOpen}
        onOpenChange={setConversationOpen}
        ticket={activeTicket}
      />
    </div>
  );
}
