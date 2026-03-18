'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, MousePointer, Clock, CheckSquare, FileText, Headphones, RefreshCw, AlertCircle, MoreVertical, ChevronDown, Plus, Crown, DollarSign, Shield, Webhook, TvMinimal, FileVideo } from 'lucide-react';
import AddUserModal from '@/components/Admin/usermanagement/AddUserModal';
import {
  useGetDashboardOverviewQuery,
  useGetSubscriptionDistributionQuery,
  useGetActivityTrendQuery,
  useGetRealTimeMetricsQuery,
  useGetRecentSupportTicketsQuery,
  useGetContentUsageBreakdownQuery,
  useGetPaymentBreakdownQuery,
  useLazyGetDashboardExportQuery,
} from '@/redux/api/admin/dashbaordApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import Link from 'next/link';

type DateRange = '1d' | '7d' | '1m' | '1y';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  changeValue?: string;
  isPositive: boolean;
  subtitle?: string;
  isLoading?: boolean;
}

interface ActivityItem {
  user: string;
  action: string;
  details: string;
  time: string;
  badge?: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
}




const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, change, isPositive, subtitle, isLoading }) => (
  <div className="bg-navbarBg rounded-lg p-5 shadow-sm border border-border">
    {isLoading ? (
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    ) : (
      <>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-gray-500 dark:text-gray-400 p-2 rounded-full border border-border">{icon}</div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{title}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="flex items-center gap-1.5 text-xs">
            {isPositive ? (
              <span className="text-green-600 dark:text-green-400">{change}</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">{change}</span>
            )}
            <span className="text-gray-500 dark:text-gray-400">From Last Period</span>
          </div>
          {subtitle && <div className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">{subtitle}</div>}
        </div>
      </>
    )}
  </div>
);

const DashboardHeader: React.FC<{ onExport: () => void; onExportExcel: () => void; onAddClientClick: () => void }> = ({
  onExport,
  onExportExcel,
  onAddClientClick
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="border-b border-border pb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monitor system performance and manage client operations</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(prev => !prev)}
            className="text-nowrap px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className='hidden lg:block'>Export Overview Report</span>
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-1 bg-navbarBg border border-border rounded-lg shadow-lg z-10 min-w-[160px]">
              <button onClick={() => { onExport(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg cursor-pointer">📄 PDF</button>
              <button onClick={() => { onExportExcel(); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg cursor-pointer">📊 Excel</button>
            </div>
          )}
        </div>
        <button className="text-nowrap px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-navbarBg border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5 transition-colors">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className='hidden lg:block'>View Critical Alerts</span>
        </button>
        <button
          onClick={onAddClientClick}
          className="text-nowrap px-3 py-2 text-xs font-medium text-white bg-bgBlue rounded-md shadow-customShadow hover:bg-blue-500 dark:hover:bg-blue-500 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden lg:block">Add New Client</span>
        </button>
      </div>
    </div>
  </div>
  );
};

const DateSelector: React.FC<{ dateRange: DateRange; onDateRangeChange: (range: DateRange) => void }> = ({ dateRange, onDateRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const dateRangeOptions: { value: DateRange; label: string }[] = [
    { value: '1d', label: '1 Day' },
    { value: '7d', label: '7 Days' },
    { value: '1m', label: '1 Month' },
    { value: '1y', label: '1 Year' }
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const selectedOption = dateRangeOptions.find(opt => opt.value === dateRange);

  return (
    <div className="flex items-center justify-center flex-col sm:flex-row sm:justify-start gap-3 mb-5">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-navbarBg border border-border rounded-md text-[.65rem] md:text-xs text-nowrap">
        <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">{currentDate}</span>
      </div>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-navbarBg border border-border rounded-md text-[.65rem] md:text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-nowrap"
        >
          <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">Date Range:</span>
          <span className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-400">
            {selectedOption?.label}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-navbarBg border border-border rounded-md shadow-lg z-10 min-w-[140px]">
            {dateRangeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onDateRangeChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${dateRange === option.value ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SubscriptionDistribution: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetSubscriptionDistributionQuery(dateRange);

  const data = useMemo(() => {
    if (!apiData?.success || !apiData.data?.plans) {
      return [
        { name: 'Starter', value: 0, color: '#3B82F6' },
        { name: 'Business', value: 0, color: '#FB923C' },
        { name: 'Enterprise', value: 0, color: '#FDE047' }
      ];
    }

    const colors = ['#3B82F6', '#FB923C', '#FDE047', '#10B981', '#A78BFA'];
    return apiData.data.plans.map((plan: any, index: number) => ({
      name: plan.planName,
      value: plan.count,
      color: colors[index % colors.length]
    }));
  }, [apiData]);

  const total = useMemo(() => data.reduce((sum: number, item: any) => sum + item.value, 0), [data]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Subscription Plan Distribution</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Active subscribers by tier</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-pointer" />
      </div>

      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center my-4">
            <div className="relative" style={{ width: '180px', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{total}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {data.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-700 dark:text-gray-300">{item.name} ({item.value})</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Link href="/admin/reports/subscription-&-billing-report" className="flex justify-end mt-4">
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View Details</button>
      </Link>

    </div>
  );
};

const PlatformActivityTrend: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetActivityTrendQuery(dateRange);

  const data = useMemo(() => {
    if (!apiData?.success || !apiData.data?.data) return [];
    return apiData.data.data.map((item: any) => ({
      label: item.label,
      dailyLogins: item.dailyLogins,
      totalProgress: item.totalProgress,
      totalRevenue: item.totalRevenue
    }));
  }, [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Platform Activity Trend</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Daily active users and task progress</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-pointer" />
      </div>

      <div className="flex items-center justify-end gap-4 mb-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Daily Logins</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Total Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[240px] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E5E7EB', backgroundColor: '#fff' }}
              labelStyle={{ color: '#374151' }}
            />
            <Area
              type="monotone"
              dataKey="totalRevenue"
              stroke="#22D3EE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="totalProgress"
              stroke="#A78BFA"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
            />
            <Area
              type="monotone"
              dataKey="dailyLogins"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLogins)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

const ContentUsageBreakdown: React.FC<{ title: string; subtitle: string; type: 'uploaded' | 'payments'; dateRange: DateRange }> = ({ title, subtitle, type, dateRange }) => {
  const { data: contentData, isLoading: isContentLoading } = useGetContentUsageBreakdownQuery(dateRange, { skip: type !== 'uploaded' });
  const { data: paymentData, isLoading: isPaymentLoading } = useGetPaymentBreakdownQuery(dateRange, { skip: type !== 'payments' });

  const data = useMemo(() => {
    if (type === 'uploaded') {
      if (!contentData?.success || !contentData.data?.byType) return [];
      return contentData.data.byType.map((item: any) => ({
        label: item.type,
        uploaded: item.uploaded,
        views: item.viewed || 0
      }));
    } else {
      if (!paymentData?.success || !paymentData.data?.breakdown) return [];
      // Flatten payment status into an object per label for comparison or just use as is
      return paymentData.data.breakdown.map((item: any) => ({
        label: item.status,
        count: item.count,
        percentage: item.percentage
      }));
    }
  }, [type, contentData, paymentData]);

  const keys = type === 'uploaded' ? ['uploaded', 'views'] : ['count', 'percentage'];
  const colors = type === 'uploaded' ? ['#3B82F6', '#93C5FD'] : ['#3B82F6', '#FB923C'];
  const labels = type === 'uploaded' ? ['Uploaded', 'Views'] : ['Count', 'Percentage (%)'];
  const isLoading = type === 'uploaded' ? isContentLoading : isPaymentLoading;

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <MoreVertical className="w-4 h-4 text-gray-300 dark:text-gray-600 cursor-pointer" />
      </div>

      {isLoading ? (
        <div className="h-[180px] flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              stroke="#E5E7EB"
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E5E7EB' }}
            />
            <Bar dataKey={keys[0]} fill={colors[0]} radius={[3, 3, 0, 0]} barSize={type === 'uploaded' ? 40 : 20} />
            <Bar dataKey={keys[1]} fill={colors[1]} radius={[3, 3, 0, 0]} barSize={type === 'uploaded' ? 40 : 20} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <Link href="/admin/reports/content-and-programs" className="flex justify-end mt-4">
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View Details</button>
      </Link>

    </div>
  );
};

const RecentCriticalActivity: React.FC = () => {
  const { data: apiData, isLoading } = useGetRealTimeMetricsQuery({});

  const activities = useMemo(() => {
    if (!apiData?.success || !apiData.data?.recentActivities) return [];
    return apiData.data.recentActivities.map((activity: any) => ({
      user: activity.userName || activity.userId,
      action: activity.action,
      details: activity.details || '',
      time: activity.time || 'recent',
      badge: activity.severity || 'Info'
    }));
  }, [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Recent Critical Activity</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Showing {activities.length} activities</p>
        </div>
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View All</button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse h-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: any, idx: number) => (
            <div key={idx} className="pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">{activity.user}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${activity.badge === 'Critical' || activity.badge === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    }`}>
                    {activity.badge}
                  </span>
                </div>
                <MoreVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 cursor-pointer" />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{activity.action}</p>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">{activity.time}</span>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center py-4 text-xs text-gray-500">No recent activities found</div>
          )}
        </div>
      )}
    </div>
  );
};

const RecentSupportTickets: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetRecentSupportTicketsQuery({ limit: 4, filter: dateRange });

  const tickets = useMemo(() => {
    if (!apiData?.success || !apiData.data) return [];
    // The API might return tickets differently, adjusting based on provided types
    return (apiData.data.tickets || []).map((ticket: any) => ({
      id: ticket.id,
      title: ticket.subject || ticket.title,
      description: ticket.description || '',
      priority: ticket.priority || 'Medium',
      status: ticket.status || 'Open'
    }));
  }, [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Recent Support Tickets</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Priority tickets needing attention</p>
        </div>
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View All</button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="animate-pulse h-10 bg-gray-100 dark:bg-gray-800 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
              <span className="text-xs text-gray-700 dark:text-gray-300">{ticket.title}</span>
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ticket.priority === 'High' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                  {ticket.priority}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {ticket.status}
                </span>
                <MoreVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="text-center py-4 text-xs text-gray-500">No support tickets found</div>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  // Fetch Overview Data
  const { data: overviewData, isLoading: isOverviewLoading } = useGetDashboardOverviewQuery(dateRange);

  const stats = useMemo(() => {
    if (!overviewData?.success || !overviewData.data) return null;
    return overviewData.data;
  }, [overviewData]);

  const [triggerExport] = useLazyGetDashboardExportQuery();

  const handleExport = async () => {
    try {
      const { data: exportData, isError } = await triggerExport(dateRange);

      if (isError || !exportData) {
        toast.error("Failed to fetch export data");
        return;
      }

      const rawData = exportData.dashboard;
      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(18);
      doc.text('Dashboard Overview Report', 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Filter: ${dateRange} | Exported At: ${new Date().toLocaleString()}`, 14, 30);

      // 1. Overview Section
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Overview Metrics', 14, 45);

      const overview = rawData?.overview || {};
      const overviewRows = [
        ['Total Users', overview.totalUsers, `${overview.usersGrowth}%`],
        ['Active Users', overview.activeUsers, `${overview.activeUsersGrowth}%`],
        ['Active Subscriptions', overview.activeSubscriptions, `${overview.subscriptionGrowth}%`],
        ['Total Revenue', `$${overview.totalRevenue}`, `${overview.revenueGrowth}%`],
        ['Active Devices', overview.activeDevices, `${overview.deviceGrowth}%`],
        ['Total Content Items', overview.totalContentItems, `${overview.contentGrowth}%`],
        ['Open Support Tickets', overview.openSupportTickets, `${overview.ticketGrowth}%`],
        ['System Uptime', `${overview.systemUptime}%`, `${overview.uptimeGrowth}%`],
        ['Avg API Response Time', `${overview.avgApiResponseTime}ms`, `${overview.apiResponseGrowth}%`],
      ];

      autoTable(doc, {
        head: [['Metric', 'Value', 'Growth']],
        body: overviewRows,
        startY: 50,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      });

      // 2. Subscription Plans
      const subStartY = ((doc as any).lastAutoTable?.cursor?.y || 150) + 15;
      doc.setFontSize(14);
      doc.text('Subscription Plans', 14, subStartY);

      const plans = rawData?.subscriptionPlans?.plans || [];
      const planRows = plans.map((p: any) => [p.planName, p.count, `${p.percentage}%`]);

      autoTable(doc, {
        head: [['Plan Name', 'Count', 'Percentage']],
        body: planRows,
        startY: subStartY + 5,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
      });

      // 3. Content Summary
      const contentStartY = ((doc as any).lastAutoTable?.cursor?.y || subStartY + 40) + 15;
      doc.setFontSize(14);
      doc.text('Content Summary', 14, contentStartY);

      const contentByType = rawData?.content?.byType || [];
      const contentRows = contentByType.map((c: any) => [c.type, c.uploaded, `${c.growth}%`]);

      autoTable(doc, {
        head: [['Content Type', 'Uploaded', 'Growth']],
        body: contentRows,
        startY: contentStartY + 5,
        theme: 'striped',
        headStyles: { fillColor: [249, 115, 22] },
      });

      doc.save(`dashboard-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Dashboard report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred while exporting the report");
    }
  };

  const handleExportExcel = async () => {
    try {
      const { data: exportData, isError } = await triggerExport(dateRange);
      if (isError || !exportData) {
        toast.error("Failed to fetch export data");
        return;
      }

      const rawData = exportData.dashboard;
      const wb = XLSX.utils.book_new();

      // Overview sheet
      const overview = rawData?.overview || {};
      const overviewRows = [
        ['Metric', 'Value', 'Growth'],
        ['Total Users', overview.totalUsers || 0, `${overview.usersGrowth || 0}%`],
        ['Active Users', overview.activeUsers || 0, `${overview.activeUsersGrowth || 0}%`],
        ['Active Subscriptions', overview.activeSubscriptions || 0, `${overview.subscriptionGrowth || 0}%`],
        ['Total Revenue', `$${overview.totalRevenue || 0}`, `${overview.revenueGrowth || 0}%`],
        ['Active Devices', overview.activeDevices || 0, `${overview.deviceGrowth || 0}%`],
        ['Total Content Items', overview.totalContentItems || 0, `${overview.contentGrowth || 0}%`],
        ['Open Support Tickets', overview.openSupportTickets || 0, `${overview.ticketGrowth || 0}%`],
        ['System Uptime', `${overview.systemUptime || 0}%`, `${overview.uptimeGrowth || 0}%`],
        ['Avg API Response Time', `${overview.avgApiResponseTime || 0}ms`, `${overview.apiResponseGrowth || 0}%`],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewRows), 'Overview');

      // Subscription Plan sheet
      const plans = rawData?.subscriptionPlans?.plans || [];
      const planRows = [
        ['Plan Name', 'Count', 'Percentage'],
        ...plans.map((p: any) => [p.planName || '', p.count || 0, `${p.percentage || 0}%`])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(planRows), 'Subscription Plans');

      // Content summary sheet
      const contentByType = rawData?.content?.byType || [];
      const contentRows = [
        ['Content Type', 'Uploaded', 'Growth'],
        ...contentByType.map((c: any) => [c.type || '', c.uploaded || 0, `${c.growth || 0}%`])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(contentRows), 'Content Summary');

      XLSX.writeFile(wb, `dashboard-report-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Dashboard report exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("An error occurred while exporting the report");
    }
  };

  const handleAddClient = (data: any) => {
    console.log("New client added:", data);
    alert(`New client ${data.fullName} (${data.email}) added successfully!`);
    setIsAddClientModalOpen(false); // Close modal after success
  };

  return (
    <div className="min-h-screen">
      <DashboardHeader
        onExport={handleExport}
        onExportExcel={handleExportExcel}
        onAddClientClick={() => setIsAddClientModalOpen(true)}
      />

      <div className="mt-6">
        <DateSelector dateRange={dateRange} onDateRangeChange={setDateRange} />

        {/* Metrics Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <MetricCard
            icon={<Users className="w-4 h-4" />}
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || '0'}
            change={`${stats?.usersGrowth || 0}%`}
            isPositive={(stats?.usersGrowth || 0) >= 0}
            subtitle={`Active: ${stats?.activeUsers || 0} | Inactive: ${stats?.inactiveUsers || 0}`}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<Crown className="w-4 h-4" />}
            title="Active Subscriptions"
            value={stats?.activeSubscriptions?.toLocaleString() || '0'}
            change={`${stats?.subscriptionGrowth || 0}%`}
            isPositive={(stats?.subscriptionGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            title="Monthly Recurring Revenue"
            value={`$${stats?.totalRevenue?.toLocaleString() || '0'}`}
            change={`${stats?.revenueGrowth || 0}%`}
            isPositive={(stats?.revenueGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<Shield className="w-4 h-4" />}
            title="System Uptime"
            value={`${stats?.systemUptime || 0}%`}
            change={`${stats?.uptimeGrowth || 0}%`}
            isPositive={(stats?.uptimeGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
        </div>

        {/* Metrics Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
          <MetricCard
            icon={<Webhook className="w-4 h-4" />}
            title="Avg API Response Time"
            value={`${stats?.avgApiResponseTime || 0}ms`}
            change={`${stats?.apiResponseGrowth || 0}%`}
            isPositive={(stats?.apiResponseGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<TvMinimal className="w-4 h-4" />}
            title="Active Devices"
            value={stats?.activeDevices?.toLocaleString() || '0'}
            change={`${stats?.deviceGrowth || 0}%`}
            isPositive={(stats?.deviceGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<FileVideo className="w-4 h-4" />}
            title="Total Content Items"
            value={stats?.totalContentItems?.toLocaleString() || '0'}
            change={`${stats?.contentGrowth || 0}%`}
            isPositive={(stats?.contentGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<Headphones className="w-4 h-4" />}
            title="Open Support Tickets"
            value={stats?.openSupportTickets || 0}
            change={`${stats?.ticketGrowth || 0}%`}
            isPositive={(stats?.ticketGrowth || 0) >= 0}
            isLoading={isOverviewLoading}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <SubscriptionDistribution dateRange={dateRange} />
          <div className="lg:col-span-2">
            <PlatformActivityTrend dateRange={dateRange} />
          </div>
        </div>

        {/* Content Usage Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ContentUsageBreakdown
            title="Content Usage Breakdown"
            subtitle="Volume of content pertaining above the week"
            type="uploaded"
            dateRange={dateRange}
          />
          <ContentUsageBreakdown
            title="Content Usage Breakdown"
            subtitle="Volume of recurring bans or failed payments (On a weekly scale)"
            type="payments"
            dateRange={dateRange}
          />
        </div>

        {/* Activity and Tickets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-5">
          <RecentCriticalActivity />
          <RecentSupportTickets dateRange={dateRange} />
        </div>
      </div>

      {/* THE REUSABLE ADD USER / CLIENT MODAL */}
      <AddUserModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAddUser={handleAddClient}
      />


      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .min-h-screen, .min-h-screen * {
            visibility: visible;
          }
          .min-h-screen {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
