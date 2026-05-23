import React from 'react';
import { cn } from '@/lib/utils';
import type { TicketStatus, TicketPriority } from '@/redux/api/admin/support/adminSupportTicketApi';

const statusStyles: Record<TicketStatus, string> = {
  Opened:
    'text-orange-600 bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400',
  Resolved:
    'text-blue-600 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  'In Progress':
    'text-teal-600 bg-teal-50 border border-teal-200 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-400',
  Closed:
    'text-gray-600 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
};

const priorityStyles: Record<TicketPriority, string> = {
  High: 'text-red-600 bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
  Medium:
    'text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
  Low: 'text-green-600 bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  Normal:
    'text-gray-600 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
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

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
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
