"use client";

import React, { useState, useMemo } from 'react';
import { useGetCriticalActivityQuery } from '@/redux/api/admin/dashbaordApi';
import { HomeIcon, ChevronRight, Clock, Calendar, ChevronDown, Shield, User, Filter, RefreshCw } from 'lucide-react';
import Link from 'next/link';

type DateRange = '1d' | '7d' | '1m' | '1y';

const RecentCriticalActivityPage = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { data: apiData, isLoading, refetch } = useGetCriticalActivityQuery(dateRange);

  const activities = useMemo(() => apiData?.data || [], [apiData]);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '1m', label: '30 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const selectedOption = dateRangeOptions.find(opt => opt.value === dateRange);

  return (
    <div className="min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/admin/dashboard">
          <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/admin/dashboard" className="hover:text-bgBlue">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-bgBlue dark:text-blue-400 font-medium">Recent Critical Activity</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Critical Activity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitoring security and system-critical events across the platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* <button 
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-bgBlue border border-border rounded-lg bg-navbarBg shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button> */}

          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-navbarBg border border-border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Period: {selectedOption?.label}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 bg-navbarBg border border-border rounded-lg shadow-xl z-20 min-w-[160px] overflow-hidden">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${dateRange === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-navbarBg border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                  </tr>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity: any) => (
                  <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-bgBlue">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{activity.user?.name || 'Unknown User'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{activity.action}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                        {activity.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Shield className="w-8 h-8 text-gray-300" />
                      <p>No critical activities found for this period.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentCriticalActivityPage;
