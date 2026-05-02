'use client';

import React, { useState } from 'react';
import { Clock, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { Ticket } from '@/redux/api/admin/support/adminSupportTicketApi';
import type { Employee } from '@/redux/api/admin/support/adminSupporterApi';
import { useGetAllSupportersQuery } from '@/redux/api/admin/support/adminSupporterApi';
import SupporterProfileDialog from './SupporterProfileDialog';

// Removed MOCK_EMPLOYEES

// ── Props ─────────────────────────────────────────────────────────────────────

interface TeamWorkloadDialogProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onAssign: (employee: Employee) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeamWorkloadDialog({
  ticket,
  open,
  onClose,
  onAssign,
}: TeamWorkloadDialogProps) {
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [profileSupporterId, setProfileSupporterId] = useState<string | null>(null);

  const { data: supportersResponse, isLoading } = useGetAllSupportersQuery({
    filterFullWorkload: showAvailableOnly ? true : undefined,
  }, { skip: !open });

  const allEmployees: Employee[] = React.useMemo(() => {
    if (!supportersResponse?.data) return [];
    return supportersResponse.data.map((t: any) => {
      const name = t.user?.full_name || t.user?.username || 'Unknown';
      const initials = name.substring(0, 2).toUpperCase();
      const role = t.supporterRole?.length > 0 ? t.supporterRole.join(', ') : 'Supporter';
      const activeTickets = t.workload || 0;
      // If workload is 4 or more, the supporter is considered Busy.
      const status = activeTickets >= 4 ? 'Busy' : 'Available';

      return {
        supporterId: t.id,
        id: t.userId,
        name,
        role,
        initials,
        status,
        activeTickets,
        ticketTags: t.skills || [],
      };
    });
  }, [supportersResponse]);

  const availableCount = allEmployees.filter((e) => e.status === 'Available').length;
  const totalActiveTickets = allEmployees.reduce((sum, e) => sum + e.activeTickets, 0);

  const displayedEmployees = allEmployees;

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 gap-0 sm:max-w-md focus:outline-none">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 sm:text-left">
          <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
            Team Workload
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Person Available</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{availableCount}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Ticket</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalActiveTickets}</p>
            </div>
          </div>

          {/* Toggle: show available only */}
          <div className="flex items-center gap-2.5">
            <Switch checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show available employee only
            </span>
          </div>

          {/* Employee cards */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-gray-500">Loading supporters...</div>
            ) : displayedEmployees.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">No supporters found.</div>
            ) : (
              displayedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3"
                >
                  {/* Top row: avatar + info + status badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {employee.initials}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {employee.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{employee.role}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-0.5 rounded-full border flex-shrink-0',
                        employee.status === 'Available'
                          ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                          : 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                      )}
                    >
                      {employee.status}
                    </span>
                  </div>

                  {/* Active tickets count */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{employee.activeTickets} active ticket</span>
                  </div>

                  {/* Ticket type tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {employee.ticketTags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                    {employee.ticketTags.length > 3 && (
                      <span className="text-xs px-2.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800">
                        +{employee.ticketTags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-xs flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setProfileSupporterId(employee.supporterId)}
                    >
                      <User className="w-3.5 h-3.5" />
                      View Profile
                    </Button>
                    <Button
                      className={cn(
                        'flex-1 h-9 text-xs font-semibold',
                        employee.status === 'Available'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                      disabled={employee.status === 'Busy'}
                      onClick={() => onAssign(employee)}
                    >
                      Assign Now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
      <SupporterProfileDialog
        supporterId={profileSupporterId}
        open={profileSupporterId !== null}
        onClose={() => setProfileSupporterId(null)}
      />
    </Dialog>
  );
}
