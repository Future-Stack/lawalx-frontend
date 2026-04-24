'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Priority = 'High' | 'Medium' | 'Low';
type TicketStatus = 'open' | 'In progress' | 'Resolved';

interface Ticket {
  id: string;
  ticketId: string;
  clientName: string;
  priority: Priority;
  issueType: string;
  status: TicketStatus;
}

const MOCK_TICKETS: Ticket[] = [
  { id: '1', ticketId: '#0123456', clientName: 'Dianne Russel', priority: 'High', issueType: 'Login Issue', status: 'open' },
  { id: '2', ticketId: '#0123456', clientName: 'Brooklyn Simmons', priority: 'High', issueType: 'Billing Query', status: 'open' },
  { id: '3', ticketId: '#0123456', clientName: 'Darlene Robertson', priority: 'Medium', issueType: 'Feature Request', status: 'In progress' },
  { id: '4', ticketId: '#0123456', clientName: 'Arlene McCoy', priority: 'Low', issueType: 'System Error', status: 'Resolved' },
  { id: '5', ticketId: '#0123456', clientName: 'Marvin McKinney', priority: 'Low', issueType: 'Integration Issue', status: 'Resolved' },
  { id: '6', ticketId: '#0123457', clientName: 'James Wilson', priority: 'High', issueType: 'Account Access', status: 'open' },
  { id: '7', ticketId: '#0123458', clientName: 'Sarah Johnson', priority: 'Medium', issueType: 'Payment Failed', status: 'In progress' },
  { id: '8', ticketId: '#0123459', clientName: 'Michael Brown', priority: 'Low', issueType: 'UI Bug', status: 'Resolved' },
  { id: '9', ticketId: '#0123460', clientName: 'Emily Davis', priority: 'High', issueType: 'Data Loss', status: 'open' },
  { id: '10', ticketId: '#0123461', clientName: 'Robert Miller', priority: 'Medium', issueType: 'Slow Performance', status: 'In progress' },
  { id: '11', ticketId: '#0123462', clientName: 'Linda Moore', priority: 'Low', issueType: 'Export Error', status: 'Resolved' },
];

const TOTAL_COUNT = 500;
const ITEMS_PER_PAGE = 11;

const PRIORITY_STYLES: Record<Priority, string> = {
  High: 'text-red-500 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400',
  Medium: 'text-amber-500 border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400',
  Low: 'text-green-600 border border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400',
};

const STATUS_STYLES: Record<TicketStatus, string> = {
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
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return MOCK_TICKETS.filter((t) => {
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    });
  }, [priorityFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(TOTAL_COUNT / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_COUNT);

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((t) => next.delete(t.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((t) => next.add(t.id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
              <TableHead className="w-10 px-4 border-0">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </TableHead>
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
            {filtered.length === 0 ? (
              <TableRow className="border-0">
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-sm text-gray-500 dark:text-gray-400"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ticket, idx) => (
                <TableRow
                  key={ticket.id}
                  className={cn(
                    'border-0 transition-colors',
                    selectedIds.has(ticket.id)
                      ? 'bg-blue-50/40 dark:bg-blue-900/10'
                      : idx % 2 === 1
                        ? 'bg-[#F7F9FA] dark:bg-gray-800/40 hover:bg-[#eef0f2] dark:hover:bg-gray-800/60'
                        : 'bg-white dark:bg-gray-900 hover:bg-[#F7F9FA] dark:hover:bg-gray-800/30'
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(ticket.id)}
                      onCheckedChange={() => toggleOne(ticket.id)}
                      aria-label={`Select ${ticket.clientName}`}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </TableCell>

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
                        PRIORITY_STYLES[ticket.priority]
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
                        STATUS_STYLES[ticket.status]
                      )}
                    >
                      {ticket.status}
                    </span>
                  </TableCell>

                  {/* Action */}
                  <TableCell className="px-4 py-3">
                    <button
                      className={cn(
                        'px-4 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap',
                        idx === 0
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-[#4881FF] text-[#4881FF] hover:bg-[#4881FF]/20'
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
