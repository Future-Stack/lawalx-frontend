"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Download,
  ChevronDown,
  Monitor,
  FileText,
  HardDrive,
  Flag,
  Image as ImageIcon,
  Home,
  ChevronRight
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  useGetContentDashboardQuery,
  useLazyGetContentExportQuery
} from "@/redux/api/admin/contentreportApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { addPdfHeader } from "@/lib/pdfUtils";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { formatBytes } from "@/lib/content-utils";

// Define the time range options
const TIME_RANGES = [
  { label: "Last 1 day", value: "1d" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 1 month", value: "1m" },
  { label: "Last 1 year", value: "1y" },
];

const ContentAndProgramsReport = () => {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  // State for time range filter
  const [selectedRange, setSelectedRange] = useState(TIME_RANGES[2]); // Default to 1 month
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [triggerExport] = useLazyGetContentExportQuery();

  useEffect(() => {
    const range = searchParams.get('timeRange');
    if (range) {
      const found = TIME_RANGES.find(t => t.value === range);
      if (found) {
        setSelectedRange(found);
      }
    }
  }, [searchParams]);

  const getSubtextColorClass = (subtext: string) => {
    if (!subtext) return "text-gray-400 dark:text-gray-500";
    const clean = subtext.toLowerCase();
    if (clean.includes('+') || clean.includes('increase') || clean.includes('growth') || clean.includes('improvement')) {
      return "text-green-500";
    }
    if (clean.includes('-') || clean.includes('decrease') || clean.includes('regression') || clean.includes('decline') || clean.includes('failed')) {
      return "text-red-500";
    }
    return "text-gray-400 dark:text-gray-500";
  };

  const handleExportPDF = async () => {
    let toastId: string | number | undefined;
    try {
      toastId = toast.loading("Preparing PDF report...");
      const { data: exportData, isError } = await triggerExport({});

      if (isError || !exportData?.success) {
        if (toastId) toast.dismiss(toastId);
        toast.error("Failed to fetch export data");
        return;
      }

      // Export API returns: totalFiles, exportedAt, files[]
      const files = exportData.data?.files || [];
      const totalFiles = exportData.data?.totalFiles || files.length;
      const exportedAt = exportData.data?.exportedAt
        ? new Date(exportData.data.exportedAt).toLocaleString()
        : new Date().toLocaleString();

      const doc = new jsPDF({ orientation: "landscape" });
      const timeRangeLabel = selectedRange.label;

      // Branded header with logo
      let currentY = await addPdfHeader(
        doc,
        'Content And Programs Report',
        `Period: ${timeRangeLabel}  |  Generated: ${exportedAt}`
      );

      // Section 1: Summary
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text('1. Export Summary', 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Metric', 'Value']],
        body: [
          ['Total Files', totalFiles.toLocaleString()],
          ['Exported At', exportedAt],
        ],
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 2: Content File Inventory
      if (currentY > 150) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text('2. Content File Inventory', 14, currentY);

      const tableColumn = ["#", "File Name", "File Type", "Size", "Type", "Duration (s)", "Uploaded By", "Created At"];
      const tableRows = files.map((file: any, index: number) => [
        index + 1,
        file.originalName || 'N/A',
        file.fileType || 'N/A',
        file.size ? formatBytes(file.size) : 'N/A',
        file.type || 'N/A',
        file.duration ?? 'N/A',
        file.user?.username || 'N/A',
        file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A',
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: currentY + 5,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 7, overflow: 'visible' },
      });

      doc.save(`Content_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      if (toastId) toast.dismiss(toastId);
      toast.success("Content report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      if (toastId) toast.dismiss(toastId);
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

      const files = exportData.data?.files || [];
      const wb = XLSX.utils.book_new();
      const wsData: any[] = [
        ["Index", "Name", "Type", "Size", "User", "Created At"],
        ...files.map((file: any, index: number) => [
          index + 1,
          file.originalName || 'N/A',
          file.type || 'N/A',
          file.size ? formatBytes(file.size) : 'N/A',
          file.user?.username || 'N/A',
          file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'N/A'
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Content Files');
      XLSX.writeFile(wb, `content-report-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Content report exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("An error occurred while exporting the report");
    }
  };

  // API Queries
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetContentDashboardQuery({ filter: selectedRange.value });

  // --- Dynamic Data Mapping from API ---
  const reportData = useMemo(() => {
    const data = dashboardData?.data || {};

    // Extract topMetrics from API response
    const topMetrics = data.topMetrics || {};

    // KPI Data — mapped from topMetrics
    const kpi = {
      totalDevice: topMetrics.totalDevice?.value || 0,
      totalDeviceSub: topMetrics.totalDevice?.subText || '',
      contentItems: topMetrics.contentItems?.value || 0,
      contentItemsSub: topMetrics.contentItems?.subText || '',
      storageUsed: topMetrics.storageUsed?.value || '0 MB',
      storageUsedSub: topMetrics.storageUsed?.subText || '',
      unusedContent: topMetrics.unusedContent?.value || 0,
      unusedContentSub: topMetrics.unusedContent?.subText || '',
    };

    // Content Type Distribution
    const distribution = (data.contentTypeDistribution || []).map((item: any) => ({
      name: item.type,
      value: item.percentage,
      items: item.storage,
      percentage: `${item.percentage}%`
    }));

    // Content Quality Stats — API returns totalContentItems, activeContent, unusedContent
    const quality = data.contentQualityStats || {};
    const qualityStats = {
      total: quality.totalContentItems || 0,
      active: quality.activeContent || 0,
      unused: quality.unusedContent || 0,
    };

    // Usage Trends
    const trends = (data.contentUsageTrends || []).map((item: any, idx: number) => ({
      id: idx + 1,
      title: item.category,
      count: item.count,
      type: item.type
    }));

    return { kpi, distribution: distribution.length > 0 ? distribution : [], qualityStats, trends };
  }, [dashboardData]);

  const COLORS = ["#9BA4ED", "#86Dba8", "#FCD34D", "#FB7185"]; // Matches the image colors roughly

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
            <Link href="/admin/dashboard">
              <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Reports & Analytics</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-bgBlue dark:text-blue-400 font-medium">Content And Programs</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Content And Programs
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            User behavior, system access, and accountability tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-4 py-2 bg-navbarBg border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors md:min-w-[160px] justify-between"
            >
              <span>{selectedRange.label}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-full md:w-48 bg-navbarBg border border-border rounded-lg shadow-lg z-20 py-1">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => {
                        setSelectedRange(range);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedRange.value === range.value
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
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

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Total Devices */}
        <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Devices</h3>
            <Monitor className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {reportData.kpi.totalDevice.toLocaleString()}
            </span>
            <span className={`text-xs ${getSubtextColorClass(reportData.kpi.totalDeviceSub)}`}>
              {reportData.kpi.totalDeviceSub}
            </span>
          </div>
        </div>

        {/* Card 2: Content Items */}
        <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Content Items</h3>
            <FileText className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {reportData.kpi.contentItems.toLocaleString()}
            </span>
            <span className={`text-xs ${getSubtextColorClass(reportData.kpi.contentItemsSub)}`}>
              {reportData.kpi.contentItemsSub}
            </span>
          </div>
        </div>

        {/* Card 3: Storage Used */}
        <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Storage Used</h3>
            <HardDrive className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {reportData.kpi.storageUsed}
            </span>
            <span className={`text-xs ${getSubtextColorClass(reportData.kpi.storageUsedSub)}`}>
              {reportData.kpi.storageUsedSub}
            </span>
          </div>
        </div>

        {/* Card 4: Unused Content */}
        <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Unused Content</h3>
            <Flag className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-red-500 mb-1">
              {reportData.kpi.unusedContent.toLocaleString()}
            </span>
            <span className={`text-xs ${getSubtextColorClass(reportData.kpi.unusedContentSub)}`}>
              {reportData.kpi.unusedContentSub}
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Left: Content Type Distribution */}
        <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-8">
            Content Type Distribution
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Donut Chart */}
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.distribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {reportData.distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#fff',
                      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                      borderRadius: '0.5rem',
                      color: theme === 'dark' ? '#F3F4F6' : '#111827'
                    }}
                    itemStyle={{ color: theme === 'dark' ? '#F3F4F6' : '#111827' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend/Stats */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 w-full sm:w-auto">
              {reportData.distribution.map((item: any, index: number) => (
                <div key={item.name} className="flex items-start gap-2">
                  <span
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.percentage}</span>
                      <span className="text-xs text-gray-400">{item.items}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Content Quality Stats */}
        <div className="bg-navbarBg p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-8">
            Content Quality Stats
          </h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total Content Items</span>
              <span className="font-semibold text-gray-900 dark:text-white text-base">
                {reportData.qualityStats.total.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Active Content</span>
              <span className="font-semibold text-green-500 text-base">
                {reportData.qualityStats.active.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Unused Content</span>
              <span className="font-semibold text-orange-500 text-base">
                {reportData.qualityStats.unused.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Usage Trends */}
      {/* <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 ml-1">
        Content Usage Trends
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {reportData.trends.map((item: any) => (
          <div key={item.id} className="bg-navbarBg p-5 rounded-xl border border-border shadow-sm">
            <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
              {item.title}
            </h4>
            <div className="mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.count.toLocaleString()}
              </span>
            </div>
            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300 font-medium">
              {item.type}
            </span>
          </div>
        ))}
      </div> */}

    </div>
  );
};

export default ContentAndProgramsReport;
