/* eslint-disable */
"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import TicketConversationDialog from "./TicketConversationDialog";
import EnterprisePlanDialog from "@/components/shared/Enterprise/EnterprisePlanDialog";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import StickyScrollContainer from "@/components/shared/StickyScrollContainer";
import SupportTicketsDesktopView from "./SupportTicketsDesktopView";
import SupportTicketsMobileView from "./SupportTicketsMobileView";

import {
  useGetAssignedTicketsQuery,
  useResolveTicketMutation,
} from "@/redux/api/supporter/supporterTicketApi";

type Priority = "High" | "Medium" | "Low" | string;
type TicketStatus = "open" | "In progress" | "Resolved" | string;

export interface SupporterTableTicket {
  id: string;
  ticketId: string;
  clientName: string;
  priority: Priority;
  issueType: string;
  status: TicketStatus;
  description: string;
  ticketTags?: any[];
  raw?: any;
}

const ITEMS_PER_PAGE = 11;

// Helper styles extracted to SupportTicketsHelpers.ts

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let p = Math.max(2, current - 1);
    p <= Math.min(total - 1, current + 1);
    p++
  ) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function SupportTicketTable() {
  const { data: ticketsResponse, isLoading } = useGetAssignedTicketsQuery(
    undefined,
    {
      pollingInterval: 3000,
      refetchOnFocus: true,
    },
  );
  const [resolveTicket] = useResolveTicketMutation();

  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [conversationOpen, setConversationOpen] = useState(false);
  const [enterprisePlanOpen, setEnterprisePlanOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<SupporterTableTicket | null>(
    null,
  );

  const openConversation = (ticket: SupporterTableTicket) => {
    setActiveTicket(ticket);
    setConversationOpen(true);
  };

  const openEnterprisePlan = (ticket: SupporterTableTicket) => {
    setActiveTicket(ticket);
    setEnterprisePlanOpen(true);
  };

  const tickets = useMemo(() => {
    if (!ticketsResponse?.data) return [];
    return ticketsResponse.data.map((t) => ({
      id: t.id,
      ticketId: t.customId || t.id,
      clientName: t.user?.full_name || t.user?.username || "Unknown",
      priority: t.priority as Priority,
      issueType: t.issueType?.[0]?.replace("_", " ") || "Support Request",
      status: (t.status === "InProgress"
        ? "In progress"
        : t.status === "Open"
          ? "open"
          : t.status) as TicketStatus,
      description: t.description || "",
      ticketTags: t.ticketTags || [],
      raw: t,
    }));
  }, [ticketsResponse]);

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      const mappedStatus =
        t.status === "InProgress"
          ? "In progress"
          : t.status === "Open"
            ? "open"
            : t.status;
      if (statusFilter !== "all" && mappedStatus !== statusFilter) return false;
      return true;
    });
  }, [priorityFilter, statusFilter, tickets]);

  const TOTAL_COUNT = filtered.length;
  const totalPages = Math.max(1, Math.ceil(TOTAL_COUNT / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE + (TOTAL_COUNT > 0 ? 1 : 0);
  const end = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_COUNT);

  const paginatedTickets = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );
  }, [filtered, currentPage]);

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <div className="bg-navbarBg border border-border rounded-xl shadow-sm overflow-hidden">
      {/* Table header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border">
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
            <SelectTrigger className="h-8 text-xs px-3 gap-1.5 border-border rounded-lg flex-1 sm:flex-none sm:min-w-[110px] bg-navbarBg">
              <SelectValue placeholder="Priority" />
              {/* <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" /> */}
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
            <SelectTrigger className="h-8 text-xs px-3 gap-1.5 border-border rounded-lg flex-1 sm:flex-none sm:min-w-[110px] bg-navbarBg">
              <SelectValue placeholder="All Status" />
              {/* <ChevronDown className="w-3 h-3 opacity-60 flex-shrink-0" /> */}
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
      <StickyScrollContainer className="bg-navbarBg">
        <div className="overflow-x-auto scrollbar-hide">
          <SupportTicketsDesktopView
            paginatedTickets={paginatedTickets}
            isLoading={isLoading}
            openConversation={openConversation}
            openEnterprisePlan={openEnterprisePlan}
          />
          <SupportTicketsMobileView
            paginatedTickets={paginatedTickets}
            isLoading={isLoading}
            openConversation={openConversation}
            openEnterprisePlan={openEnterprisePlan}
          />
        </div>
      </StickyScrollContainer>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-t border-border">
        <p className="text-xs sm:text-sm text-center sm:text-left text-gray-500 dark:text-gray-400">
          Showing {start} to {end} of{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {TOTAL_COUNT}
          </span>{" "}
          Files
        </p>

        <div className="flex items-center justify-center gap-1 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg border border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Prev
          </button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-1.5 sm:px-2 py-1 text-xs sm:text-sm text-gray-400 dark:text-gray-500"
              >
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                  currentPage === p
                    ? "bg-blue-600 text-white"
                    : "border border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                )}
              >
                {p}
              </button>
            ),
          )}

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm rounded-lg border border-border text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Conversation dialog */}
      <TicketConversationDialog
        open={conversationOpen}
        onOpenChange={setConversationOpen}
        ticket={activeTicket}
      />

      {/* Enterprise Plan dialog */}
      <EnterprisePlanDialog
        open={enterprisePlanOpen}
        onOpenChange={setEnterprisePlanOpen}
        ticket={activeTicket}
      />
    </div>
  );
}
