import Link from 'next/link';
import { HomeIcon, ChevronRight } from 'lucide-react';
import EmployeesTable from './_components/EmployeesTable';

export default function SupporterEmployeesPage() {
  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link
          href="/admin/dashboard"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">Support</span>
      </nav>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Supports Employee List
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor client-reported issues and support responsiveness.
        </p>
      </div>

      {/* Table */}
      <EmployeesTable />
    </div>
  );
}
