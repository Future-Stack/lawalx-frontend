import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SupporterTableTicket } from "./SupportTicketTable";
import { PRIORITY_STYLES, STATUS_STYLES } from "./SupportTicketsHelpers";

interface SupportTicketsDesktopViewProps {
  paginatedTickets: SupporterTableTicket[];
  isLoading: boolean;
  openConversation: (ticket: SupporterTableTicket) => void;
  openEnterprisePlan: (ticket: SupporterTableTicket) => void;
}

export default function SupportTicketsDesktopView({
  paginatedTickets,
  isLoading,
  openConversation,
  openEnterprisePlan,
}: SupportTicketsDesktopViewProps) {
  return (
    <div className="hidden lg:block">
      <Table wrapperClassName="overflow-visible">
        <TableHeader>
          <TableRow className="border-0 bg-navbarBg hover:bg-navbarBg">
            {[
              "Ticket ID",
              "Client Name",
              "Priority",
              "Issue Type",
              "Status",
              "Description",
              "Action",
            ].map((col) => (
              <TableHead
                key={col}
                className="px-4 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap border-b border-border"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow className="border-0">
              <TableCell
                colSpan={7}
                className="text-center py-12 text-sm text-muted"
              >
                Loading tickets...
              </TableCell>
            </TableRow>
          ) : paginatedTickets.length === 0 ? (
            <TableRow className="border-0">
              <TableCell
                colSpan={7}
                className="text-center py-12 text-sm text-muted"
              >
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedTickets.map((ticket, idx) => (
              <TableRow
                key={ticket.id}
                className="border-0 transition-colors border-b border-border hover:bg-bgGray dark:hover:bg-gray-800/50"
              >
                {/* Ticket ID */}
                <TableCell className="px-4 py-3 text-sm text-headings font-medium whitespace-nowrap">
                  {ticket.ticketId}
                </TableCell>

                {/* Client Name */}
                <TableCell className="px-4 py-3 text-sm text-headings font-medium whitespace-nowrap">
                  {ticket.clientName}
                </TableCell>

                {/* Priority */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-3 py-0.5 rounded text-xs font-medium",
                      PRIORITY_STYLES[ticket.priority] ||
                        "text-gray-600 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300",
                    )}
                  >
                    {ticket.priority}
                  </span>
                </TableCell>

                {/* Issue Type */}
                <TableCell className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                  {ticket.issueType}
                </TableCell>

                {/* Status */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center px-3 py-0.5 rounded text-xs font-medium",
                      STATUS_STYLES[ticket.status] ||
                        "text-gray-600 border border-gray-300 bg-gray-50 dark:bg-gray-800 dark:text-gray-300",
                    )}
                  >
                    {ticket.status}
                  </span>
                </TableCell>

                {/* Description */}
                <TableCell className="px-4 py-3 text-sm text-muted max-w-[200px]">
                  <span className="truncate block">{ticket.description}</span>
                </TableCell>

                {/* Action */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openConversation(ticket)}
                      title="View Ticket"
                      className="p-1.5 rounded-md text-[#4881FF] hover:bg-[#4881FF]/10 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    {ticket.ticketTags?.some(
                      (t: { tag?: { key: string } }) =>
                        t.tag?.key === "NEEDS_ENTERPRISE_PLAN",
                    ) && (
                      <button
                        onClick={() => openEnterprisePlan(ticket)}
                        title="View Enterprise Plan"
                        className="p-1.5 rounded-md text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
