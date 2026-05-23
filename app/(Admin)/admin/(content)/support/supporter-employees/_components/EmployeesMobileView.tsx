import React from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EmployeeData } from '@/redux/api/admin/support/adminSupporterApi';
import { getInitials, avatarColor, formatRole } from './EmployeesHelpers';

interface EmployeesMobileViewProps {
  paginated: EmployeeData[];
  isLoading: boolean;
  isError: boolean;
  isOnline: (emp: EmployeeData) => boolean;
  lastActive: (emp: EmployeeData) => string;
  setSelectedEmployee: (emp: EmployeeData) => void;
  setIsEditDialogOpen: (open: boolean) => void;
  handleDelete: (id: string, name: string) => void;
}

export default function EmployeesMobileView({
  paginated,
  isLoading,
  isError,
  isOnline,
  lastActive,
  setSelectedEmployee,
  setIsEditDialogOpen,
  handleDelete,
}: EmployeesMobileViewProps) {
  return (
    <div className="lg:hidden space-y-4 p-4">
      {isLoading ? (
        <div className="py-14 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
        </div>
      ) : isError ? (
        <div className="py-14 text-center text-sm text-red-400">
          Failed to load supporters. Please try again.
        </div>
      ) : paginated.length === 0 ? (
        <div className="py-14 text-center text-sm text-gray-400 dark:text-gray-500">
          No employees found.
        </div>
      ) : (
        paginated.map((emp) => {
          const displayName = emp.user.full_name || emp.user.username;
          const initials = getInitials(displayName);
          const online = isOnline(emp);
          
          return (
            <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4 shadow-sm">
              {/* Header: Avatar, Name, and Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {emp.user.image_url ? (
                      <img
                        src={(process.env.NEXT_PUBLIC_BASE_URL || '').replace('/api/v1', '') + emp.user.image_url}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold',
                          avatarColor(emp.id)
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <span
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                        online ? 'bg-green-500' : 'bg-gray-400'
                      )}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {emp.user.account.email}
                    </div>
                  </div>
                </div>
                
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border',
                    online
                      ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'text-red-500 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  )}
                >
                  {online ? 'Active' : 'In Active'}
                </span>
              </div>

              {/* Body: Roles and Skills */}
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Roles</div>
                  <div className="flex flex-wrap gap-1">
                    {emp.supporterRole.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400"
                      >
                        {formatRole(role)}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {emp.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Last Active & Actions */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Last Active:</span> {lastActive(emp)}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 rounded hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                    aria-label="Edit employee"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 text-violet-500" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete employee"
                    onClick={() => handleDelete(emp.id, displayName)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
