'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
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

// ── Types ─────────────────────────────────────────────────────────────────────

type EmployeeLevel = 'Active' | 'In Active';
type EmployeeRole =
  | 'Support Manager'
  | 'Sales Officer'
  | 'Cat attendance'
  | 'System Eng.'
  | 'Viewer';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  skills: string[];
  lastActive: string;
  level: EmployeeLevel;
  initials: string;
  avatarBg: string;
}

// ── Mock data (from Figma screenshot) ─────────────────────────────────────────

const MOCK_EMPLOYEES: Employee[] = [
  { id: '1',  name: 'Dianne Russell',   email: 'tanya.hill@example.com',      role: 'Support Manager', skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '4/4/18',   level: 'Active',    initials: 'DR', avatarBg: 'bg-pink-400' },
  { id: '2',  name: 'Brooklyn Simmons', email: 'curtis.weaver@example.com',    role: 'Sales Officer',   skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '12/4/17',  level: 'Active',    initials: 'BS', avatarBg: 'bg-orange-400' },
  { id: '3',  name: 'Darlene Robertson',email: 'michelle.rivera@example.com',  role: 'Cat attendance',  skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '1/31/14',  level: 'In Active', initials: 'DR', avatarBg: 'bg-yellow-500' },
  { id: '4',  name: 'Arlene McCoy',     email: 'jackson.graham@example.com',   role: 'Sales Officer',   skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '3/4/16',   level: 'Active',    initials: 'AM', avatarBg: 'bg-purple-400' },
  { id: '5',  name: 'Marvin McKinney',  email: 'bill.sanders@example.com',     role: 'Sales Officer',   skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '5/7/18',   level: 'Active',    initials: 'MM', avatarBg: 'bg-green-500' },
  { id: '6',  name: 'Jane Cooper',      email: 'nathan.roberts@example.com',   role: 'System Eng.',     skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '2/11/12',  level: 'Active',    initials: 'JC', avatarBg: 'bg-blue-400' },
  { id: '7',  name: 'Theresa Webb',     email: 'tim.jennings@example.com',     role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '6/19/14',  level: 'In Active', initials: 'TW', avatarBg: 'bg-red-400' },
  { id: '8',  name: 'Darrell Steward',  email: 'deanna.curtis@example.com',    role: 'Support Manager', skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '9/18/16',  level: 'Active',    initials: 'DS', avatarBg: 'bg-indigo-400' },
  { id: '9',  name: 'Jacob Jones',      email: 'willie.jennings@example.com',  role: 'Support Manager', skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '7/11/19',  level: 'Active',    initials: 'JJ', avatarBg: 'bg-teal-500' },
  { id: '10', name: 'Savannah Nguyen',  email: 'dolores.chambers@example.com', role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '8/30/14',  level: 'Active',    initials: 'SN', avatarBg: 'bg-cyan-500' },
  { id: '11', name: 'Devon Lane',       email: 'debra.holt@example.com',       role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '5/27/15',  level: 'Active',    initials: 'DL', avatarBg: 'bg-amber-500' },
  { id: '12', name: 'Robert Fox',       email: 'kenzi.lawson@example.com',     role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '5/19/12',  level: 'Active',    initials: 'RF', avatarBg: 'bg-lime-500' },
  { id: '13', name: 'Albert Flores',    email: 'alma.lawson@example.com',      role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '10/6/13',  level: 'Active',    initials: 'AF', avatarBg: 'bg-rose-400' },
  { id: '14', name: 'Kathryn Murphy',   email: 'felicia.reid@example.com',     role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '1/15/12',  level: 'In Active', initials: 'KM', avatarBg: 'bg-violet-400' },
  { id: '15', name: 'Wade Warren',      email: 'michael.mitc@example.com',     role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '1/15/12',  level: 'In Active', initials: 'WW', avatarBg: 'bg-emerald-500' },
  { id: '16', name: 'Kristin Watson',   email: 'nevaeh.simmons@example.com',   role: 'Viewer',          skills: ['Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops', 'Senior Dev Ops'], lastActive: '1/15/12',  level: 'In Active', initials: 'KW', avatarBg: 'bg-sky-400' },
];

const ITEMS_PER_PAGE = 11;
const TOTAL_COUNT = 500;

// ── Badge style maps ──────────────────────────────────────────────────────────

const ROLE_STYLES: Record<EmployeeRole, string> = {
  'Support Manager': 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400',
  'Sales Officer':   'text-cyan-600   bg-cyan-50   border-cyan-200   dark:bg-cyan-900/20   dark:border-cyan-800   dark:text-cyan-400',
  'Cat attendance':  'text-gray-600   bg-gray-100  border-gray-200   dark:bg-gray-800      dark:border-gray-700   dark:text-gray-400',
  'System Eng.':     'text-blue-600   bg-blue-50   border-blue-200   dark:bg-blue-900/20   dark:border-blue-800   dark:text-blue-400',
  'Viewer':          'text-gray-600   bg-gray-100  border-gray-200   dark:bg-gray-800      dark:border-gray-700   dark:text-gray-400',
};

const LEVEL_STYLES: Record<EmployeeLevel, string> = {
  'Active':    'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
  'In Active': 'text-red-500   bg-red-50   border-red-200   dark:bg-red-900/20   dark:border-red-800   dark:text-red-400',
};

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

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_EMPLOYEES;
    const q = search.toLowerCase();
    return MOCK_EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(TOTAL_COUNT / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, TOTAL_COUNT);

  const allSelected =
    filtered.length > 0 && filtered.every((e) => selectedIds.has(e.id));

  const toggleAll = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      filtered.forEach((e) => next.delete(e.id));
    } else {
      filtered.forEach((e) => next.add(e.id));
    }
    setSelectedIds(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const pageNumbers = buildPageNumbers(currentPage, totalPages);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
      {/* ── Top bar: title + search + filter ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
          Support Employees List
        </h2>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Project..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Filter By */}
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter By
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── shadcn Table ──────────────────────────────────────────────── */}
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
            {['File Name', 'Email', 'Role', 'Skills', 'Last Active', 'Level', 'Action'].map(
              (col) => (
                <TableHead
                  key={col}
                  className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                  {col}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-14 text-center text-sm text-gray-400 dark:text-gray-500">
                No employees found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((emp) => (
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
                    aria-label={`Select ${emp.name}`}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>

                {/* File Name (avatar + name) */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                        emp.avatarBg
                      )}
                    >
                      {emp.initials}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                      {emp.name}
                    </span>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell className="px-4 py-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {emp.email}
                  </span>
                </TableCell>

                {/* Role badge */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap',
                      ROLE_STYLES[emp.role]
                    )}
                  >
                    {emp.role}
                  </span>
                </TableCell>

                {/* Skills — 2 × 2 grid */}
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
                    {emp.lastActive}
                  </span>
                </TableCell>

                {/* Level badge */}
                <TableCell className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap',
                      LEVEL_STYLES[emp.level]
                    )}
                  >
                    {emp.level}
                  </span>
                </TableCell>

                {/* Action icons */}
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    <button
                      className="p-1.5 rounded-md hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                      aria-label="View employee"
                    >
                      <Eye className="w-4 h-4 text-cyan-500" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                      aria-label="Edit employee"
                    >
                      <Pencil className="w-4 h-4 text-violet-500" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      aria-label="Delete employee"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {start} to {end} of{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">{TOTAL_COUNT}</span>{' '}
          Files
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
    </div>
  );
}
