'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, HelpCircle, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Ticket, TicketStatus, TicketPriority } from '@/redux/api/admin/support/adminSupportTicketApi';
import type { Employee } from '@/redux/api/admin/support/adminSupporterApi';

// ── Priority pill colour map ───────────────────────────────────────────────────

const priorityTriggerStyles: Record<TicketPriority, string> = {
  High: 'border-red-300 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400',
  Medium:
    'border-amber-300 bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400',
  Low: 'border-green-300 bg-green-50 text-green-600 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400',
  Normal:
    'border-gray-300 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400',
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface AssignTicketDialogProps {
  ticket: Ticket | null;
  employee: Employee | null;
  open: boolean;
  onBack: () => void;
  onClose: () => void;
  onConfirm: (data: { status: TicketStatus; priority: TicketPriority }) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssignTicketDialog({
  ticket,
  employee,
  open,
  onBack,
  onClose,
  onConfirm,
}: AssignTicketDialogProps) {
  const [status, setStatus] = useState<TicketStatus>('Opened');
  const [priority, setPriority] = useState<TicketPriority>('Medium');

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
    }
  }, [ticket]);

  if (!ticket || !employee) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 gap-0 sm:max-w-lg focus:outline-none">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 sm:text-left">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Assign Ticket to {employee.name}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Ticket meta row: ID + Status pill + Priority pill + Date */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Ticket ID:{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {ticket.ticketId}
              </span>
            </span>

            {/* Status pill select */}
            <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
              <SelectTrigger
                className={cn(
                  'h-7 w-auto text-xs rounded-full px-3 gap-1 border focus:ring-0 focus:ring-offset-0 bg-gray-50 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Opened">Opened</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority pill select — colour changes with value */}
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger
                className={cn(
                  'h-7 w-auto text-xs rounded-full px-3 gap-1 border focus:ring-0 focus:ring-offset-0',
                  priorityTriggerStyles[priority]
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            {/* Date */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{ticket.createdAt}</span>
            </div>
          </div>

          {/* Issue description */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Issue Description
              </span>
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <textarea
                readOnly
                defaultValue={ticket.description}
                rows={6}
                className="w-full px-4 py-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-900 resize-none focus:outline-none"
              />
              {/* resize handle decoration */}
              <span className="absolute bottom-2 right-2 text-gray-300 dark:text-gray-600 text-xs select-none pointer-events-none">
                ↗
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-6"
            onClick={() => onConfirm({ status, priority })}
          >
            Assign Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
