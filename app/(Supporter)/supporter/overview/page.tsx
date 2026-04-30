'use client';

import { HomeIcon } from 'lucide-react';
import Link from 'next/link';
import SupporterStatsGrid from './_components/SupporterStatsGrid';
import SupportTicketTable from './_components/SupportTicketTable';
import { useGetUserProfileQuery } from '@/redux/api/users/userProfileApi';

export default function SupporterOverviewPage() {
  const { data: profileData } = useGetUserProfileQuery();
  const userName = profileData?.data?.full_name || profileData?.data?.username || 'Supporter';

  return (
    <div className="min-h-screen space-y-6">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {userName}{' '}
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
          className="text-[#0FA6FF] hover:text-[#0FA6FF] dark:hover:text-[#0FA6FF] transition-colors flex items-center gap-1"
        >
          <HomeIcon className="w-4 h-4" /> Home
        </Link>
        {/* <ChevronRight className="w-3.5 h-3.5" />
        <span>Customer Supports</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-blue-400 font-medium">
          Enterprise Requests
        </span> */}
      </nav>

      {/* Stat cards */}
      <SupporterStatsGrid />

      {/* Ticket table */}
      <SupportTicketTable />
    </div>
  );
}
