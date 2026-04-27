"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useTheme } from 'next-themes';
import { Users, DollarSign, Percent, TrendingUp, TrendingDown, UserPlus, ChevronDown, Download, Target, Zap, Home, TargetIcon, ChevronRight, HomeIcon, FileSpreadsheet } from 'lucide-react';
import Dropdown from '@/components/shared/Dropdown';
import Link from 'next/link';
import {
  useGetFinancialStatsQuery,
  useGetMrrStatsQuery,
  useGetMrrTrendQuery,
  useGetFinancialBreakdownQuery,
} from "@/redux/api/admin/financialreportApi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';


const FinancialReport = () => {
  const { theme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('mrr');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  const [timeRange, setTimeRange] = useState(30);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const timeRangeString = useMemo(() => {
    if (timeRange === 1) return "last 1 day";
    if (timeRange === 7) return "last 7 days";
    if (timeRange === 365) return "last 1 year";
    return "last 30 days";
  }, [timeRange]);

  // API Queries
  const { data: statsData, isLoading: isStatsLoading } = useGetFinancialStatsQuery({ timeRange: timeRangeString });
  const { data: mrrStatsData } = useGetMrrStatsQuery({ timeRange: timeRangeString });
  const { data: mrrTrendData } = useGetMrrTrendQuery({ timeRange: timeRangeString });
  const { data: breakdownData } = useGetFinancialBreakdownQuery({ timeRange: timeRangeString });

  const data = useMemo(() => {
    const stats = statsData?.data || {};
    const mrrStats = mrrStatsData?.data || {};
    const mrrTrend = mrrTrendData?.data?.mrrTrend || [];
    const componentBreakdown = breakdownData?.data?.componentBreakdown || [];

    return {
      summary: {
        mrr: stats.mrr?.value || 0,
        mrrGrowth: stats.mrr?.growth || 0,
        mrrPeriod: stats.mrr?.period || "",
        arr: stats.arr?.value || 0,
        arrGrowth: stats.arr?.growth || 0,
        arrPeriod: stats.arr?.period || "",
        churnRate: stats.churnRate?.value || 0,
        churnRateGrowth: stats.churnRate?.growth || 0,
        churnRatePeriod: stats.churnRate?.period || "",
        arpu: stats.arpu?.value || 0,
        arpuGrowth: stats.arpu?.growth || 0,
        arpuPeriod: stats.arpu?.period || "",
        newSubscriptions: stats.newSubscriptions?.value || 0,
        newSubscriptionsGrowth: stats.newSubscriptions?.growth || 0,
        newSubscriptionsPeriod: stats.newSubscriptions?.period || ""
      },
      mrrArr: {
        newSales: mrrStats.summary?.newSales || 0,
        upgrades: mrrStats.summary?.upgrades || 0,
        downgrades: mrrStats.summary?.downgrades || 0,
        churned: mrrStats.summary?.churned || 0,
        mrrTrend: mrrTrend.map((item: any) => ({
          month: item.label,
          mrr: item.value
        })),
        monthlyBreakdown: componentBreakdown.map((item: any) => ({
          month: item.label,
          churned: item.churned,
          downgrades: item.downgrades,
          newSales: item.newSales,
          upgrades: item.upgrades
        })),
        annualRevenue: mrrStats.footer?.annualRecurringRevenue || 0,
        growthRate: mrrStats.footer?.growthRate || 0
      },
      // Other tabs will have empty data as their APIs were removed
      churn: {
        newSignups: 0,
        cancellations: 0,
        netGrowth: 0,
        retentionRate: 0,
        activityData: [],
        churnByPlan: []
      },
      plans: {
        starter: { subscribers: 0, revenue: 0, avgUser: 0, churnRate: 0, growth: 0 },
        business: { subscribers: 0, revenue: 0, avgUser: 0, churnRate: 0, growth: 0 },
        enterprise: { subscribers: 0, revenue: 0, avgUser: 0, churnRate: 0, growth: 0 },
        revenueData: [],
        subscribersData: []
      },
      arpu: {
        overall: 0,
        starter: 0,
        business: 0,
        enterprise: 0,
        arpuTrend: [],
        growthFactors: []
      },
      trials: {
        overallConversion: 0,
        trialsStarted: 0,
        convertedToPaid: 0,
        avgTrialDuration: 0,
        conversionByPlan: [],
        topFeature: 'N/A',
        featureUsage: 0,
        avgTimeToConvert: 0
      }
    };
  }, [statsData, mrrStatsData, mrrTrendData, breakdownData]);

  const timeRanges = [
    { value: 1, label: 'Last 1 day' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 365, label: 'Last 1 year' }
  ];

  const tabs = [
    { id: 'mrr', label: 'MRR/ARR' },
    { id: 'churn', label: 'Churn' },
    { id: 'plans', label: 'Plans' },
    { id: 'arpu', label: 'ARPU' },
    { id: 'trials', label: 'Trials' }
  ];

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
              <Link href="/admin/dashboard">
                <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span>Reports & Analytics</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-bgBlue dark:text-blue-400 font-medium">Financial Report</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Financial Report</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comprehensive financial analytics and subscription metrics
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown
              value={timeRanges.find(t => t.value === timeRange)?.label || ''}
              options={timeRanges.map(t => t.label)}
              onChange={(label) => setTimeRange(timeRanges.find(t => t.label === label)?.value || 30)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-navbarBg border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <span className='border border-border rounded-full p-2'><DollarSign className="w-4 h-4 text-red-500" /></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">MRR</span>
            </div>
            <div className="text-2xl font-bold mb-1">${data.summary.mrr.toLocaleString()}</div>
            <div className={`text-xs ${data.summary.mrrGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {data.summary.mrrGrowth >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              {data.summary.mrrGrowth}% {data.summary.mrrPeriod}
            </div>
          </div>

          <div className="bg-navbarBg border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <span className='border border-border rounded-full p-2'><TargetIcon className="w-4 h-4 text-green-500" /></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">ARR</span>
            </div>
            <div className="text-2xl font-bold mb-1">${data.summary.arr.toLocaleString()}</div>
            <div className={`text-xs ${data.summary.arrGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {data.summary.arrGrowth >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              {data.summary.arrGrowth}% {data.summary.arrPeriod}
            </div>
          </div>

          <div className="bg-navbarBg border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <span className='border border-border rounded-full p-2'><Percent className="w-4 h-4 text-red-500" /></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Churn Rate</span>
            </div>
            <div className="text-2xl font-bold mb-1">{data.summary.churnRate}%</div>
            <div className={`text-xs ${data.summary.churnRateGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {data.summary.churnRateGrowth >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              {data.summary.churnRateGrowth}% {data.summary.churnRatePeriod}
            </div>
          </div>

          <div className="bg-navbarBg border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <span className='border border-border rounded-full p-2'><TrendingUp className="w-4 h-4 text-green-500" /></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">ARPU</span>
            </div>
            <div className="text-2xl font-bold mb-1">${data.summary.arpu}</div>
            <div className={`text-xs ${data.summary.arpuGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {data.summary.arpuGrowth >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              {data.summary.arpuGrowth}% {data.summary.arpuPeriod}
            </div>
          </div>

          <div className="bg-navbarBg border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <span className='border border-border rounded-full p-2'><UserPlus className="w-4 h-4 text-green-500" /></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">New Subscriptions</span>
            </div>
            <div className="text-2xl font-bold mb-1">{data.summary.newSubscriptions}</div>
            <div className={`text-xs ${data.summary.newSubscriptionsGrowth >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
              {data.summary.newSubscriptionsGrowth >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
              {data.summary.newSubscriptionsGrowth} {data.summary.newSubscriptionsPeriod}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-navbarBg rounded-full border border-border p-1.5 mb-6 inline-flex gap-2 overflow-x-auto max-w-full scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800 shadow-customShadow'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* MRR/ARR Tab */}
        {activeTab === 'mrr' && (
          <div className="space-y-6">
            <div className="bg-navbarBg border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">Monthly Recurring Revenue (MRR)</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Track recurring revenue trends and components</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Sales</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">${data.mrrArr.newSales.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="bg-white dark:bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Upgrades</div>
                  <div className="text-3xl font-bold text-cyan-500 dark:text-cyan-400">${data.mrrArr.upgrades.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="bg-white dark:bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Downgrades</div>
                  <div className="text-3xl font-bold text-orange-400 dark:text-orange-300">-${Math.abs(data.mrrArr.downgrades).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="bg-white dark:bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Churned</div>
                  <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">-${Math.abs(data.mrrArr.churned).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={data.mrrArr.mrrTrend}>
                  <defs>
                    <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="month"
                    className="fill-gray-600 dark:fill-gray-400"
                    tick={{ fontSize: 12 }}
                    interval={timeRange === 30 ? 4 : 0}
                  />
                  <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '0.5rem'
                    }}
                    wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '20px' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorMRR)" 
                    name="MRR" 
                  />
                </AreaChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={300} className="mt-8">
                <BarChart data={data.mrrArr.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                  <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '0.5rem'
                    }}
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number | undefined) => value !== undefined ? [`$${Math.abs(value).toLocaleString()}`, undefined] : ['', undefined]}
                    wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="rect"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                  <ReferenceLine y={0} stroke={isDark ? '#4b5563' : '#9ca3af'} />
                  <Bar dataKey="churned" fill="#ec4899" name="Churn" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="downgrades" fill="#fbbf24" name="Downgrades" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="newSales" fill="#8b5cf6" name="New Sales" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="upgrades" fill="#06b6d4" name="Upgrades" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#f5f3ff] dark:bg-purple-900/20 rounded-xl p-8 border border-purple-100 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Annual Recurring Revenue</div>
                  <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">${data.mrrArr.annualRevenue.toLocaleString()}</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400 mt-2">Based on current MRR</div>
                </div>
                <div className="flex items-center justify-center w-16 h-16 rounded-full border-4 border-purple-400/30">
                   <div className="w-8 h-8 rounded-full border-4 border-purple-400/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                   </div>
                </div>
              </div>

              <div className="bg-[#f0f9ff] dark:bg-cyan-900/20 rounded-xl p-8 border border-cyan-100 dark:border-cyan-800 flex items-center justify-between">
                <div>
                  <div className="text-sm text-cyan-600 dark:text-cyan-400 mb-1">Growth Rate</div>
                  <div className="text-4xl font-bold text-cyan-700 dark:text-cyan-300">{data.mrrArr.growthRate}%</div>
                  <div className="text-xs text-cyan-500 dark:text-cyan-400 mt-2">Month-over-month</div>
                </div>
                <TrendingUp className="w-16 h-16 text-cyan-500 opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Churn Tab */}
        {activeTab === 'churn' && (
          <div className="space-y-6">
            <div className="bg-navbarBg border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-2">Subscriber Activity & Churn Analysis</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Monitor subscription lifecycle and retention</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className='flex items-center justify-between border border-border rounded-xl p-4'>
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">New Sign-ups</div>
                    <div className="text-2xl font-bold text-green-800">{data.churn.newSignups}</div>
                  </div>
                  <span className="flex items-center justify-center"><UserPlus className="w-8 h-8 text-green-800" /></span>
                </div>
                <div className='flex items-center justify-between border border-border rounded-xl p-4'>
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Cancellations</div>
                    <div className="text-2xl font-bold text-[#E7000B]">{data.churn.cancellations}</div>
                  </div>
                  <span className="flex items-center justify-center"><TrendingDown className="w-8 h-8 text-[#E7000B]" /></span>
                </div>
                <div className='flex items-center justify-between border border-border rounded-xl p-4'>
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Net Growth</div>
                    <div className="text-2xl font-bold text-[#9810FA]">+{data.churn.netGrowth}</div>
                  </div>
                  <span className="flex items-center justify-center"><TrendingUp className="w-8 h-8 text-[#9810FA]" /></span>
                </div>
                <div className='flex items-center justify-between border border-border rounded-xl p-4'>
                  <div className="flex flex-col gap-2 mb-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Retention Rate</div>
                    <div className="text-2xl font-bold text-[#0092B8]">{data.churn.retentionRate}%</div>
                  </div>
                  <span className="flex items-center justify-center"><Percent className="w-8 h-8 text-[#0092B8]" /></span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.churn.activityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="month"
                    className="fill-gray-600 dark:fill-gray-400"
                    tick={{ fontSize: 12 }}
                    interval={timeRange === 30 ? 4 : 0}
                  />
                  <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '0.5rem'
                    }}
                    wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                  />
                  <Legend />
                  <Bar dataKey="cancellations" fill="#ef4444" name="Cancellations" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netGrowth" fill="#8b5cf6" name="Net Growth" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="newSignups" fill="#10b981" name="New Sign-ups" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-navbarBg border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Churn Rate by Plan</h2>
              <div className="space-y-4">
                {data.churn.churnByPlan.map((plan: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{plan.plan}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{plan.rate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                        style={{ width: `${plan.rate * 20}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <h2 className="text-lg font-semibold mb-2">Plan Performance Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Comparative analysis of subscription tiers</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg p-4 border border-yellow-300 dark:border-yellow-700">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">Starter</div>
                  <div className="text-3xl font-bold mb-2">{data.plans.starter.subscribers}</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">subscribers</div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className="font-semibold">${data.plans.starter.revenue.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg/User:</span>
                      <span className="font-semibold">${data.plans.starter.avgUser}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Churn Rate:</span>
                      <span className="font-semibold">{data.plans.starter.churnRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Growth:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">+{data.plans.starter.growth}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">Business</div>
                  <div className="text-3xl font-bold mb-2">{data.plans.business.subscribers}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">subscribers</div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className="font-semibold">${data.plans.business.revenue.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg/User:</span>
                      <span className="font-semibold">${data.plans.business.avgUser}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Churn Rate:</span>
                      <span className="font-semibold">{data.plans.business.churnRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Growth:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">+{data.plans.business.growth}%</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 border border-purple-300 dark:border-purple-700">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-2">Enterprise</div>
                  <div className="text-3xl font-bold mb-2">{data.plans.enterprise.subscribers}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">subscribers</div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Revenue:</span>
                      <span className="font-semibold">${data.plans.enterprise.revenue.toLocaleString()}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Avg/User:</span>
                      <span className="font-semibold">${data.plans.enterprise.avgUser}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Churn Rate:</span>
                      <span className="font-semibold">{data.plans.enterprise.churnRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Growth:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">+{data.plans.enterprise.growth}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.plans.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="plan" className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                    <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '0.5rem'
                      }}
                      wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                    />
                    <Bar dataKey="revenue" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="text-lg font-semibold mb-4">Subscribers</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.plans.subscribersData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="plan" className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                    <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '0.5rem'
                      }}
                      wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                    />
                    <Bar dataKey="subscribers" fill="#06B6D4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ARPU Tab */}
        {activeTab === 'arpu' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Average Revenue Per User (ARPU)</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track revenue per subscriber month</p>
                </div>
                {/* <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-600 cursor-pointer">
                  Export
                </button> */}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl p-4 border border-border">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Overall ARPU</div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">${data.arpu.overall}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Per month</div>
                </div>
                <div className="rounded-xl p-4 border border-border">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Starter ARPU</div>
                  <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">${data.arpu.starter}</div>
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">Per month</div>
                </div>
                <div className="rounded-xl p-4 border border-border">
                  <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Business ARPU</div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">${data.arpu.business}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">+2.3% growth</div>
                </div>
                <div className="rounded-xl p-4 border border-border">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Enterprise ARPU</div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">${data.arpu.enterprise}</div>
                  <div className="text-xs text-red-600 dark:text-red-400">-1.8% growth</div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.arpu.arpuTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="month"
                    className="fill-gray-600 dark:fill-gray-400"
                    tick={{ fontSize: 12 }}
                    interval={timeRange === 30 ? 4 : 0}
                  />
                  <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '0.5rem'
                    }}
                    wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                  />
                  <Legend />
                  <Line type="monotone" dataKey="business" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Business" />
                  <Line type="monotone" dataKey="enterprise" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} name="Enterprise" />
                  <Line type="monotone" dataKey="overall" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Overall ARPU" />
                  <Line type="monotone" dataKey="starter" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Starter" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">ARPU Growth Factors</h3>
              <div className="space-y-4">
                {data.arpu.growthFactors.map((factor: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{factor.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{factor.description}</div>
                    </div>
                    <div className={`text-lg font-bold ${factor.impact.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                      {factor.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trials Tab */}
        {activeTab === 'trials' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Trial Conversion Rate</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track trial-to-paid conversion metrics</p>
                </div>
                {/* <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-600">
                  Export
                </button> */}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className='rounded-xl p-4 border border-border'>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Overall Conversion</div>
                  <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{data.trials.overallConversion}%</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Last 14 days</div>
                </div>
                <div className='rounded-xl p-4 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trials Started</div>
                  <div className="text-3xl font-bold">{data.trials.trialsStarted}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">This month</div>
                </div>
                <div className='rounded-xl p-4 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Converted to Paid</div>
                  <div className="text-3xl font-bold">{data.trials.convertedToPaid}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">This month</div>
                </div>
                <div className='rounded-xl p-4 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Trial Duration</div>
                  <div className="text-3xl font-bold">{data.trials.avgTrialDuration}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">days (14-day trial)</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-sm">Conversion by Plan</h3>
                {data.trials.conversionByPlan.map((plan: any, idx: number) => (
                  <div key={idx} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{plan.plan}</span>
                      <span className="text-sm font-semibold">{plan.rate}% conversion</span>
                    </div>
                    <div className="flex items-center gap-0 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                      <div
                        className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium h-full"
                        style={{ width: `${(plan.trials / (plan.trials)) * 50}%` }}
                      >
                        {plan.trials} trials
                      </div>
                      <div
                        className="bg-cyan-500 flex items-center justify-center text-white text-xs font-medium h-full"
                        style={{ width: `${(plan.converted / (plan.trials)) * 50}%` }}
                      >
                        {plan.converted} converted
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold mb-4">Conversion Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-green-700 dark:text-green-400 mb-1">Top Converting Feature</div>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-300 mb-1">{data.trials.topFeature}</div>
                      <div className="text-sm text-green-600 dark:text-green-500">Used by {data.trials.featureUsage}% of converts</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-400 mb-1">Avg Time to Convert</div>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{data.trials.avgTimeToConvert} days</div>
                      <div className="text-sm text-blue-600 dark:text-blue-500">After trial start</div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;