'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useGetAllSupportersQuery, useDeleteSupporterHardMutation } from '@/redux/api/admin/support/adminSupporterApi';
import { usePresence } from '@/hooks/usePresence';
import type { EmployeeData } from '@/redux/api/admin/support/adminSupporterApi';
import EditEmployeeDialog from './EditEmployeeDialog';
import { toast } from 'sonner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const AVATAR_COLORS = [
  'bg-pink-400', 'bg-orange-400', 'bg-yellow-500', 'bg-purple-400',
  'bg-green-500', 'bg-blue-400', 'bg-red-400', 'bg-indigo-400',
  'bg-teal-500', 'bg-cyan-500', 'bg-amber-500', 'bg-lime-500',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatLastActive(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Edit state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetAllSupportersQuery();
  const [deleteEmployee] = useDeleteSupporterHardMutation();
  const presenceMap = usePresence(); // real-time socket presence

  const employees: EmployeeData[] = data?.data ?? [];

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

  // ── Selection ─────────────────────────────────────────────────────────────
  const allSelected =
    paginated.length > 0 && paginated.every((e) => selectedIds.has(e.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) paginated.forEach((e) => next.delete(e.id));
    else paginated.forEach((e) => next.add(e.id));
    setSelectedIds(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  // ── Status helpers ────────────────────────────────────────────────────────
  // Socket presence overrides API value in real-time
  const isOnline = (emp: EmployeeData): boolean =>
    presenceMap[emp.userId] ?? emp.user.isOnline;

  const lastActive = (emp: EmployeeData): string => {
    if (isOnline(emp)) return 'Online';
    return formatLastActive(emp.user.lastOnlineAt);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${name}? This action cannot be undone.`)) return;
    
    try {
      await deleteEmployee(id).unwrap();
      toast.success('Employee deleted successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete employee');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          Support Employees List
        </h2>

        {/* <div className="flex items-center gap-2 w-full sm:w-auto">
       
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, role…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>


          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter By
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div> */}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/60">
            <TableHead className="w-10 px-4">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all"
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </TableHead>
            {['Name', 'Email', 'Role', 'Skills', 'Last Active', 'Level', 'Action'].map((col) => (
              <TableHead
                key={col}
                className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {/* Loading state */}
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="py-14 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              </TableCell>
            </TableRow>
          )}

          {/* Error state */}
          {isError && !isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="py-14 text-center text-sm text-red-400">
                Failed to load supporters. Please try again.
              </TableCell>
            </TableRow>
          )}

          {/* Empty state */}
          {!isLoading && !isError && paginated.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-14 text-center text-sm text-gray-400 dark:text-gray-500">
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
                  'hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors',
                  selectedIds.has(emp.id) && 'bg-blue-50/40 dark:bg-blue-900/10'
                )}
              >
                {/* Checkbox */}
                <TableCell className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.has(emp.id)}
                    onCheckedChange={() => toggleOne(emp.id)}
                    aria-label={`Select ${displayName}`}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>

                {/* Name + Avatar */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {emp.user.image_url ? (
                        <img
                          src={emp.user.image_url}
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
                <TableCell className="px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {emp.user.account.email}
                  </span>
                </TableCell>

                {/* Role badge */}
                <TableCell className="px-4 py-3">
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

                {/* Skills — 2-column grid */}
                <TableCell className="px-4 py-3">
                  <div className="grid grid-cols-2 gap-1 w-fit">
                    {emp.skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </TableCell>

                {/* Last Active */}
                <TableCell className="px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {lastActive(emp)}
                  </span>
                </TableCell>

                {/* Level badge */}
                <TableCell className="px-4 py-3">
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

                {/* Action — static for now */}
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

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                    : 'text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
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
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
