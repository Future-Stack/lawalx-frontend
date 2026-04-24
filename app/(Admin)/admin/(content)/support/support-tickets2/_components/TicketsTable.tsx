'use client';

import React, { useState, useMemo } from 'react';
import { Search, Eye, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import TicketDetailsDialog from './TicketDetailsDialog';
import TicketEditDialog from './TicketEditDialog';
import TeamWorkloadDialog from './TeamWorkloadDialog';
import AssignTicketDialog from './AssignTicketDialog';
import type { Ticket, Employee, TicketStatus, TicketPriority } from './types';

// ── Mock data ─────────────────────────────────────────────────────────────────

const ISSUE_DESCRIPTION =
  `Hello Support Team,\nI'm trying to export our analytics data to CSV format but keep getting an error message. When I click on the "Export to CSV" button in the Reports section, the loading spinner appears for about 10 seconds and then displays "Export Failed: Unknown Error".\nI've tried this on multiple browsers (Chrome, Firefox, and Edge) with the same result. This functionality was working fine last week. Could you please look into this issue as soon as possible? We need this data for our quarterly review.`;

const ADMIN_NOTE =
  "Customer reported this issue after the v2.4.0 deployment. live verified their account is active and they're on the Enterprise plan. The issue seems to be";

const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    ticketId: '#CN25204',
    company: { name: 'Acme', iconBg: 'bg-blue-500', iconText: 'A' },
    subject: 'Unable to export data to CSV format',
    status: 'Opened',
    lastUpdated: '2 hours ago',
    priority: 'High',
    assignedTo: null,
    description: ISSUE_DESCRIPTION,
    createdAt: '3-July-2025',
    updatedAt: '3-July-2025',
    adminNote: ADMIN_NOTE,
  },
  {
    id: '2',
    ticketId: '#CN25205',
    company: { name: 'Global Tech', iconBg: 'bg-purple-500', iconText: 'G' },
    subject: 'Chart render failed',
    status: 'Opened',
    lastUpdated: '4 hours ago',
    priority: 'High',
    assignedTo: { name: 'Leslie Alexander', initials: 'LA', role: 'Frontend Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '3-July-2025',
    updatedAt: '3-July-2025',
  },
  {
    id: '3',
    ticketId: '#CN25206',
    company: { name: 'Tech Stark', iconBg: 'bg-green-500', iconText: 'T' },
    subject: "I don't know what happen...",
    status: 'Resolved',
    lastUpdated: 'Yesterday',
    priority: 'Medium',
    assignedTo: { name: 'Annette Black', initials: 'AB', role: 'Support Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '26-Jun-2025',
  },
  {
    id: '4',
    ticketId: '#CN25207',
    company: { name: 'Next Gen', iconBg: 'bg-sky-500', iconText: 'N' },
    subject: 'Chart render failed',
    status: 'Resolved',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Low',
    assignedTo: { name: 'Arlene McCoy', initials: 'AM', role: 'DevOPS Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
  {
    id: '5',
    ticketId: '#CN25208',
    company: { name: 'Softvence', iconBg: 'bg-amber-500', iconText: 'S' },
    subject: 'Chart render failed',
    status: 'Resolved',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Normal',
    assignedTo: { name: 'Debian Junior', initials: 'DJ', role: 'Backend Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
  {
    id: '6',
    ticketId: '#CN25209',
    company: { name: 'Next Gen', iconBg: 'bg-sky-500', iconText: 'N' },
    subject: 'Chart render failed',
    status: 'In Progress',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Low',
    assignedTo: { name: 'Arlene McCoy', initials: 'AM', role: 'DevOPS Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
  {
    id: '7',
    ticketId: '#CN25210',
    company: { name: 'Acme', iconBg: 'bg-blue-500', iconText: 'A' },
    subject: 'Chart render failed',
    status: 'In Progress',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Normal',
    assignedTo: { name: 'Kathryn Murphy', initials: 'KM', role: 'DevOPS Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
    adminNote: ADMIN_NOTE,
  },
  {
    id: '8',
    ticketId: '#CN25211',
    company: { name: 'Global Tech', iconBg: 'bg-purple-500', iconText: 'G' },
    subject: 'Chart render failed',
    status: 'In Progress',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Low',
    assignedTo: { name: 'Debian Junior', initials: 'DJ', role: 'Backend Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
  {
    id: '9',
    ticketId: '#CN25212',
    company: { name: 'Tech Stark', iconBg: 'bg-green-500', iconText: 'T' },
    subject: 'Chart render failed',
    status: 'In Progress',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Normal',
    assignedTo: { name: 'Annette Black', initials: 'AB', role: 'Support Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
  {
    id: '10',
    ticketId: '#CN25213',
    company: { name: 'Softvence', iconBg: 'bg-amber-500', iconText: 'S' },
    subject: 'Chart render failed',
    status: 'In Progress',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Low',
    assignedTo: { name: 'Leslie Alexander', initials: 'LA', role: 'Frontend Eng.' },
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
  {
    id: '11',
    ticketId: '#CN25214',
    company: { name: 'Acme', iconBg: 'bg-blue-500', iconText: 'A' },
    subject: 'Chart render failed',
    status: 'In Progress',
    lastUpdated: 'Jun 25, 10:20AM',
    priority: 'Normal',
    assignedTo: null,
    description: ISSUE_DESCRIPTION,
    createdAt: '25-Jun-2025',
    updatedAt: '25-Jun-2025',
  },
];

const ITEMS_PER_PAGE = 11;
const TOTAL_COUNT = 500;

// ── Badge helpers ─────────────────────────────────────────────────────────────

const statusStyles: Record<TicketStatus, string> = {
  Opened:
    'text-orange-600 bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400',
  Resolved:
    'text-blue-600 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  'In Progress':
    'text-teal-600 bg-teal-50 border border-teal-200 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400',
};

const priorityStyles: Record<TicketPriority, string> = {
  High: 'text-red-600 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  Medium:
    'text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
  Low: 'text-green-600 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  Normal:
    'text-gray-600 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
};

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap',
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap',
        priorityStyles[priority]
      )}
    >
      {priority}
    </span>
  );
}

// ── Pagination helper ─────────────────────────────────────────────────────────

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

// ── Main Component ────────────────────────────────────────────────────────────

export default function TicketsTable() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog state
  const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);

  // Assign flow: step 1 → TeamWorkload, step 2 → AssignTicket
  const [workloadTicket, setWorkloadTicket] = useState<Ticket | null>(null);
  const [confirmData, setConfirmData] = useState<{ ticket: Ticket; employee: Employee } | null>(null);

  const handleOpenWorkload = (ticket: Ticket) => {
    setWorkloadTicket(ticket);
    setConfirmData(null);
  };
  const handleAssignEmployee = (employee: Employee) => {
    if (workloadTicket) setConfirmData({ ticket: workloadTicket, employee });
  };
  const handleBackToWorkload = () => setConfirmData(null);
  const handleConfirmAssign = () => {
    setWorkloadTicket(null);
    setConfirmData(null);
  };
  const handleCloseAssignFlow = () => {
    setWorkloadTicket(null);
    setConfirmData(null);
  };

  const filtered = useMemo(() => {
    return MOCK_TICKETS.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        t.ticketId.toLowerCase().includes(q) ||
        t.company.name.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.assignedTo?.name.toLowerCase().includes(q) ?? false);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [search, statusFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(TOTAL_COUNT / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_COUNT);

  const allSelected =
    filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      filtered.forEach((t) => next.delete(t.id));
    } else {
      filtered.forEach((t) => next.add(t.id));
    }
    setSelectedIds(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
        {/* ── Filters bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            Support Tickets
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Status filter */}
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as TicketStatus | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[148px] text-sm h-9">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Opened">Opened</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                setPriorityFilter(v as TicketPriority | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[148px] text-sm h-9">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── shadcn Table ─────────────────────────────────────────────── */}
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
              <TableHead className="w-10 px-4">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
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
                Assigned To
              </TableHead>
              <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className={cn(
                    'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                    selectedIds.has(ticket.id) && 'bg-blue-50/50 dark:bg-blue-900/10'
                  )}
                >
                  {/* Checkbox */}
                  <TableCell className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(ticket.id)}
                      onCheckedChange={() => toggleOne(ticket.id)}
                      aria-label={`Select ${ticket.ticketId}`}
                    />
                  </TableCell>

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
                          'w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                          ticket.company.iconBg
                        )}
                      >
                        {ticket.company.iconText}
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

                  {/* Assigned To */}
                  <TableCell className="px-4 py-3">
                    {ticket.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                            {ticket.assignedTo.initials}
                          </span>
                        </div>
                        <span className="text-sm text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {ticket.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenWorkload(ticket)}
                        className="text-xs text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800 rounded-md px-2.5 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors whitespace-nowrap"
                      >
                        + Assign Supporter
                      </button>
                    )}
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

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {start} to {end} of{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{TOTAL_COUNT}</span>{' '}
            client
          </p>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 py-1.5 text-sm text-gray-400 select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={cn(
                    'min-w-[36px] px-2.5 py-1.5 text-sm rounded-lg border transition-colors',
                    currentPage === p
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      <TicketDetailsDialog
        ticket={viewTicket}
        open={viewTicket !== null}
        onClose={() => setViewTicket(null)}
      />
      <TicketEditDialog
        ticket={editTicket}
        open={editTicket !== null}
        onClose={() => setEditTicket(null)}
      />

      {/* Step 1: Team Workload */}
      <TeamWorkloadDialog
        ticket={workloadTicket}
        open={workloadTicket !== null && confirmData === null}
        onClose={handleCloseAssignFlow}
        onAssign={handleAssignEmployee}
      />

      {/* Step 2: Confirm assign */}
      <AssignTicketDialog
        ticket={confirmData?.ticket ?? null}
        employee={confirmData?.employee ?? null}
        open={confirmData !== null}
        onBack={handleBackToWorkload}
        onClose={handleCloseAssignFlow}
        onConfirm={handleConfirmAssign}
      />
    </>
  );
}
