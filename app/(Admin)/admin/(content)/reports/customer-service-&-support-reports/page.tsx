"use client";

import React, { useState, useMemo } from 'react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CheckCircle, Clock, TrendingUp, Download, Filter, Home, ChevronRight, AlertCircle, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import Dropdown from '@/components/shared/Dropdown';
import Link from 'next/link';
import {
  useGetSupportStatsQuery,
  useGetSupportTrendQuery,
  useGetRecentTicketsQuery,
  useGetSupportCategoriesQuery,
  useGetResponseTrendQuery,
  useGetSupportInsightsQuery,
  useLazyGetExportSupportReportQuery,
} from '@/redux/api/admin/customerSupportReportApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { addPdfHeader } from '@/lib/pdfUtils';
import { toast } from 'sonner';

const CustomerServiceReports = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [page, setPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const limit = 10;

  const { data: statsData, isLoading: statsLoading } = useGetSupportStatsQuery(timeRange);
  const { data: trendData, isLoading: trendLoading } = useGetSupportTrendQuery(timeRange);
  const { data: recentTicketsData, isLoading: recentLoading } = useGetRecentTicketsQuery({ page: 1, limit: 10 });
  const { data: categoriesData, isLoading: categoriesLoading } = useGetSupportCategoriesQuery(timeRange);
  const { data: responseTrendData, isLoading: responseTrendLoading } = useGetResponseTrendQuery(timeRange);
  const { data: insightsData, isLoading: insightsLoading } = useGetSupportInsightsQuery(timeRange);
  const [triggerExport] = useLazyGetExportSupportReportQuery();

  const timeRanges = [
    { value: '1d', label: 'Last 1 day' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '1y', label: 'Last 1 year' }
  ];

  const categoryColors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1'];

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400';
      case 'in progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'resolved': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case 'closed': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'lightning': return <Zap className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />;
      case 'check-circle': return <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />;
      case 'trending-down': return <TrendingDown className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
      case 'trending-up': return <TrendingUp className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400';
      case 'neutral': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400';
      case 'negative': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const processedTrendData = useMemo(() => {
    return trendData?.data?.map((item: any, index: number) => ({
      ...item,
      uniqueLabel: `${item.label}--${index}`
    })) || [];
  }, [trendData]);

  const processedResponseTrendData = useMemo(() => {
    return responseTrendData?.data?.map((item: any, index: number) => ({
      ...item,
      uniqueLabel: `${item.label}--${index}`
    })) || [];
  }, [responseTrendData]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} report...`);
      const { data: exportData } = await triggerExport(timeRange);
      toast.dismiss();

      if (!exportData || !exportData.success) {
        toast.error('Failed to fetch export data');
        return;
      }

      const reportData = exportData.data;

      if (format === 'pdf') {
        const doc = new jsPDF();

        // Branded header with logo
        let currentY = await addPdfHeader(
          doc,
          'Customer Service & Support Report',
          `Period: ${timeRanges.find(t => t.value === timeRange)?.label}  |  Generated: ${new Date().toLocaleString()}`
        );

        // Section 1: Executive Summary
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.text('1. Executive Summary', 14, currentY);

        const summaryStats = [
          ['Metric', 'Value', 'Change %', 'Status'],
          ['Total Tickets', reportData.summary.totalTickets.value.toString(), `${reportData.summary.totalTickets.change}%`, 'N/A'],
          ['Resolved Tickets', reportData.summary.resolvedTickets.value.toString(), `${reportData.summary.resolvedTickets.change}%`, `${reportData.summary.resolvedTickets.resolutionRate}% Rate`],
          ['Avg Response Time', `${reportData.summary.avgResponseTime.value} ${reportData.summary.avgResponseTime.unit}`, `${reportData.summary.avgResponseTime.change}%`, 'N/A'],
          ['Avg Resolution Time', `${reportData.summary.avgResolutionTime.value} ${reportData.summary.avgResolutionTime.unit}`, `${reportData.summary.avgResolutionTime.change}%`, 'N/A'],
        ];

        autoTable(doc, {
          startY: currentY + 5,
          head: [summaryStats[0]],
          body: summaryStats.slice(1),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [139, 92, 246] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 2: Ticket Trend
        doc.setFontSize(14);
        doc.text('2. Ticket Trend Overview', 14, currentY);
        const trendHeader = ['Label', 'Total Tickets', 'Resolved Tickets'];
        const trendRows = (reportData.trends.tickets || []).map((t: any) => [
          t.label,
          t.total.toString(),
          t.resolved.toString()
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [trendHeader],
          body: trendRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 3: Categories
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('3. Tickets by Category', 14, currentY);
        const categoryHeader = ['Category', 'Ticket Count', 'Percentage'];
        const categoryRows = (reportData.categories || []).map((c: any) => [
          c.name,
          c.count.toString(),
          `${c.percentage}%`
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [categoryHeader],
          body: categoryRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 4: Performance Insights
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('4. Performance Insights', 14, currentY);
        const insightRows = (reportData.insights || []).map((i: any) => [
          i.title,
          i.description,
          i.type.toUpperCase()
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [['Insight', 'Description', 'Type']],
          body: insightRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [245, 158, 11] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 5: Recent Tickets
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('5. Recent Support Tickets', 14, currentY);
        const ticketHeader = ['ID', 'Customer', 'Subject', 'Category', 'Priority', 'Status'];
        const ticketRows = (reportData.recentTickets || []).map((t: any) => [
          t.ticketId,
          t.customer,
          t.subject,
          t.category,
          t.priority,
          t.status
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [ticketHeader],
          body: ticketRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Support_Report_${timeRange}.pdf`);
      } else {
        // EXCEL EXPORT
        const wb = XLSX.utils.book_new();

        // Summary
        const summaryData = [
          ['Support Summary Report'],
          ['Period', timeRanges.find(t => t.value === timeRange)?.label],
          ['Generated At', new Date().toLocaleString()],
          [],
          ['Metric', 'Value', 'Change %'],
          ['Total Tickets', reportData.summary.totalTickets.value, reportData.summary.totalTickets.change],
          ['Resolved Tickets', reportData.summary.resolvedTickets.value, reportData.summary.resolvedTickets.change],
          ['Resolution Rate', `${reportData.summary.resolvedTickets.resolutionRate}%`, ''],
          ['Avg Response Time', `${reportData.summary.avgResponseTime.value} ${reportData.summary.avgResponseTime.unit}`, reportData.summary.avgResponseTime.change],
          ['Avg Resolution Time', `${reportData.summary.avgResolutionTime.value} ${reportData.summary.avgResolutionTime.unit}`, reportData.summary.avgResolutionTime.change],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

        // Trends
        if (reportData.trends?.tickets) {
          const wsTrends = XLSX.utils.json_to_sheet(reportData.trends.tickets);
          XLSX.utils.book_append_sheet(wb, wsTrends, 'Ticket Trends');
        }

        // Categories
        if (reportData.categories) {
          const wsCategories = XLSX.utils.json_to_sheet(reportData.categories);
          XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories');
        }

        // Recent Tickets
        if (reportData.recentTickets) {
          const wsTickets = XLSX.utils.json_to_sheet(reportData.recentTickets);
          XLSX.utils.book_append_sheet(wb, wsTickets, 'Recent Tickets');
        }

        XLSX.writeFile(wb, `Support_Report_${timeRange}.xlsx`);
      }
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('An error occurred during export');
    }
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
              <Link href="/admin/dashboard">
                <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span>Reports & Analytics</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-bgBlue dark:text-blue-400 font-medium">Customer Service & Support Reports</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Customer Service & Support Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ticket, support operations, and customer satisfaction
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown
              value={timeRanges.find(t => t.value === timeRange)?.label || ''}
              options={timeRanges.map(t => t.label)}
              onChange={(label) => setTimeRange(timeRanges.find(t => t.label === label)?.value || '30d')}
            />

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 border border-bgBlue text-bgBlue rounded-lg shadow-customShadow flex items-center gap-2 transition-colors text-sm font-medium cursor-pointer bg-navbarBg hover:bg-blue-50 dark:hover:bg-blue-900/20 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 mt-2 bg-navbarBg border border-border rounded-lg shadow-xl z-20 min-w-[170px] overflow-hidden animate-in fade-in zoom-in duration-200">
                    <button
                      onClick={() => { handleExport('pdf'); setShowExportMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2.5 cursor-pointer border-b border-border group"
                    >
                      <span className="text-red-500 text-lg group-hover:scale-110 transition-transform">📄</span>
                      <span className="font-medium">Export as PDF</span>
                    </button>
                    <button
                      onClick={() => { handleExport('excel'); setShowExportMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2.5 cursor-pointer group"
                    >
                      <span className="text-green-500 text-lg group-hover:scale-110 transition-transform">📊</span>
                      <span className="font-medium">Export as Excel</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Total Tickets</div>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">
              {statsLoading ? '...' : statsData?.data.totalTickets.value}
            </div>
            <div className={`text-xs ${statsData?.data.totalTickets.change && statsData.data.totalTickets.change < 0 ? 'text-red-500' : 'text-purple-600 dark:text-purple-400'}`}>
              {statsData?.data.totalTickets.change && statsData.data.totalTickets.change > 0 ? `+${statsData.data.totalTickets.change}%` : `${Math.abs(statsData?.data.totalTickets.change || 0)}%`} change
            </div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Resolved</div>
            <div className="text-3xl font-bold mb-1">
              {statsLoading ? '...' : statsData?.data.resolvedTickets.value}
            </div>
            <div className="text-xs text-green-500">
              {statsData?.data.resolvedTickets.resolutionRate}% resolution rate
            </div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Response Time</div>
            <div className="text-3xl font-bold mb-1">
              {statsLoading ? '...' : `${statsData?.data.avgResponseTime.value} ${statsData?.data.avgResponseTime.unit}`}
            </div>
            <div className={`text-xs ${statsData?.data.avgResponseTime.change && statsData.data.avgResponseTime.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {statsData?.data.avgResponseTime.change && statsData.data.avgResponseTime.change > 0 ? `+${statsData.data.avgResponseTime.change}%` : `${Math.abs(statsData?.data.avgResponseTime.change || 0)}%`} {statsData?.data.avgResponseTime.change && statsData.data.avgResponseTime.change < 0 ? 'regression' : 'improvement'}
            </div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Resolution Time</div>
            <div className="text-3xl font-bold mb-1">
              {statsLoading ? '...' : `${statsData?.data.avgResolutionTime.value} ${statsData?.data.avgResolutionTime.unit}`}
            </div>
            <div className={`text-xs ${statsData?.data.avgResolutionTime.change && statsData.data.avgResolutionTime.change < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {statsData?.data.avgResolutionTime.change && statsData.data.avgResolutionTime.change > 0 ? `+${statsData.data.avgResolutionTime.change}%` : `${Math.abs(statsData?.data.avgResolutionTime.change || 0)}%`} {statsData?.data.avgResolutionTime.change && statsData.data.avgResolutionTime.change < 0 ? 'regression' : 'improvement'}
            </div>
          </div>
        </div>

        {/* Ticket Trend Chart */}
        <div className="bg-navbarBg rounded-lg p-6 border border-border mb-6">
          <h2 className="text-lg font-semibold mb-4">Ticket Trend</h2>
          {trendLoading || !trendData?.data ? (
            <div className="h-[250px] flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : processedTrendData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-gray-500">No data available for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart key={`ticket-trend-${timeRange}`} data={processedTrendData}>
                <defs>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="uniqueLabel"
                  tickFormatter={(value) => value.split('--')[0]}
                  className="fill-gray-600 dark:fill-gray-400"
                  tick={{ fontSize: 12 }}
                  interval={timeRange === '30d' ? 4 : 'preserveStartEnd'}
                />
                <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) => value.split('--')[0]}
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '0.5rem'
                  }}
                  wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb] z-50"
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" isAnimationActive={false} />
                <Area type="monotone" dataKey="total" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTotal)" name="Total Tickets" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-navbarBg rounded-lg p-6 border border-border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Tickets</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Ticket ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Subject</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Priority</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {recentLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="text-xs text-gray-500">Loading tickets...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentTicketsData?.data.map((ticket, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4 text-sm font-medium whitespace-nowrap">{ticket.ticketId}</td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">{ticket.customer}</td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">{ticket.subject}</td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {ticket.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">{ticket.responseTime}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Tickets by Category */}
          <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">Tickets by Category</h2>
            {categoriesLoading ? (
              <div className="h-[280px] flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoriesData?.data as any[]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(name || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoriesData?.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Response Time Trend */}
          <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">Response Time Trend</h2>
            {responseTrendLoading || !responseTrendData?.data ? (
              <div className="h-[300px] flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : processedResponseTrendData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No data available for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart key={`response-trend-${timeRange}`} data={processedResponseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="uniqueLabel"
                    tickFormatter={(value) => value.split('--')[0]}
                    className="fill-gray-600 dark:fill-gray-400"
                    tick={{ fontSize: 12 }}
                    interval={timeRange === '30d' ? 4 : 'preserveStartEnd'}
                  />
                  <YAxis
                    className="fill-gray-600 dark:fill-gray-400"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    labelFormatter={(value) => value.split('--')[0]}
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      border: '1px solid var(--tooltip-border)',
                      borderRadius: '0.5rem'
                    }}
                    wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb] z-50"
                    formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(1)} min`, 'Avg Response (min)'] : ['', '']}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgResponse"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Avg Response (min)"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-navbarBg rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insightsLoading ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-12 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Loading insights...</span>
              </div>
            ) : (
              insightsData?.data.map((insight, idx) => (
                <div key={idx} className={`rounded-lg p-4 border ${getInsightBg(insight.type)}`}>
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.icon)}
                    <div>
                      <div className="font-medium mb-1">{insight.title}</div>
                      <div className="text-sm opacity-90">{insight.description}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceReports;