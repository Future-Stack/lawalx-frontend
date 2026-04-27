'use client';

import React, { useState, useEffect } from 'react';
import { Building2, ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useGetAllSupportersQuery } from '@/redux/api/admin/support/adminSupporterApi';
import { useUpdateSupportTicketMutation } from '@/redux/api/admin/support/adminSupportTicketApi';
import type { Ticket, TicketPriority } from '@/redux/api/admin/support/adminSupportTicketApi';

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
  const [updateTicket, { isLoading: isUpdating }] = useUpdateSupportTicketMutation();
  const { data: supportersResponse, isLoading: isLoadingSupporters } = useGetAllSupportersQuery();

  const [priority, setPriority] = useState<string>('High');
  const [status, setStatus] = useState<string>('Open');
  const [assignedTo, setAssignedTo] = useState<string>('none');
  const [adminNote, setAdminNote] = useState('');
  const [showDescription, setShowDescription] = useState(true);

  const [prevTicketId, setPrevTicketId] = useState<string | null>(null);

  // Sync state synchronously during render if ticket changes
  if (ticket && ticket.id !== prevTicketId) {
    setPrevTicketId(ticket.id);
    setPriority(ticket.priority);

    const statusMapBack: Record<string, string> = {
      'Opened': 'Open',
      'In Progress': 'InProgress',
      'Resolved': 'Resolved',
      'Closed': 'Closed',
    };
    setStatus(statusMapBack[ticket.status] || 'Open');
    setAssignedTo(ticket?.assignedToId || 'none');
    setAdminNote(ticket.adminNote ?? '');
    setShowDescription(true);
  }

  // When supporters load, try to match the assignee if assignedToId was missing
  useEffect(() => {
    if (ticket?.assignedTo?.name && supportersResponse?.data && assignedTo === 'none') {
      const found = supportersResponse.data.find((s: any) => s.user?.username === ticket.assignedTo!.name);
      if (found) setAssignedTo(found.id);
    }
  }, [supportersResponse, ticket, assignedTo]);

  const handleSave = async () => {
    if (!ticket) return;
    try {
      const payload: any = {
        priority,
        status,
        adminNote,
      };
      const isAlreadyAssigned = !!(ticket?.assignedToId || ticket?.assignedTo?.name);
      if (!isAlreadyAssigned && assignedTo && assignedTo !== 'none') {
        payload.supporterId = assignedTo;
      }

      await updateTicket({
        ticketId: ticket.id,
        body: payload
      }).unwrap();

      toast.success('Ticket updated successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update ticket');
    }
  };

  if (!ticket) return null;
  const isAlreadyAssigned = !!(ticket?.assignedToId || ticket?.assignedTo?.name);

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
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 pl-3 pr-10 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer appearance-none shadow-sm"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 pl-3 pr-10 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer appearance-none shadow-sm"
              >
                <option value="Open">Opened</option>
                <option value="Resolved">Resolved</option>
                <option value="InProgress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Assign to */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assign to {isAlreadyAssigned && <span className="text-[10px] text-blue-500 font-normal ml-1">(Already Assigned)</span>}
            </label>
            <div className="relative">
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={isAlreadyAssigned}
                className="w-full h-10 pl-3 pr-10 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer appearance-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="none">No Change / Unassigned</option>
                {supportersResponse?.data?.map((supporter: any) => (
                  <option key={supporter.id} value={supporter.id}>
                    {supporter.user?.username || 'Unknown'}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
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
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-5"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
