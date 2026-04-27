'use client';

import React, { useState } from 'react';
import { Building2, Calendar, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Ticket, TicketStatus, TicketPriority } from '@/redux/api/admin/support/adminSupportTicketApi';
import AdminTicketChatDialog from './AdminTicketChatDialog';

interface TicketDetailsDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
}

// ── Badge styles ──────────────────────────────────────────────────────────────

const statusStyles: Record<TicketStatus, string> = {
  Opened:
    'text-gray-700 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200',
  Resolved:
    'text-blue-600 bg-blue-50 border border-blue-300 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  'In Progress':
    'text-teal-600 bg-teal-50 border border-teal-300 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400',
  Closed:
    'text-gray-500 bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
};

const priorityStyles: Record<TicketPriority, string> = {
  High: 'text-red-500 bg-white border border-red-300 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  Medium:
    'text-amber-500 bg-white border border-amber-300 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
  Low: 'text-green-600 bg-white border border-green-300 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  Normal:
    'text-gray-500 bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TicketDetailsDialog({
  ticket,
  open,
  onClose,
}: TicketDetailsDialogProps) {
  const [chatOpen, setChatOpen] = useState(false);

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 gap-0 sm:max-w-2xl focus:outline-none">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 sm:text-left">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Support Ticket Details
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Top row: left ticket info + right assigned */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
            {/* Left: ticket meta */}
            <div className="flex-1 min-w-0">
              {/* Ticket ID + status + priority badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Ticket ID:{' '}
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {ticket.ticketId}
                  </span>
                </span>
                <span
                  className={cn(
                    'text-xs px-2.5 py-0.5 rounded-full font-medium',
                    statusStyles[ticket.status]
                  )}
                >
                  {ticket.status}
                </span>
                <span
                  className={cn(
                    'text-xs px-2.5 py-0.5 rounded-full font-medium',
                    priorityStyles[ticket.priority]
                  )}
                >
                  {ticket.priority} Priority
                </span>
              </div>

              {/* Subject */}
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 leading-snug">
                {ticket.subject}
              </h3>

              {/* Meta: company | created | updated */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{ticket.company.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Created: {ticket.createdAt}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Updated: {ticket.updatedAt}</span>
                </div>
              </div>
            </div>

            {/* Right: assigned to */}
            {ticket.assignedTo && (
              <div className="flex-shrink-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:text-right">
                  Assigned to:
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                      {ticket.assignedTo.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {ticket.assignedTo.name}
                    </p>
                    {ticket.assignedTo.role && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {ticket.assignedTo.role}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Issue description */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">
                Issue Description
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-h-44 overflow-y-auto">
              <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed whitespace-pre-line">
                {ticket.description}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 pb-5 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9 w-full sm:w-auto"
            onClick={onClose}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Ticket list
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" className="h-9 flex-1 sm:flex-none">
              Mark as resolved
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 flex-1 sm:flex-none"
              onClick={() => setChatOpen(true)}
            >
              Reply to Customer
            </Button>
          </div>
        </div>
      </DialogContent>

      <AdminTicketChatDialog
        ticket={ticket}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </Dialog>
  );
}
