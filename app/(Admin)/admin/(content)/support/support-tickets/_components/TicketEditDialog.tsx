'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ArrowLeft, HelpCircle } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import type { Ticket, TicketPriority } from './types';

interface TicketEditDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TicketEditDialog({
  ticket,
  open,
  onClose,
}: TicketEditDialogProps) {
  const [priority, setPriority] = useState<TicketPriority>('High');
  const [assignedTo, setAssignedTo] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showDescription, setShowDescription] = useState(true);

  // Sync local state whenever the selected ticket changes
  useEffect(() => {
    if (ticket) {
      setPriority(ticket.priority);
      setAssignedTo(ticket.assignedTo?.name ?? '');
      setAdminNote(ticket.adminNote ?? '');
      setShowDescription(true);
    }
  }, [ticket]);

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 gap-0 sm:max-w-md focus:outline-none">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 sm:text-left">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Edit Support Ticket
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto max-h-[calc(90vh-160px)]">
          {/* Read-only info box */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700">
            {/* Ticket ID */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Ticket ID:</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {ticket.ticketId}
              </span>
            </div>
            {/* Subject */}
            <div className="flex items-start justify-between gap-4 px-4 py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Subject</span>
              <span className="text-sm text-gray-800 dark:text-gray-200 text-right leading-snug">
                {ticket.subject}
              </span>
            </div>
            {/* Requested By */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">Requested By</span>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm text-gray-800 dark:text-gray-200">
                  {ticket.company.name}
                </span>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assign to */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assign to
            </label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kathryn Murphy">Kathryn Murphy</SelectItem>
                <SelectItem value="Leslie Alexander">Leslie Alexander</SelectItem>
                <SelectItem value="Annette Black">Annette Black</SelectItem>
                <SelectItem value="Arlene McCoy">Arlene McCoy</SelectItem>
                <SelectItem value="Debian Junior">Debian Junior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Note */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Admin Note
              </label>
              <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Customer reported this issue after the v2.4.0 deployment. live verified their account is active and they're on the Enterprise plan. The issue seems to be"
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300 placeholder-gray-400"
            />
          </div>

          {/* Issue Description toggle + textarea */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Switch checked={showDescription} onCheckedChange={setShowDescription} />
              <span className="text-sm font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">
                Issue Description
              </span>
            </div>
            {showDescription && (
              <textarea
                defaultValue={ticket.description}
                rows={5}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 dark:text-gray-400"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 pb-5 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="flex items-center gap-2 h-9"
            onClick={onClose}
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5">
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
