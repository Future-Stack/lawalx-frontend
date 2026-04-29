'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Eye, Home, ChevronRight, HomeIcon } from 'lucide-react';
import BannerStats from '@/components/Admin/support/Banner/BannerStats';
import BannerTable from '@/components/Admin/support/Banner/BannerTable';

export default function BannerPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
            <Link href="/admin/dashboard">
              <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Customer Supports</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-bgBlue dark:text-blue-400 font-medium">Banner</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Banner Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage banner on the home page to advertise new features/promotions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-2 px-4 py-2 border border-border bg-navbarBg rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-customShadow">
            <Eye className="w-4 h-4" />
            View Reports
          </button> */}
          <Link
            href="/admin/support/banner/create"
            className="flex items-center gap-2 px-4 py-2 bg-bgBlue hover:bg-bgBlue/80 text-white rounded-lg font-medium transition-colors shadow-customShadow"
          >
            <Plus className="w-4 h-4" />
            Create
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {/* <BannerStats /> */}

      {/* Banner Table */}
      <BannerTable />
    </div>
  );
}