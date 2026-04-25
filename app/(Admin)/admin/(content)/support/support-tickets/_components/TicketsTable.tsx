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
import { toast } from 'sonner';
import { useGetAllSupportTicketsQuery, useAssignSupportTicketMutation, useUpdateSupportTicketMutation } from '@/redux/api/admin/support/adminSupportTicketApi';
import TicketDetailsDialog from './TicketDetailsDialog';
import TicketEditDialog from './TicketEditDialog';
import TeamWorkloadDialog from './TeamWorkloadDialog';
import AssignTicketDialog from './AssignTicketDialog';
import type { Ticket, Employee, TicketStatus, TicketPriority } from './types';

// ── Mock data ─────────────────────────────────────────────────────────────────

// ── Data variables ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 11;

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

  const [assignSupportTicket] = useAssignSupportTicketMutation();
  const [updateSupportTicket] = useUpdateSupportTicketMutation();

  const { data: ticketsResponse, isLoading } = useGetAllSupportTicketsQuery({
    userName: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  });


  const apiTickets: Ticket[] = useMemo(() => {
    if (!ticketsResponse?.data) return [];
    return ticketsResponse.data.map((t: any) => {
      const statusMap: Record<string, any> = {
        'Open': 'Opened',
        'InProgress': 'In Progress',
        'Resolved': 'Resolved',
        'Closed': 'Resolved'
      };

      const priorityMap: Record<string, any> = {
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High'
      };

      const assignedTo = t.assignments?.length > 0 && t.assignments[0]?.user ? {
        name: t.assignments[0].user.username || 'Supporter',
        initials: (t.assignments[0].user.username || 'S').substring(0, 2).toUpperCase(),
        role: t.assignments[0].user.role || 'Support'
      } : null;

      return {
        id: t.id,
        ticketId: t.customId || t.id,
        company: {
          name: t.user?.username || 'Unknown',
          iconBg: 'bg-blue-500',
          iconText: t.user?.username?.charAt(0)?.toUpperCase() || 'U'
        },
        subject: t.subject,
        status: statusMap[t.status] || 'Opened',
        lastUpdated: new Date(t.updatedAt).toLocaleDateString(),
        priority: priorityMap[t.priority] || 'Normal',
        assignedTo,
        description: t.description,
        createdAt: new Date(t.createdAt).toLocaleDateString(),
        updatedAt: new Date(t.updatedAt).toLocaleDateString(),
        adminNote: t.adminNote || undefined,
        raw: t,
      } as unknown as Ticket;
    });
  }, [ticketsResponse]);

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
  const handleConfirmAssign = async (data: { status: TicketStatus; priority: TicketPriority }) => {
    if (!confirmData?.ticket || !confirmData?.employee) return;

    try {
      await assignSupportTicket({
        ticketId: confirmData.ticket.id,
        body: { supporterId: confirmData.employee.id },
      }).unwrap();

      const statusMapBack: Record<string, string> = {
        'Opened': 'Open',
        'In Progress': 'InProgress',
        'Resolved': 'Resolved',
        'Closed': 'Closed'
      };

      if (
        data.status !== confirmData.ticket.status ||
        data.priority !== confirmData.ticket.priority
      ) {
        await updateSupportTicket({
          ticketId: confirmData.ticket.id,
          body: {
            status: statusMapBack[data.status] || data.status,
            priority: data.priority,
          }
        }).unwrap();
      }

      toast.success('Supporter assigned successfully');
      setWorkloadTicket(null);
      setConfirmData(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to assign supporter');
    }
  };
  const handleCloseAssignFlow = () => {
    setWorkloadTicket(null);
    setConfirmData(null);
  };

  const filtered = apiTickets;

  const TOTAL_COUNT = filtered.length;
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
                <SelectItem value="Open">Opened</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="InProgress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
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
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-sm text-gray-400">
                  Loading tickets...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-sm text-gray-400 dark:text-gray-500"
                >
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((ticket) => (
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
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
            tickets
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
