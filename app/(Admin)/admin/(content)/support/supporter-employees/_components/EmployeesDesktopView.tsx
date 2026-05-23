import React from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { EmployeeData } from '@/redux/api/admin/support/adminSupporterApi';
import { getInitials, avatarColor, formatRole } from './EmployeesHelpers';

interface EmployeesDesktopViewProps {
  paginated: EmployeeData[];
  isLoading: boolean;
  isError: boolean;
  isOnline: (emp: EmployeeData) => boolean;
  lastActive: (emp: EmployeeData) => string;
  setSelectedEmployee: (emp: EmployeeData) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  handleDelete: (id: string, name: string) => void;
}

export default function EmployeesDesktopView({
  paginated,
  isLoading,
  isError,
  isOnline,
  lastActive,
  setSelectedEmployee,
  setIsEditDialogOpen,
  handleDelete,
}: EmployeesDesktopViewProps) {
  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow className="bg-navbarBg hover:bg-navbarBg">
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Name
            </TableHead>
            <TableHead className="md:table-cell px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Email
            </TableHead>
            <TableHead className="lg:table-cell px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Role
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Skills
            </TableHead>
            <TableHead className="xl:table-cell px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Last Active
            </TableHead>
            <TableHead className="sm:table-cell px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Level
            </TableHead>
            <TableHead className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-border">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Loading state */}
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="py-14 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              </TableCell>
            </TableRow>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="py-14 text-center text-sm text-red-400">
                Failed to load supporters. Please try again.
              </TableCell>
            </TableRow>
          )}

          {/* Empty state */}
          {!isLoading && !isError && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-14 text-center text-sm text-gray-400 dark:text-gray-500">
                No employees found.
              </TableCell>
            </TableRow>
          )}

          {/* Data rows */}
          {!isLoading && !isError && paginated.map((emp) => {
            const displayName = emp.user.full_name || emp.user.username;
            const initials = getInitials(displayName);
            const online = isOnline(emp);

            return (
              <TableRow
                key={emp.id}
                className={cn(
                  'hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-border'
                )}
              >
                {/* Name + Avatar */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {emp.user.image_url ? (
                        <img
                          src={(process.env.NEXT_PUBLIC_BASE_URL || '').replace('/api/v1', '') + emp.user.image_url}
                          alt={displayName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold',
                            avatarColor(emp.id)
                          )}
                        >
                          {initials}
                        </div>
                      )}
                      {/* Online indicator dot */}
                      <span
                        className={cn(
                          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900',
                          online ? 'bg-green-500' : 'bg-gray-400'
                        )}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {displayName}
                    </span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="md:table-cell px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {emp.user.account.email}
                  </span>
                </TableCell>

                {/* Role badge */}
                <TableCell className="lg:table-cell px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {emp.supporterRole.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400"
                      >
                        {formatRole(role)}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* Skills — flex wrap */}
                <TableCell className="px-4 py-3">
                  <div className="flex flex-wrap gap-1 max-w-[250px]">
                    {emp.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-border rounded whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* Last Active */}
                <TableCell className="xl:table-cell px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {lastActive(emp)}
                  </span>
                </TableCell>

                {/* Level badge */}
                <TableCell className="sm:table-cell px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap',
                      online
                        ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    )}
                  >
                    {online ? 'Active' : 'In Active'}
                  </span>
                </TableCell>

                {/* Action */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <button
                      className="p-1.5 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                      aria-label="Edit employee"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-violet-500" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete employee"
                      onClick={() => handleDelete(emp.id, displayName)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
