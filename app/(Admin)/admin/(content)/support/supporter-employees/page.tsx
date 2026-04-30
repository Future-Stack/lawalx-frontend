import Link from 'next/link';
import { HomeIcon, ChevronRight } from 'lucide-react';
import EmployeesTable from './_components/EmployeesTable';

export default function SupporterEmployeesPage() {
  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/admin/dashboard">
          <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span>Customer Supports</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-bgBlue font-medium">Supporter Employees</span>
      </div>

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
