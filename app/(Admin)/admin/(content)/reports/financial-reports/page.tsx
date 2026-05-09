"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useTheme } from 'next-themes';
import { Users, DollarSign, Percent, TrendingUp, TrendingDown, UserPlus, ChevronDown, Download, Target, Zap, Home, TargetIcon, ChevronRight, HomeIcon, FileSpreadsheet } from 'lucide-react';
import Dropdown from '@/components/shared/Dropdown';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  useGetFinancialStatsQuery,
  useGetMrrStatsQuery,
  useGetMrrTrendQuery,
  useGetFinancialBreakdownQuery,
  useGetChurnStatsQuery,
  useGetChurnTrendQuery,
  useGetChurnRateByPlanQuery,
  useGetPlanStatsQuery,
  useGetPlanRevenueQuery,
  useGetPlanSubscribersQuery,
  useGetTrialStatsQuery,
  useGetTrialConvertByPlanQuery,
  useGetArpuStatsQuery,
  useGetArpuTrendQuery,
  useGetExportFinancialReportQuery,
  useLazyGetExportFinancialReportQuery,
} from "@/redux/api/admin/financialreportApi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeader } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { getCurrencySymbol } from '@/lib/currencyUtils';

const FinancialReport = () => {
  const { theme, resolvedTheme } = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('mrr');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');
  const currency = useSelector((state: RootState) => state.settings.currency);
  const currencySymbol = getCurrencySymbol(currency);

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
  const { data: churnStatsData } = useGetChurnStatsQuery({ timeRange: timeRangeString });
  const { data: churnTrendData } = useGetChurnTrendQuery({ timeRange: timeRangeString });
  const { data: churnRateByPlanData } = useGetChurnRateByPlanQuery({ timeRange: timeRangeString });
  const { data: planStatsData } = useGetPlanStatsQuery({ timeRange: timeRangeString });
  const { data: planRevenueData } = useGetPlanRevenueQuery({ timeRange: timeRangeString });
  const { data: planSubscribersData } = useGetPlanSubscribersQuery({ timeRange: timeRangeString });
  const { data: trialStatsData } = useGetTrialStatsQuery({ timeRange: timeRangeString });
  const { data: trialConvertData } = useGetTrialConvertByPlanQuery({ timeRange: timeRangeString });
  const { data: arpuStatsData } = useGetArpuStatsQuery({ timeRange: timeRangeString });
  const { data: arpuTrendData } = useGetArpuTrendQuery({ timeRange: timeRangeString });
  const [triggerExport] = useLazyGetExportFinancialReportQuery();

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      toast.loading(`Preparing ${format.toUpperCase()} report...`);
      const { data: exportData } = await triggerExport({ timeRange: timeRangeString });
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
          'Financial Report',
          `Period: ${reportData.mrrTrend.period}  |  Generated: ${new Date().toLocaleString()}`
        );

        // Section 1: Executive Summary
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);
        doc.text('1. Executive Summary', 14, currentY);

        const summaryStats = [
          ['Metric', 'Value', 'Growth %', 'Status'],
          ['MRR', `${currencySymbol}${(reportData.stats?.mrr?.value || 0).toLocaleString()}`, `${reportData.stats?.mrr?.growth || 0}%`, (reportData.stats?.mrr?.growth || 0) >= 0 ? 'GROWING' : 'ATTENTION'],
          ['ARR', `${currencySymbol}${(reportData.stats?.arr?.value || 0).toLocaleString()}`, `${reportData.stats?.arr?.growth || 0}%`, (reportData.stats?.arr?.growth || 0) >= 0 ? 'GROWING' : 'ATTENTION'],
          ['Churn Rate', `${reportData.stats?.churnRate?.value || 0}%`, `${reportData.stats?.churnRate?.growth || 0}%`, (reportData.stats?.churnRate?.growth || 0) <= 0 ? 'HEALTHY' : 'STRESS'],
          ['ARPU', `${currencySymbol}${(reportData.stats?.arpu?.value || 0).toLocaleString()}`, `${reportData.stats?.arpu?.growth || 0}%`, 'STABLE'],
          ['New Subs', (reportData.stats?.newSubscriptions?.value || 0).toString(), `${reportData.stats?.newSubscriptions?.growth || 0}%`, 'N/A'],
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

        // Section 2: MRR & Revenue Movement
        doc.setFontSize(14);
        doc.text('2. MRR Movement Breakdown', 14, currentY);
        const mrrMovement = [
          ['Component', 'Value'],
          ['New Sales', `${currencySymbol}${reportData.mrr.summary.newSales.toLocaleString()}`],
          ['Upgrades', `${currencySymbol}${reportData.mrr.summary.upgrades.toLocaleString()}`],
          ['Downgrades', `-${currencySymbol}${Math.abs(reportData.mrr.summary.downgrades).toLocaleString()}`],
          ['Churned', `-${currencySymbol}${Math.abs(reportData.mrr.summary.churned).toLocaleString()}`],
          ['Net New MRR', `${currencySymbol}${reportData.mrr.summary.netNewMrr.toLocaleString()}`],
          ['Annual RR', `${currencySymbol}${reportData.mrr.footer.annualRecurringRevenue.toLocaleString()}`],
        ];
        autoTable(doc, {
          startY: currentY + 5,
          head: [mrrMovement[0]],
          body: mrrMovement.slice(1),
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 3: Churn & Retention
        doc.setFontSize(14);
        doc.text('3. Churn & Retention Analytics', 14, currentY);
        const churnStats = [
          ['Metric', 'Value'],
          ['New Sign-ups', reportData.churn.newSignUps.toString()],
          ['Cancellations', reportData.churn.cancellations.toString()],
          ['Net Growth', reportData.churn.netGrowth.toString()],
          ['Retention Rate', `${reportData.churn.retentionRate}%`],
        ];
        autoTable(doc, {
          startY: currentY + 5,
          head: [churnStats[0]],
          body: churnStats.slice(1),
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Check for page break
        if (currentY > 230) { doc.addPage(); currentY = 20; }

        // Section 4: Plan Performance
        doc.setFontSize(14);
        doc.text('4. Plan Performance Overview', 14, currentY);
        const planHeader = ['Plan Name', 'Subscribers', 'Revenue', 'Avg/User', 'Churn %', 'Growth %'];
        const planRows = reportData.plans.map((p: any) => [
          p.planName || 'N/A',
          (p.subscribers || 0).toLocaleString(),
          `${currencySymbol}${(p.totalRevenue || 0).toLocaleString()}`,
          `${currencySymbol}${(p.avgPerUser || 0).toLocaleString()}`,
          `${p.churnRate || 0}%`,
          `+${p.growth || 0}%`
        ]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [planHeader],
          body: planRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 5: ARPU Analytics
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('5. ARPU by Plan', 14, currentY);
        const arpuRows = reportData.arpu.byPlan.map((p: any) => [p.planName, `${currencySymbol}${p.arpu}`, `+${p.growth}% growth`]);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Plan', 'ARPU', 'Growth']],
          body: arpuRows,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [245, 158, 11] }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Section 6: Trial Conversion
        if (currentY > 230) { doc.addPage(); currentY = 20; }
        doc.setFontSize(14);
        doc.text('6. Trial Conversion metrics', 14, currentY);
        const trialStatsRows = [
          ['Overall Rate', `${reportData.trials.overallConversionRate}%`],
          ['Started', reportData.trials.trialsStarted.toString()],
          ['Converted', reportData.trials.convertedToPaid.toString()],
          ['Avg Duration', `${reportData.trials.avgTrialDurationDays} days`],
        ];
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Metric', 'Value']],
          body: trialStatsRows,
          theme: 'grid',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [79, 70, 229] }
        });

        doc.save(`Comprehensive_Financial_Report_${timeRangeString.replace(/\s+/g, '_')}.pdf`);
      } else {
        // EXCEL EXPORT
        const wb = XLSX.utils.book_new();

        // 1. Summary Stats
        const summaryData = [
          ['Financial Summary Report'],
          ['Period', reportData.mrrTrend.period],
          ['Generated At', new Date().toLocaleString()],
          [],
          ['Metric', 'Value', 'Growth %'],
          ['MRR', reportData.stats.mrr.value, reportData.stats.mrr.growth],
          ['ARR', reportData.stats.arr.value, reportData.stats.arr.growth],
          ['Churn Rate', reportData.stats.churnRate.value, reportData.stats.churnRate.growth],
          ['ARPU', reportData.stats.arpu.value, reportData.stats.arpu.growth],
          ['New Subscriptions', reportData.stats.newSubscriptions.value, reportData.stats.newSubscriptions.growth],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Executive Summary');

        // 2. MRR Trend
        const wsTrend = XLSX.utils.json_to_sheet(reportData.mrrTrend.mrrTrend);
        XLSX.utils.book_append_sheet(wb, wsTrend, 'Monthly Trend');

        // 3. MRR Breakdown
        const wsBreakdown = XLSX.utils.json_to_sheet(reportData.breakdown.componentBreakdown);
        XLSX.utils.book_append_sheet(wb, wsBreakdown, 'Component Breakdown');

        // 4. Plan Performance
        const wsPlans = XLSX.utils.json_to_sheet(reportData.plans);
        XLSX.utils.book_append_sheet(wb, wsPlans, 'Plan Stats');

        XLSX.writeFile(wb, `Financial_Report_${timeRangeString.replace(/\s+/g, '_')}.xlsx`);
      }
      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('An error occurred during export');
    }
  };

  const data = useMemo(() => {
    const stats = statsData?.data || {};
    const mrrStats = mrrStatsData?.data || {};
    const mrrTrend = mrrTrendData?.data?.mrrTrend || [];
    const componentBreakdown = breakdownData?.data?.componentBreakdown || [];
    const churnStats = churnStatsData?.data || {};
    const churnTrend = churnTrendData?.data?.trend || [];
    const churnRateByPlan = churnRateByPlanData?.data || [];

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
      churn: {
        newSignups: churnStats.newSignUps || 0,
        cancellations: churnStats.cancellations || 0,
        netGrowth: churnStats.netGrowth || 0,
        retentionRate: churnStats.retentionRate || 0,
        activityData: churnTrend.map((item: any) => ({
          label: item.label,
          newSignUps: item.newSignUps,
          cancellations: item.cancellations,
          netGrowth: item.netGrowth
        })),
        churnByPlan: churnRateByPlan.map((item: any) => ({
          plan: item.planName,
          rate: item.churnRate
        }))
      },
      plans: {
        allPlans: (planStatsData?.data || []).map((item: any) => ({
          name: item.planName,
          subscribers: item.subscribers || 0,
          revenue: item.revenue || 0,
          avgUser: item.avgUser || 0,
          churnRate: item.churnRate || 0,
          growth: item.growth || 0
        })),
        revenueData: (planRevenueData?.data?.points || []).map((item: any) => ({
          plan: (item.planName || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          revenue: item.value || 0
        })),
        subscribersData: (planSubscribersData?.data?.points || []).map((item: any) => ({
          plan: (item.planName || '').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          subscribers: item.value || 0
        }))
      },
      arpu: {
        overall: arpuStatsData?.data?.overall?.arpu || 0,
        overallGrowth: arpuStatsData?.data?.overall?.growth || 0,
        byPlan: (arpuStatsData?.data?.byPlan || []).map((item: any) => ({
          name: item.planName,
          arpu: item.arpu,
          growth: item.growth
        })),
        arpuTrend: (() => {
          const overallPoints = arpuTrendData?.data?.overall || [];
          const planData = arpuTrendData?.data?.byPlan || [];

          // Create a map of labels to combined data
          const combinedData: Record<string, any> = {};

          overallPoints.forEach((p: any) => {
            combinedData[p.label] = { label: p.label, overall: p.value };
          });

          planData.forEach((plan: any) => {
            plan.points.forEach((p: any) => {
              if (!combinedData[p.label]) {
                combinedData[p.label] = { label: p.label };
              }
              combinedData[p.label][plan.planName.toLowerCase()] = p.value;
            });
          });

          return Object.values(combinedData);
        })(),
        growthFactors: [
          { name: 'Plan Upgrades', description: 'Users moving to higher tiers', impact: `+${currencySymbol}1.80` },
          { name: 'Add-on Features', description: 'Extra storage, devices, etc.', impact: `+${currencySymbol}1.20` },
          { name: 'Price Adjustments', description: 'Annual price increases', impact: `+${currencySymbol}0.60` },
          { name: 'Plan Downgrades', description: 'Users moving to lower tiers', impact: `-${currencySymbol}0.20` }
        ]
      },
      trials: {
        overallConversion: trialStatsData?.data?.overallConversionRate || 0,
        trialsStarted: trialStatsData?.data?.trialsStarted || 0,
        convertedToPaid: trialStatsData?.data?.convertedToPaid || 0,
        avgTrialDuration: trialStatsData?.data?.avgTrialDurationDays || 0,
        conversionByPlan: (trialConvertData?.data?.plans || []).map((item: any) => ({
          plan: item.planName,
          trials: item.trialCount,
          converted: item.convertedCount,
          rate: item.conversionRate
        })),
        topFeature: 'N/A',
        featureUsage: 0,
        avgTimeToConvert: 0
      }
    };
  }, [statsData, mrrStatsData, mrrTrendData, breakdownData, churnStatsData, churnTrendData, churnRateByPlanData, planStatsData, planRevenueData, planSubscribersData, trialStatsData, trialConvertData, arpuStatsData, arpuTrendData]);

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

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 border border-bgBlue text-bgBlue rounded-lg shadow-customShadow flex items-center gap-2 transition-colors text-sm cursor-pointer bg-navbarBg"
              >
                <Download className="w-4 h-4" /> Export Financial Report
              </button>

              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                  <div className="absolute right-0 mt-1 bg-navbarBg border border-border rounded-lg shadow-lg z-20 min-w-[160px] overflow-hidden">
                    <button
                      onClick={() => { handleExport('pdf'); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      📄 Download PDF
                    </button>
                    <button
                      onClick={() => { handleExport('excel'); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      📊 Download Excel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-navbarBg border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-6">
              <span className='border border-border rounded-full p-2'><DollarSign className="w-4 h-4 text-red-500" /></span>
              <span className="text-xs text-gray-500 dark:text-gray-400">MRR</span>
            </div>
            <div className="text-2xl font-bold mb-1">{currencySymbol}{data.summary.mrr.toLocaleString()}</div>
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
            <div className="text-2xl font-bold mb-1">{currencySymbol}{data.summary.arr.toLocaleString()}</div>
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
            <div className="text-2xl font-bold mb-1">{currencySymbol}{data.summary.arpu}</div>
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
                <div className="border border-border rounded-xl p-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Sales</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{currencySymbol}{data.mrrArr.newSales.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="border border-border rounded-xl p-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Upgrades</div>
                  <div className="text-3xl font-bold text-cyan-500 dark:text-cyan-400">{currencySymbol}{data.mrrArr.upgrades.toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="border border-border rounded-xl p-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Downgrades</div>
                  <div className="text-3xl font-bold text-orange-400 dark:text-orange-300">-{currencySymbol}{Math.abs(data.mrrArr.downgrades).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">This month</div>
                </div>
                <div className="border border-border rounded-xl p-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Churned</div>
                  <div className="text-3xl font-bold text-pink-500 dark:text-pink-400">-{currencySymbol}{Math.abs(data.mrrArr.churned).toLocaleString()}</div>
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
                    formatter={(value: number | undefined) => value !== undefined ? [`${currencySymbol}${Math.abs(value).toLocaleString()}`, undefined] : ['', undefined]}
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
                  <div className="text-4xl font-bold text-purple-700 dark:text-purple-300">{currencySymbol}{data.mrrArr.annualRevenue.toLocaleString()}</div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className='flex items-center justify-between border border-border rounded-xl p-6'>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">New Sign-ups</div>
                    <div className="text-3xl font-bold text-[#10b981]">{data.churn.newSignups}</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <UserPlus className="w-6 h-6 text-[#10b981]" />
                  </div>
                </div>
                <div className='flex items-center justify-between border border-border rounded-xl p-6'>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cancellations</div>
                    <div className="text-3xl font-bold text-[#ef4444]">{data.churn.cancellations}</div>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-[#ef4444]" />
                  </div>
                </div>
                <div className='flex items-center justify-between border border-border rounded-xl p-6'>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Net Growth</div>
                    <div className="text-3xl font-bold text-[#8b5cf6]">{data.churn.netGrowth > 0 ? `+${data.churn.netGrowth}` : data.churn.netGrowth}</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-[#8b5cf6]" />
                  </div>
                </div>
                <div className='flex items-center justify-between border border-border rounded-xl p-6'>
                  <div className="flex flex-col gap-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Retention Rate</div>
                    <div className="text-3xl font-bold text-[#06b6d4]">{data.churn.retentionRate}%</div>
                  </div>
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <Target className="w-6 h-6 text-[#06b6d4]" />
                  </div>
                </div>
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.churn.activityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                    <XAxis
                      dataKey="label"
                      className="fill-gray-500 dark:fill-gray-400"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      className="fill-gray-500 dark:fill-gray-400"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6', opacity: 0.4 }}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      wrapperClassName="dark:[--tooltip-bg:#1f2937] [--tooltip-bg:#ffffff]"
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="rect"
                      wrapperStyle={{ paddingTop: '30px' }}
                    />
                    <Bar dataKey="cancellations" fill="#ef4444" name="Cancellations" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="netGrowth" fill="#8b5cf6" name="Net Growth" radius={[4, 4, 0, 0]} barSize={40} />
                    <Bar dataKey="newSignUps" fill="#10b981" name="New Sign-ups" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-navbarBg border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6">Churn Rate by Plan</h2>
              <div className="space-y-6">
                {data.churn.churnByPlan.length > 0 ? (
                  data.churn.churnByPlan.map((plan: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan.plan}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{plan.rate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-orange-500' : idx === 1 ? 'bg-blue-500' : 'bg-green-500'
                            }`}
                          style={{ width: `${plan.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No churn data available for the selected time range.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-2">Plan Performance Overview</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Comparative analysis of subscription tiers</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {data.plans.allPlans.length > 0 ? (
                  data.plans.allPlans.map((plan: any, idx: number) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${plan.name?.toLowerCase().includes('starter') ? 'border-orange-400' :
                          plan.name?.toLowerCase().includes('business') ? 'border-cyan-400' :
                            'border-purple-400'
                        }`}
                    >
                      <div className="flex flex-col gap-1 mb-4">
                        <div className={`text-sm font-semibold ${plan.name?.toLowerCase().includes('starter') ? 'text-orange-500' :
                            plan.name?.toLowerCase().includes('business') ? 'text-cyan-500' :
                              'text-purple-500'
                          }`}>{plan.name}</div>
                        <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{plan.subscribers}</div>
                        <div className="text-xs text-gray-400">subscribers</div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Revenue</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{currencySymbol}{plan.revenue.toLocaleString()}/mo</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Avg/User</span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">{currencySymbol}{plan.avgUser}/mo</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Churn Rate</span>
                          <span className="font-bold text-orange-500">{plan.churnRate}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Growth</span>
                          <span className="font-bold text-green-500">+{plan.growth}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10 text-gray-500">
                    No plan performance data available.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue by Plan Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Total Revenue by Plan</h3>
                  {data.plans.revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={data.plans.revenueData} margin={{ bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis
                          dataKey="plan"
                          className="fill-gray-500 dark:fill-gray-400"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          className="fill-gray-500 dark:fill-gray-400"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${currencySymbol}${v}`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(139,92,246,0.08)' }}
                          formatter={(v: any) => [`${currencySymbol}${Number(v).toFixed(2)}`, 'Revenue']}
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                          }}
                          wrapperClassName="dark:[--tooltip-bg:#1f2937] [--tooltip-bg:#ffffff]"
                        />
                        <Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="revenue" fill="#8B5CF6" name="Total Revenue" radius={[6, 6, 0, 0]} maxBarSize={80} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[320px] text-gray-400 dark:text-gray-500 text-sm">
                      No revenue data available for the selected period.
                    </div>
                  )}
                </div>

                {/* Subscribers by Plan Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Active Subscribers by Plan</h3>
                  {data.plans.subscribersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={data.plans.subscribersData} margin={{ bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                        <XAxis
                          dataKey="plan"
                          className="fill-gray-500 dark:fill-gray-400"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          className="fill-gray-500 dark:fill-gray-400"
                          tick={{ fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(6,182,212,0.08)' }}
                          formatter={(v: any) => [v, 'Subscribers']}
                          contentStyle={{
                            backgroundColor: 'var(--tooltip-bg)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                          }}
                          wrapperClassName="dark:[--tooltip-bg:#1f2937] [--tooltip-bg:#ffffff]"
                        />
                        <Legend verticalAlign="bottom" align="center" iconType="rect" wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="subscribers" fill="#06B6D4" name="Subscribers" radius={[6, 6, 0, 0]} maxBarSize={80} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[320px] text-gray-400 dark:text-gray-500 text-sm">
                      No subscriber data available for the selected period.
                    </div>
                  )}
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <div className="rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30 bg-[#f5f3ff] dark:bg-purple-900/10">
                  <div className="text-xs text-purple-600 dark:text-purple-400 mb-2 font-medium">Overall ARPU</div>
                  <div className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-1">{currencySymbol}{data.arpu.overall}</div>
                  <div className="text-xs text-purple-500 dark:text-purple-400">Per month</div>
                </div>

                {data.arpu.byPlan.map((plan: any, idx: number) => (
                  <div key={idx} className="rounded-2xl p-6 border border-border">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">{plan.name} ARPU</div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{currencySymbol}{plan.arpu}</div>
                    <div className={`text-xs flex items-center gap-1 ${plan.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {plan.growth >= 0 ? `+${plan.growth}% growth` : `${plan.growth}% growth`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.arpu.arpuTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                    <XAxis
                      dataKey="label"
                      className="fill-gray-500 dark:fill-gray-400"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      className="fill-gray-500 dark:fill-gray-400"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: 'none',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      wrapperClassName="dark:[--tooltip-bg:#1f2937] [--tooltip-bg:#ffffff]"
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '30px' }}
                    />
                    <Line type="monotone" dataKey="business" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Business" />
                    <Line type="monotone" dataKey="enterprise" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Enterprise" />
                    <Line type="monotone" dataKey="overall" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Overall ARPU" />
                    <Line type="monotone" dataKey="starter" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Starter" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
                <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-600 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className='rounded-xl p-6 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Overall Conversion</div>
                  <div className="text-3xl font-bold text-[#9810FA]">{data.trials.overallConversion}%</div>
                  <div className="text-xs text-gray-400 mt-2">{timeRangeString}</div>
                </div>
                <div className='rounded-xl p-6 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Trials Started</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.trials.trialsStarted}</div>
                  <div className="text-xs text-gray-400 mt-2">This month</div>
                </div>
                <div className='rounded-xl p-6 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Converted to Paid</div>
                  <div className="text-3xl font-bold text-[#10b981]">{data.trials.convertedToPaid}</div>
                  <div className="text-xs text-gray-400 mt-2">This month</div>
                </div>
                <div className='rounded-xl p-6 border border-border'>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Avg Trial Duration</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.trials.avgTrialDuration}</div>
                  <div className="text-xs text-gray-400 mt-2">days (14-day trial)</div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-semibold text-sm text-gray-500">Conversion by Plan</h3>
                {data.trials.conversionByPlan.length > 0 ? (
                  data.trials.conversionByPlan.map((plan: any, idx: number) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{plan.plan}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{plan.rate}% conversion</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-full h-8 overflow-hidden bg-transparent">
                        <div
                          className="bg-[#9810FA] flex items-center justify-center text-white text-[10px] font-medium h-full transition-all duration-500 rounded-l-md"
                          style={{ flex: plan.trials, minWidth: '100px' }}
                        >
                          {plan.trials} trials
                        </div>
                        <div
                          className="bg-[#0092B8] flex items-center justify-center text-white text-[10px] font-medium h-full transition-all duration-500 rounded-r-md"
                          style={{ flex: plan.converted, minWidth: '100px' }}
                        >
                          {plan.converted} converted
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No trial conversion data available.
                  </div>
                )}
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