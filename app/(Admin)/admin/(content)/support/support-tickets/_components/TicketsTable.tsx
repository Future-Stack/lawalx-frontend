/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import StickyScrollContainer from '@/components/shared/StickyScrollContainer';
import { toast } from 'sonner';
import { useGetAllSupportTicketsQuery, useAssignSupportTicketMutation, useUpdateSupportTicketMutation } from '@/redux/api/admin/support/adminSupportTicketApi';
import TicketDetailsDialog from './TicketDetailsDialog';
import TicketEditDialog from './TicketEditDialog';
import TeamWorkloadDialog from './TeamWorkloadDialog';
import AssignTicketDialog from './AssignTicketDialog';
import type { Ticket, TicketStatus, TicketPriority } from '@/redux/api/admin/support/adminSupportTicketApi';
import type { Employee } from '@/redux/api/admin/support/adminSupporterApi';
import TicketsDesktopView from './TicketsDesktopView';
import TicketsMobileView from './TicketsMobileView';

// ── Mock data ─────────────────────────────────────────────────────────────────

// ── Data variables ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 11;

// ── Badge helpers ─────────────────────────────────────────────────────────────
// Badges have been extracted to TicketsBadges.tsx

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
  const [currentPage, setCurrentPage] = useState(1);

  const [assignSupportTicket] = useAssignSupportTicketMutation();
  const [updateSupportTicket] = useUpdateSupportTicketMutation();

  const { data: ticketsResponse, isLoading } = useGetAllSupportTicketsQuery({
    userName: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
  }, {
    pollingInterval: 3000,
    refetchOnFocus: true,  
  });


  const apiTickets: Ticket[] = useMemo(() => {
    if (!ticketsResponse?.data) return [];
    return ticketsResponse.data.map((t: any) => {
      const statusMap: Record<string, any> = {
        'Open': 'Opened',
        'InProgress': 'In Progress',
        'Resolved': 'Resolved',
        'Closed': 'Closed',
      };

      const priorityMap: Record<string, any> = {
        'Low': 'Low',
        'Medium': 'Medium',
        'High': 'High'
      };

      const firstAssignment = t.assignments?.length > 0 ? t.assignments[0] : null;
      const assignedTo = firstAssignment?.user ? {
        id: firstAssignment.user.id || firstAssignment.supporterId || undefined,
        name: firstAssignment.user.username || 'Supporter',
        initials: (firstAssignment.user.username || 'S').substring(0, 2).toUpperCase(),
        role: firstAssignment.user.role || 'Support',
      } : null;

      return {
        id: t.id,
        ticketId: t.customId || t.id,
        company: {
          name: t.user?.username || 'Unknown',
          iconBg: 'bg-blue-500',
          iconText: t.user?.username?.charAt(0)?.toUpperCase() || 'U',
          imageUrl: t.user?.image_url
        },
        subject: t.subject,
        status: statusMap[t.status] || 'Opened',
        lastUpdated: new Date(t.updatedAt).toLocaleDateString(),
        priority: priorityMap[t.priority] || 'Normal',
        assignedTo,
        assignedToId: firstAssignment?.user?.id || undefined,
        assignedToImage: firstAssignment?.user?.image_url || undefined,
        description: t.description,
        createdAt: new Date(t.createdAt).toLocaleDateString(),
        updatedAt: new Date(t.updatedAt).toLocaleDateString(),
        adminNote: t.adminNote || undefined,
        ticketTags: t.ticketTags || [],
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

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="bg-navbarBg border border-border rounded-xl shadow-sm overflow-hidden">
        {/* ── Filters bar ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
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
                className="w-full pl-9 pr-3 py-2 text-sm bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
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
        <StickyScrollContainer className="bg-navbarBg">
          <div className="overflow-x-auto scrollbar-hide">
            <TicketsDesktopView
              tickets={filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
              isLoading={isLoading}
              setViewTicket={setViewTicket}
              setEditTicket={setEditTicket}
              handleOpenWorkload={handleOpenWorkload}
            />
            
            <TicketsMobileView
              tickets={filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)}
              isLoading={isLoading}
              setViewTicket={setViewTicket}
              setEditTicket={setEditTicket}
              handleOpenWorkload={handleOpenWorkload}
            />
          </div>
        </StickyScrollContainer>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-t border-border">
          <p className="text-xs sm:text-sm text-center sm:text-left text-gray-500 dark:text-gray-400">
            Showing {start} to {end} of{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{TOTAL_COUNT}</span>{' '}
            tickets
          </p>

          <div className="flex items-center justify-center gap-1 flex-wrap">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Prev</span>
            </button>

            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm text-gray-400 select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p as number)}
                  className={cn(
                    'min-w-[32px] sm:min-w-[36px] px-2 py-1 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm rounded-lg border transition-colors cursor-pointer',
                    currentPage === p
                      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 border-border hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
