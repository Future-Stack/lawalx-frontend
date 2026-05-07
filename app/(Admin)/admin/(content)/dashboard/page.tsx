'use client';

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, MousePointer, Clock, CheckSquare, FileText, Headphones, RefreshCw, AlertCircle, ChevronDown, Plus, Crown, DollarSign, Shield, Webhook, TvMinimal, FileVideo } from 'lucide-react';
import AddUserModal from '@/components/Admin/usermanagement/AddUserModal';
import {
  useGetDashboardOverviewQuery,
  useGetSubscriptionDistributionQuery,
  useGetActivityTrendQuery,
  useGetContentUsageBreakdownQuery,
  useGetDunningEffectivenessQuery,
  useGetCriticalActivityQuery,
  useGetRecentSupportTicketsQuery,
  useLazyGetDashboardExportQuery,
} from '@/redux/api/admin/dashbaordApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeader } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import Link from 'next/link';
import TicketDetailsDialog from '../support/support-tickets/_components/TicketDetailsDialog';
import { useGetAdminTicketDetailsQuery, type Ticket } from '@/redux/api/admin/support/adminSupportTicketApi';

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
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
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
              className="cursor-pointer text-nowrap px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors"
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
          {/* <button className="text-nowrap px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-navbarBg border border-red-200 dark:border-red-900/50 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5 transition-colors">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className='hidden lg:block'>View Critical Alerts</span>
        </button> */}
          <button
            onClick={onAddClientClick}
            className="cursor-pointer text-nowrap px-3 py-2 text-xs font-medium text-white bg-bgBlue rounded-md shadow-customShadow hover:bg-blue-500 dark:hover:bg-blue-500 flex items-center gap-1.5 transition-colors"
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
    { value: '1m', label: '30 Days' },
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
      name: plan.name,
      value: plan.count,
      color: colors[index % colors.length]
    }));
  }, [apiData]);

  const total = useMemo(() => data.reduce((sum: number, item: any) => sum + item.value, 0), [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-[11px] font-bold text-gray-900 dark:text-white mb-1.5 border-b border-gray-100 dark:border-gray-700 pb-1">
            {payload[0].name}
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              Subscribers: <span className="font-semibold text-gray-900 dark:text-white">{payload[0].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subscription Plan Distribution</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Active subscribers by tier</p>
        </div>
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
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomTooltip />}
                    position={{ y: -20 }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

      <Link href="/admin/reports/financial-reports?tab=plans" className="flex justify-end mt-4">
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
      dailyUsers: item.dailyUsers,
      totalScreens: item.totalScreens,
      totalDevices: item.totalDevices
    }));
  }, [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Platform Activity Trend</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Daily active users and task progress</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 mb-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Daily Users</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-purple-500 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Total Programs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-cyan-400 rounded-sm"></div>
          <span className="text-gray-600 dark:text-gray-400">Total Devices</span>
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
              contentStyle={{
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Area
              type="monotone"
              dataKey="totalDevices"
              stroke="#22D3EE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="totalScreens"
              stroke="#A78BFA"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
            />
            <Area
              type="monotone"
              dataKey="dailyUsers"
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
  const { data: dunningData, isLoading: isDunningLoading } = useGetDunningEffectivenessQuery(dateRange, { skip: type !== 'payments' });

  const data = useMemo(() => {
    if (type === 'uploaded') {
      if (!contentData?.success || !contentData.data?.byType) return [];
      return contentData.data.byType.map((item: any) => ({
        label: item.type,
        uploaded: item.uploaded,
        used: item.used || 0
      }));
    } else {
      if (!dunningData?.success || !dunningData.data?.data) return [];
      return dunningData.data.data.map((item: any) => ({
        label: item.label,
        failedPayments: item.failedPayments
      }));
    }
  }, [type, contentData, dunningData]);

  const keys = type === 'uploaded' ? ['uploaded', 'used'] : ['failedPayments'];
  const colors = type === 'uploaded' ? ['#3B82F6', '#93C5FD'] : ['#EF4444'];
  const labels = type === 'uploaded' ? ['Uploaded', 'Used'] : ['Failed Payments'];
  const isLoading = type === 'uploaded' ? isContentLoading : isDunningLoading;

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
        </div>
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
              contentStyle={{
                fontSize: '11px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Bar dataKey={keys[0]} fill={colors[0]} radius={[3, 3, 0, 0]} barSize={type === 'uploaded' ? 40 : 30} />
            {type === 'uploaded' && <Bar dataKey={keys[1]} fill={colors[1]} radius={[3, 3, 0, 0]} barSize={40} />}
          </BarChart>
        </ResponsiveContainer>
      )}

      <Link href={type === 'uploaded' ? "/admin/reports/content-and-programs" : "/admin/reports/subscription-&-billing-report?tab=failed-payment"} className="flex justify-end mt-4">
        <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View Details</button>
      </Link>

    </div>
  );
};

const RecentCriticalActivity: React.FC<{ dateRange: DateRange }> = ({ dateRange }) => {
  const { data: apiData, isLoading } = useGetCriticalActivityQuery(dateRange);
  const activities = useMemo(() => apiData?.data?.slice(0, 5) || [], [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Critical Activity</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Security and system events</p>
        </div>
        <Link href="/admin/dashboard/recent-crititcal-activity">
          <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View All</button>
        </Link>
      </div>

      <div className="flex-grow flex flex-col gap-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          ))
        ) : (
          <>
            {activities.map((activity: any, idx: number) => (
              <div key={idx} className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
                <div className="flex items-center justify-start gap-4">
                  <span className="text-base font-bold text-gray-900 dark:text-white">{activity.user?.name || 'Unknown'}</span>
                  <span className={`px-1.5 py-0.5 rounded-xl text-[9px] bg-gray-200 dark:bg-gray-50/30 text-gray-800 dark:text-gray-200 uppercase tracking-tight`}>
                    {activity.label}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 dark:text-gray-400 line-clamp-2 mb-1 leading-relaxed">{activity.action}</p>
                <div className="flex items-center gap-1 text-[12px] text-gray-400 dark:text-gray-500 mt-auto">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-500">No recent activities found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const RecentSupportTickets: React.FC<{ dateRange: DateRange; onTicketClick: (ticket: any) => void }> = ({ dateRange, onTicketClick }) => {
  const { data: apiData, isLoading } = useGetRecentSupportTicketsQuery({ limit: 5, filter: dateRange });
  const tickets = useMemo(() => apiData?.data?.tickets || [], [apiData]);

  return (
    <div className="bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Support Tickets</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">User inquiries and reports</p>
        </div>
        <Link href="/admin/support/support-tickets">
          <button className="text-xs text-black dark:text-white hover:text-blue-400 dark:hover:text-blue-300 cursor-pointer font-medium px-3 py-1.5 border border-border shadow-customShadow rounded-md">View All</button>
        </Link>
      </div>

      <div className="flex-grow flex flex-col gap-3">
        {isLoading ? (
          [1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-1 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-md"></div>
          ))
        ) : (
          <>
            {tickets.map((ticket: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onTicketClick(ticket)}
                className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all group cursor-pointer flex flex-col justify-center"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-mono font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{ticket.ticketId}</span>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="text-base font-bold text-gray-900 dark:text-white truncate leading-snug">{ticket.subject}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${ticket.priority === 'High'
                          ? 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50'
                          : ticket.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50'
                            : 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50'
                          }`}>
                          {ticket.priority}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 text-gray-500 border border-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700">
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-500">No support tickets found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Fetch Overview Data
  const { data: overviewData, isLoading: isOverviewLoading } = useGetDashboardOverviewQuery(dateRange);
  const [triggerExport] = useLazyGetDashboardExportQuery();

  const handleTicketClick = (ticket: any) => {
    const statusMap: Record<string, any> = {
      'Open': 'Opened',
      'InProgress': 'In Progress',
      'Resolved': 'Resolved',
      'Closed': 'Closed',
    };

    const priorityMap: Record<string, any> = {
      'Low': 'Low',
      'Medium': 'Medium',
      'High': 'High'
    };

    const firstAssignment = ticket.assignments?.length > 0 ? ticket.assignments[0] : null;
    const assignedTo = firstAssignment?.user ? {
      id: firstAssignment.user.id || firstAssignment.supporterId || undefined,
      name: firstAssignment.user.username || 'Supporter',
      initials: (firstAssignment.user.username || 'S').substring(0, 2).toUpperCase(),
      role: firstAssignment.user.role || 'Support',
    } : null;

    const mappedTicket: Ticket = {
      id: ticket.id,
      ticketId: ticket.ticketId || ticket.customId || ticket.id,
      company: {
        name: ticket.user?.username || 'Unknown',
        iconBg: 'bg-blue-500',
        iconText: ticket.user?.username?.charAt(0)?.toUpperCase() || 'U',
        imageUrl: ticket.user?.image_url
      },
      subject: ticket.subject,
      status: statusMap[ticket.status] || ticket.status || 'Opened',
      lastUpdated: new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString(),
      priority: priorityMap[ticket.priority] || ticket.priority || 'Normal',
      assignedTo,
      description: ticket.description,
      createdAt: new Date(ticket.createdAt).toLocaleDateString(),
      updatedAt: new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString(),
      raw: ticket,
    };

    setSelectedTicket(mappedTicket);
    setIsTicketModalOpen(true);
  };

  const stats = useMemo(() => {
    if (!overviewData?.success || !overviewData.data) return null;
    return overviewData.data;
  }, [overviewData]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} report...`);
      const { data: exportResponse } = await triggerExport(dateRange);
      toast.dismiss();

      if (!exportResponse || !exportResponse.success) {
        toast.error('Failed to fetch export data');
        return;
      }

      const reportData = exportResponse.data.dashboard;
      const timeRangeLabel = dateRange === '1d' ? '1 Day' : dateRange === '7d' ? '7 Days' : dateRange === '1m' ? '30 Days' : '1 Year';

      if (format === 'pdf') {
        const doc = new jsPDF();

        // Branded header with logo
        let currentY = await addPdfHeader(
          doc,
          'Dashboard Overview Report',
          `Period: ${timeRangeLabel}  |  Generated: ${new Date().toLocaleString()}`
        );

        // Section 1: Key Metrics
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.text('1. Key Metrics Summary', 14, currentY);

        const summaryStats = [
          ['Metric', 'Value', 'Growth %'],
          ['Total Users', (reportData.overview.totalUsers.value || 0).toLocaleString(), `${reportData.overview.totalUsers.growth || 0}%`],
          ['Active Subscriptions', (reportData.overview.activeSubscriptions.value || 0).toLocaleString(), `${reportData.overview.activeSubscriptions.growth || 0}%`],
          ['MRR', `$${(reportData.overview.monthlyRecurringRevenue.value || 0).toLocaleString()}`, `${reportData.overview.monthlyRecurringRevenue.growth || 0}%`],
          ['Active Devices', (reportData.overview.activeDevices.value || 0).toLocaleString(), `${reportData.overview.activeDevices.growth || 0}%`],
          ['Open Support Tickets', (reportData.overview.openSupportTickets.value || 0).toString(), `${reportData.overview.openSupportTickets.growth || 0}%`],
        ];

        autoTable(doc, {
          startY: currentY + 5,
          head: [summaryStats[0]],
          body: summaryStats.slice(1),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 2: Subscription Distribution
        doc.setFontSize(14);
        doc.text('2. Subscription Distribution', 14, currentY);
        const planHeader = ['Plan Name', 'Count', 'Growth %'];
        const planRows = reportData.subscriptionDistribution.plans.map((p: any) => [
          p.name,
          (p.count || 0).toLocaleString(),
          `${p.growth || 0}%`
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [planHeader],
          body: planRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [139, 92, 246] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 3: Activity Trend
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('3. Activity Trend', 14, currentY);
        const trendHeader = ['Day', 'Daily Users', 'Screens', 'Devices'];
        const trendRows = reportData.activityTrend.data.map((d: any) => [
          d.label,
          (d.dailyUsers || 0).toLocaleString(),
          (d.totalScreens || 0).toLocaleString(),
          (d.totalDevices || 0).toLocaleString()
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [trendHeader],
          body: trendRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 4: Content Usage Breakdown
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('4. Content Usage Breakdown', 14, currentY);
        const contentHeader = ['Type', 'Uploaded', 'Used', 'Growth %'];
        const contentRows = reportData.contentUsageBreakdown.byType.map((c: any) => [
          c.type,
          (c.uploaded || 0).toLocaleString(),
          (c.used || 0).toLocaleString(),
          `${c.growth || 0}%`
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [contentHeader],
          body: contentRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [245, 158, 11] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 5: Payment Breakdown
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('5. Payment Breakdown', 14, currentY);
        const paymentHeader = ['Status', 'Count', 'Percentage', 'Growth %'];
        const paymentRows = reportData.paymentBreakdown.breakdown.map((p: any) => [
          p.status,
          (p.count || 0).toLocaleString(),
          `${p.percentage || 0}%`,
          `${p.growth || 0}%`
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [paymentHeader],
          body: paymentRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [107, 114, 128] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 6: Support Tickets
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('6. Support Tickets Summary', 14, currentY);
        const supportHeader = ['Ticket ID', 'Subject', 'Priority', 'Status', 'Date'];
        const supportRows = reportData.recentSupportTickets.tickets.map((t: any) => [
          t.ticketId,
          t.subject,
          t.priority,
          t.status,
          new Date(t.createdAt).toLocaleDateString()
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [supportHeader],
          body: supportRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 7: Recent Critical Activity
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('7. Recent Critical Activity', 14, currentY);
        const activityHeader = ['User', 'Action', 'Label', 'Timestamp'];
        const activityRows = reportData.criticalActivity.map((a: any) => [
          a.user?.name || 'N/A',
          a.action,
          a.label,
          new Date(a.timestamp).toLocaleString()
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [activityHeader],
          body: activityRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] }
        });

        doc.save(`Dashboard_Report_${dateRange}.pdf`);
      } else {
        // EXCEL EXPORT
        const wb = XLSX.utils.book_new();

        // 1. Excel Export Details
        const exportDetailsData = [
          ['Dashboard Overview Report'],
          ['Period', timeRangeLabel],
          ['Generated At', new Date().toLocaleString()],
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(exportDetailsData), 'Excel Export Details');

        // 2. Overview
        const overviewMetricsData = [
          ['Metric', 'Value', 'Growth %'],
          ['Total Users', reportData.overview.totalUsers.value || 0, reportData.overview.totalUsers.growth || 0],
          ['Active Subscriptions', reportData.overview.activeSubscriptions.value || 0, reportData.overview.activeSubscriptions.growth || 0],
          ['MRR', reportData.overview.monthlyRecurringRevenue.value || 0, reportData.overview.monthlyRecurringRevenue.growth || 0],
          ['Active Devices', reportData.overview.activeDevices.value || 0, reportData.overview.activeDevices.growth || 0],
          ['Open Support Tickets', reportData.overview.openSupportTickets.value || 0, reportData.overview.openSupportTickets.growth || 0],
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewMetricsData), 'Overview');

        // 3. Subscription Distribution
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.subscriptionDistribution.plans), 'Subscriptions');

        // 4. Activity Trend
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.activityTrend.data), 'Activity Trend');

        // 5. Content Usage
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.contentUsageBreakdown.byType), 'Content Usage');

        // 6. Payments
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.paymentBreakdown.breakdown), 'Payments');

        // 7. Support Tickets
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reportData.recentSupportTickets.tickets), 'Support Tickets');

        // 8. Critical Activities
        const wsActivities = XLSX.utils.json_to_sheet(reportData.criticalActivity.map((a: any) => ({
          User: a.user?.name,
          Action: a.action,
          Label: a.label,
          Timestamp: new Date(a.timestamp).toLocaleString()
        })));
        XLSX.utils.book_append_sheet(wb, wsActivities, 'Critical Activities');

        XLSX.writeFile(wb, `Dashboard_Report_${dateRange}.xlsx`);
      }
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('An error occurred during export');
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
        onExport={() => handleExport('pdf')}
        onExportExcel={() => handleExport('excel')}
        onAddClientClick={() => setIsAddClientModalOpen(true)}
      />

      <div className="mt-6">
        <DateSelector dateRange={dateRange} onDateRangeChange={setDateRange} />

        {/* Metrics Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
          <MetricCard
            icon={<Users className="w-4 h-4" />}
            title="Total Users"
            value={stats?.totalUsers?.value?.toLocaleString() || '0'}
            change={`${stats?.totalUsers?.growth || 0}%`}
            isPositive={(stats?.totalUsers?.growth || 0) >= 0}
            subtitle={`Active: ${stats?.totalUsers?.active || 0} | Inactive: ${stats?.totalUsers?.inactive || 0}`}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<Crown className="w-4 h-4" />}
            title="Active Subscriptions"
            value={stats?.activeSubscriptions?.value?.toLocaleString() || '0'}
            change={`${stats?.activeSubscriptions?.growth || 0}%`}
            isPositive={(stats?.activeSubscriptions?.growth || 0) >= 0}
            subtitle='Core revenue health'
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<DollarSign className="w-4 h-4" />}
            title="Monthly Recurring Revenue"
            value={`$${stats?.monthlyRecurringRevenue?.value?.toLocaleString() || '0'}`}
            change={`${stats?.monthlyRecurringRevenue?.growth || 0}%`}
            isPositive={(stats?.monthlyRecurringRevenue?.growth || 0) >= 0}
            subtitle={`ARR: $${stats?.monthlyRecurringRevenue?.arr?.toLocaleString() || '0'}`}
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<TvMinimal className="w-4 h-4" />}
            title="Active Devices"
            value={stats?.activeDevices?.value?.toLocaleString() || '0'}
            change={`${stats?.activeDevices?.growth || 0}%`}
            isPositive={(stats?.activeDevices?.growth || 0) >= 0}
            subtitle='Info Goes Here'
            isLoading={isOverviewLoading}
          />
          <MetricCard
            icon={<Headphones className="w-4 h-4" />}
            title="Open Support Tickets"
            value={stats?.openSupportTickets?.value || 0}
            change={`${stats?.openSupportTickets?.growth || 0}%`}
            isPositive={(stats?.openSupportTickets?.growth || 0) >= 0}
            subtitle='Info Goes Here'
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
            title="Dunning Effectiveness Report"
            subtitle="Highlights failed transactions and measures the success rate of automated retries and recovery efforts."
            type="payments"
            dateRange={dateRange}
          />
        </div>

        {/* Activity and Tickets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-5 items-stretch">
          <RecentCriticalActivity dateRange={dateRange} />
          <RecentSupportTickets dateRange={dateRange} onTicketClick={handleTicketClick} />
        </div>

        {/* Modals */}
        <AddUserModal
          isOpen={isAddClientModalOpen}
          onClose={() => setIsAddClientModalOpen(false)}
          onAddUser={handleAddClient}
        />
        <TicketDetailsDialog
          ticket={selectedTicket}
          open={isTicketModalOpen}
          onClose={() => {
            setIsTicketModalOpen(false);
            setSelectedTicket(null);
          }}
        />
      </div>

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
