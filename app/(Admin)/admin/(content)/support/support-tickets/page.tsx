import React from 'react';
import Link from 'next/link';
import { HomeIcon, ChevronRight, Download } from 'lucide-react';
import SupportStatsGrid from './_components/SupportStatsGrid';
import TicketsTable from './_components/TicketsTable';

export default function SupportTickets2Page() {
  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Link href="/admin/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <HomeIcon className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">Support</span>
      </nav>

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Support Tickets Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor client-reported issues and support responsiveness.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex-shrink-0">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Stats cards */}
      <SupportStatsGrid />

      {/* Tickets table */}
      <TicketsTable />
    </div>
  );
}
