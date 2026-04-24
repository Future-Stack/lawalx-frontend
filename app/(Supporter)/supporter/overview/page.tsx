import { HomeIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SupporterStatsGrid from './_components/SupporterStatsGrid';
import SupportTicketTable from './_components/SupportTicketTable';

export default function SupporterOverviewPage() {
  return (
    <div className="min-h-screen space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          Sofia Martin{' '}
          <span role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This is your current progress overview
        </p>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link
          href="/supporter/overview"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Customer Supports</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          Enterprise Requests
        </span>
      </nav>

      {/* Stat cards */}
      <SupporterStatsGrid />

      {/* Ticket table */}
      <SupportTicketTable />
    </div>
  );
}
