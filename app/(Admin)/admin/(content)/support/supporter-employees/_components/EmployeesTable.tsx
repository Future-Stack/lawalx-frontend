'use client';

import { useState, useMemo } from 'react';
import {
 
  ChevronLeft,
  ChevronRight,

} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useGetAllSupportersQuery, useDeleteSupporterHardMutation } from '@/redux/api/admin/support/adminSupporterApi';
import { usePresence } from '@/hooks/usePresence';
import type { EmployeeData } from '@/redux/api/admin/support/adminSupporterApi';
import EditEmployeeDialog from './EditEmployeeDialog';
import { toast } from 'sonner';
import EmployeesDesktopView from './EmployeesDesktopView';
import EmployeesMobileView from './EmployeesMobileView';
import { formatLastActive } from './EmployeesHelpers';

// ── Variables ─────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 11;

// ── Pagination helper ─────────────────────────────────────────────────────────

function buildPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EmployeesTable() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetAllSupportersQuery();
  const [deleteEmployee] = useDeleteSupporterHardMutation();
  const presenceMap = usePresence(); // real-time socket presence

  const employees: EmployeeData[] = useMemo(() => data?.data ?? [], [data?.data]);

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        (e.user.username ?? '').toLowerCase().includes(q) ||
        (e.user.full_name ?? '').toLowerCase().includes(q) ||
        e.user.account.email.toLowerCase().includes(q) ||
        e.supporterRole.some((r) => r.toLowerCase().includes(q)) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
    );
  }, [search, employees]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  // ── Status helpers ────────────────────────────────────────────────────────
  // Socket presence strictly overrides API value to prevent flipping
  const isOnline = (emp: EmployeeData): boolean => {
    // If the socket has ever sent us a status, trust only that
    const socketStatus = presenceMap[emp.userId];
    if (typeof socketStatus === 'boolean') return socketStatus;
    
    // Otherwise fallback to API (initial load)
    return !!emp.user.isOnline;
  };

  const lastActive = (emp: EmployeeData): string => {
    if (isOnline(emp)) return 'Online';
    return formatLastActive(emp.user.lastOnlineAt);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return;

    try {
      await deleteEmployee(id).unwrap();
      toast.success('Employee deleted successfully');
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Failed to delete employee');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-navbarBg border border-border rounded-xl shadow-sm overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          Support Employees List
        </h2>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto scrollbar-hide">
        <EmployeesDesktopView
          paginated={paginated}
          isLoading={isLoading}
          isError={isError}
          isOnline={isOnline}
          lastActive={lastActive}
          setSelectedEmployee={setSelectedEmployee}
          setIsEditDialogOpen={setIsEditDialogOpen}
          handleDelete={handleDelete}
        />
        <EmployeesMobileView
          paginated={paginated}
          isLoading={isLoading}
          isError={isError}
          isOnline={isOnline}
          lastActive={lastActive}
          setSelectedEmployee={setSelectedEmployee}
          setIsEditDialogOpen={setIsEditDialogOpen}
          handleDelete={handleDelete}
        />
      </div>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-border">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{' '}
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">{filtered.length}</span>{' '}
          supporters
        </p>

        <div className="flex items-center gap-1 flex-wrap">
          {/* Prev */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, i) =>
            p === '...' ? (
              <span key={`e-${i}`} className="px-2 py-1.5 text-sm text-gray-400 select-none">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setCurrentPage(p as number)}
                className={cn(
                  'min-w-[36px] px-2.5 py-1.5 text-sm rounded-lg border transition-colors',
                  currentPage === p
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 border-border hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <EditEmployeeDialog
        employee={selectedEmployee}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
