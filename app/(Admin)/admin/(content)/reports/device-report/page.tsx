"use client";
import { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Monitor, Wifi, WifiOff, TrendingUp, ChevronDown, Download, FileSpreadsheet, Home, ChevronRight } from 'lucide-react';
import Dropdown from '@/components/shared/Dropdown';
import Link from 'next/link';

import {
  useGetDeviceDashboardQuery,
  useLazyGetDeviceExportQuery
} from '@/redux/api/admin/devicereportApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeader } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const DeviceReportDashboard = () => {
  const [timeRange, setTimeRange] = useState(30);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [triggerExport] = useLazyGetDeviceExportQuery();

  const handleExportPDF = async () => {
    try {
      toast.loading("Preparing PDF report...");
      const { data: exportData, isError } = await triggerExport({});
      toast.dismiss();

      if (isError || !exportData?.success) {
        toast.error("Failed to fetch export data");
        return;
      }

      const devices = exportData.data?.devices || [];
      const stats = exportData.data?.summary || {};
      const regions = exportData.data?.regionalStats || [];

      const doc = new jsPDF();
      const timeRangeLabel = timeRanges.find(t => t.value === timeRange)?.label || 'All Time';

      // Branded header with logo
      let currentY = await addPdfHeader(
        doc,
        'Device Report',
        `Period: ${timeRangeLabel}  |  Generated: ${new Date().toLocaleString()}`
      );

      // Section 1: Device Summary
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text('1. Device Summary', 14, currentY);

      const summaryStats = [
        ['Metric', 'Value'],
        ['Total Devices', (stats.totalDevices || devices.length || 0).toLocaleString()],
        ['Online Devices', (stats.onlineDevices || 0).toLocaleString()],
        ['Offline Devices', (stats.offlineDevices || 0).toLocaleString()],
        ['Average Uptime', `${stats.averageUptime || 0}%`]
      ];

      autoTable(doc, {
        startY: currentY + 5,
        head: [summaryStats[0]],
        body: summaryStats.slice(1),
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] } // Blue-500
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 2: Regional Distribution
      if (regions.length > 0) {
        doc.setFontSize(14);
        doc.text('2. Regional Distribution', 14, currentY);
        const regionRows = regions.map((r: any) => [
          r.region || r.name,
          (r.totalDevices || 0).toLocaleString(),
          (r.onlineDevices || 0).toLocaleString(),
          (r.offlineDevices || 0).toLocaleString(),
          `${((r.onlineDevices / r.totalDevices) * 100 || 0).toFixed(1)}%`
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Region', 'Total', 'Online', 'Offline', 'Online Rate']],
          body: regionRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [139, 92, 246] } // Purple-500
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Section 3: Device Inventory
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text(`${regions.length > 0 ? '3' : '2'}. Device Inventory List`, 14, currentY);

      const tableColumn = ["Index", "Device ID", "Name", "Status", "Region", "Username"];
      const tableRows = devices.map((device: any, index: number) => [
        index + 1,
        device.id || 'N/A',
        device.name || 'N/A',
        device.status || 'N/A',
        device.region || 'N/A',
        device.user?.username || 'N/A'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: currentY + 5,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
        styles: { fontSize: 8 }
      });

      // Save PDF
      doc.save(`Device_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Device report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred while exporting the report");
    }
  };

  const handleExportExcel = async () => {
    try {
      const { data: exportData, isError } = await triggerExport({});
      if (isError || !exportData?.success) {
        toast.error("Failed to fetch export data");
        return;
      }

      const devices = exportData.data?.devices || [];
      const wb = XLSX.utils.book_new();
      const wsData: any[] = [
        ["Index", "Device ID", "Name", "Status", "Region", "Username"],
        ...devices.map((device: any, index: number) => [
          index + 1,
          device.id || 'N/A',
          device.name || 'N/A',
          device.status || 'N/A',
          device.region || 'N/A',
          device.user?.username || 'N/A'
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Devices');
      XLSX.writeFile(wb, `device-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Device report exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("An error occurred while exporting the report");
    }
  };

  const timeRangeString = useMemo(() => {
    if (timeRange === 1) return "1d";
    if (timeRange === 7) return "7d";
    if (timeRange === 365) return "1y";
    return "30d";
  }, [timeRange]);

  // API Queries
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDeviceDashboardQuery({ filter: timeRangeString });

  const data = useMemo(() => {
    const apiData = dashboardData?.data || {};
    const summary = apiData.summary || {};

    const defaultRegions = [
      { name: 'North America', base: 0, online: 0, offline: 0, onlineRate: 0, offlineRate: 0 },
      { name: 'Europe', base: 0, online: 0, offline: 0, onlineRate: 0, offlineRate: 0 },
      { name: 'Asia', base: 0, online: 0, offline: 0, onlineRate: 0, offlineRate: 0 },
      { name: 'South America', base: 0, online: 0, offline: 0, onlineRate: 0, offlineRate: 0 },
      { name: 'Others', base: 0, online: 0, offline: 0, onlineRate: 0, offlineRate: 0 }
    ];

    const regionsFromApi = (apiData.regionalStats || []).map((r: any) => ({
      name: r.region || r.name,
      base: r.totalDevices || r.base || 0,
      online: r.onlineDevices || r.online || 0,
      offline: r.offlineDevices || r.offline || 0,
      onlineRate: (r.onlineDevices / r.totalDevices) || 0,
      offlineRate: (r.offlineDevices / r.totalDevices) || 0
    }));

    return {
      summary: {
        total: summary.totalDevices || 0,
        online: summary.onlineDevices || 0,
        offline: summary.offlineDevices || 0,
        avgUptime: parseFloat(summary.averageUptime || "0")
      },
      regions: regionsFromApi.length > 0 ? regionsFromApi : defaultRegions,
      uptimeData: (apiData.uptimeGraph || []).map((item: any) => ({
        day: item.label,
        uptime: item.value
      }))
    };
  }, [dashboardData]);

  const timeRanges = [
    { value: 1, label: 'Last 1 day' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 365, label: 'Last 1 year' }
  ];

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
              <span className="text-bgBlue dark:text-blue-400 font-medium">Device Report</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Device Report</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monitor and manage all connected devices across customers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown
              value={timeRanges.find(t => t.value === timeRange)?.label || ''}
              options={timeRanges.map(t => t.label)}
              onChange={(label) => setTimeRange(timeRanges.find(t => t.label === label)?.value || 30)}
            />

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(prev => !prev)}
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
                      onClick={() => { handleExportPDF(); setShowExportMenu(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2.5 cursor-pointer border-b border-border group"
                    >
                      <span className="text-red-500 text-lg group-hover:scale-110 transition-transform">📄</span>
                      <span className="font-medium">Export as PDF</span>
                    </button>
                    <button
                      onClick={() => { handleExportExcel(); setShowExportMenu(false); }}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Devices</span>
              <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.summary.total.toLocaleString()}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">From last week</div>
          </div>

          <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Online Devices</span>
              <Wifi className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1 text-green-500">
              {data.summary.online.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {((data.summary.online / data.summary.total) * 100).toFixed(1)}% online
            </div>
          </div>

          <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Offline Devices</span>
              <WifiOff className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold mb-1 text-red-500">
              {data.summary.offline}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Requires attention</div>
          </div>

          {/* <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Average Uptime</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold mb-1">{data.summary.avgUptime.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</div>
          </div> */}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Device Distribution by Region */}
          <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">Device Distribution by Region</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.regions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="name"
                  className="fill-gray-600 dark:fill-gray-400"
                  tick={{ fontSize: 12 }}
                  angle={-15}
                  textAnchor="end"
                  height={60}
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
                <Bar dataKey="online" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="offline" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* System Uptime */}
          {/* <div className="bg-navbarBg rounded-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">
              System Uptime (Last {timeRange === 1 ? '24 Hours' : timeRange === 7 ? '7 Days' : timeRange === 30 ? '30 Days' : 'Year'})
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.uptimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="day"
                  className="fill-gray-600 dark:fill-gray-400"
                  tick={{ fontSize: 12 }}
                  interval={timeRange === 365 ? 30 : timeRange === 30 ? 4 : 0}
                />
                <YAxis
                  domain={[95, 100]}
                  className="fill-gray-600 dark:fill-gray-400"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: '0.5rem'
                  }}
                  wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                  formatter={(value: number | undefined) => value !== undefined ? [`${value.toFixed(2)}%`, 'Uptime'] : ['', '']}
                />
                <Line
                  type="monotone"
                  dataKey="uptime"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div> */}
        </div>

        {/* Regional Device Statistics */}
        <div className="bg-navbarBg rounded-lg p-6 border border-border">
          <h2 className="text-lg font-semibold mb-6">Regional Device Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.regions.map((region: any) => (
              <div key={region.name} className="p-4 rounded-lg border border-border">
                <h3 className="font-semibold mb-3">{region.name}</h3>
                <div className="text-2xl font-bold mb-3">{region.base.toLocaleString()}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-500">Online: {region.online}</span>
                    <span className="text-green-500">{(region.onlineRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-500">Offline: {region.offline}</span>
                    <span className="text-gray-500 dark:text-gray-400">{(region.offlineRate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceReportDashboard;