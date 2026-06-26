"use client";

import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Filter, Moon, Sun, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw, DollarSign, ChevronDown, Home, ChevronRight, FileSpreadsheet, CreditCard, Info } from 'lucide-react';
import Dropdown from '@/components/shared/Dropdown';

import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  useGetSubscriptionBillingStatsQuery,
  useGetSubscriptionBillingTrendQuery,
  useGetSubscriptionBillingRecentTransactionsQuery,
  useGetSubscriptionBillingTransactionSummaryQuery,
  useGetFailedPaymentTrendsQuery,
  useGetFailedPaymentReasonsQuery,
  useGetTaxReportStatsQuery,
  useGetTaxBreakdownQuery,
  useGetTaxRegionAnalyticsQuery,
  useGetRefundsStatsQuery,
  useGetRefundsDetailsQuery,
  useGetRefundsReasonsQuery,
  useGetRefundsChargebackHealthQuery,
  useGetRefundsImpactAnalysisQuery,
} from '@/redux/api/admin/subscriptionBillingReport';

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getCurrencySymbol, formatAmount as formatCurrency } from "@/lib/currencyUtils";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeader } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const generateBillingData = (range: number) => {
  // Logic to adjust data based on range (1, 7, 30, 365)
  const multiplier = range === 1 ? 0.03 : range === 7 ? 0.25 : range === 30 ? 1 : 12;

  // Define time series structure based on range
  let timeSeriesStructure: { label: string; key: string }[] = [];
  let xAxisKey = 'month';

  if (range === 1) { // 1 Day -> Hours
    xAxisKey = 'time';
    for (let i = 0; i <= 24; i += 4) {
      timeSeriesStructure.push({ label: `${i}:00`, key: 'time' });
    }
  } else if (range === 7) { // 7 Days -> Days
    xAxisKey = 'day';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    timeSeriesStructure = days.map(day => ({ label: day, key: 'day' }));
  } else if (range === 30) { // 30 Days -> Weeks
    xAxisKey = 'week';
    for (let i = 1; i <= 4; i++) {
      timeSeriesStructure.push({ label: `Week ${i}`, key: 'week' });
    }
  } else { // 1 Year -> Months
    xAxisKey = 'month';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    timeSeriesStructure = months.map(month => ({ label: month, key: 'month' }));
  }

  const kpiData = {
    successRate: { value: Math.round(28100 * multiplier), change: -8.2, trend: 'increase' },
    failedPayments: { value: Math.round(337200 * multiplier), count: Math.round(15 * multiplier), change: -8.2, trend: 'reduction' },
    overdueInvoices: { count: Math.round(7 * multiplier), amount: Math.round(870 * multiplier) },
    recoveryRate: { value: 77.8, recovered: `${Math.round(7 * multiplier)} of ${Math.round(9 * multiplier)}` },
    avgDSO: { value: 28, target: 30 }
  };

  // Generate dynamic chart data based on structure
  const transactionData = timeSeriesStructure.map(item => ({
    [item.key]: item.label,
    successful: Math.round(Math.random() * 200 * multiplier + 50),
    failed: Math.round(Math.random() * 15 * multiplier + 2),
    refunded: Math.round(Math.random() * 8 * multiplier + 1)
  }));

  const failedPaymentData = timeSeriesStructure.map(item => ({
    [item.key]: item.label,
    failed: Math.round(Math.random() * 20 * multiplier + 5),
    permanent: Math.round(Math.random() * 10 * multiplier + 2),
    recovered: Math.round(Math.random() * 5 * multiplier + 1)
  }));

  const recoveryRateData = timeSeriesStructure.map(item => ({
    [item.key]: item.label,
    rate: Math.round(60 + Math.random() * 30)
  }));

  const dsoTrendData = timeSeriesStructure.map(item => ({
    [item.key]: item.label,
    actual: Math.round(25 + Math.random() * 10),
    target: 30
  }));

  // Static/Scaled categorical data
  const agingData = [
    { range: '1-30 Days', invoices: Math.round(2 * multiplier) || 1, amount: Math.round(630 * multiplier) },
    { range: '31-60 Days', invoices: Math.round(1 * multiplier) || 1, amount: Math.round(101 * multiplier) },
    { range: '61-90 Days', invoices: Math.round(1 * multiplier) || 1, amount: Math.round(120 * multiplier) },
    { range: '90+ Days', invoices: Math.round(1 * multiplier) || 1, amount: Math.round(19 * multiplier) }
  ];

  return {
    xAxisKey,
    kpiData,
    transactionData,
    agingData,
    failedPaymentData,
    // ... kept static/scaled lists
    recentTransactions: [
      { id: 'TXN-2025-001', date: '2025-01-27', customer: 'TechCorp Inc.', amount: 60, status: 'Successful', method: 'Credit Card', invoice: 'INV-2025-234' },
      { id: 'TXN-2025-002', date: '2025-01-27', customer: 'Retail Solutions', amount: 12, status: 'Successful', method: 'Stripe', invoice: 'INV-2025-235' },
      { id: 'TXN-2025-003', date: '2025-01-26', customer: 'HealthCare Plus', amount: 8, status: 'Failed', method: 'Credit Card', invoice: 'INV-2025-236' },
      { id: 'TXN-2025-004', date: '2025-01-28', customer: 'Education Hub', amount: 12, status: 'Successful', method: 'Paystack', invoice: 'INV-2025-237' },
      { id: 'TXN-2025-005', date: '2025-01-25', customer: 'Restaurant Chain', amount: 60, status: 'Refunded', method: 'Flutterwave', invoice: 'INV-2025-238' }
    ],
    overdueInvoices: [
      { invoice: 'INV-2024-023', customer: 'Retail Solutions', amount: 12, dueDate: '2024-12-15', daysOverdue: 45, category: '31-60 days', status: 'Overdue' },
      { invoice: 'INV-2024-045', customer: 'HealthCare Plus', amount: 3, dueDate: '2024-12-28', daysOverdue: 30, category: '1-30 days', status: 'Overdue' },
      { invoice: 'INV-2025-012', customer: 'TechCorp Inc.', amount: 60, dueDate: '2025-01-05', daysOverdue: 22, category: '1-30 days', status: 'Overdue' },
      { invoice: 'INV-2024-023', customer: 'Education Hub', amount: 12, dueDate: '2024-11-20', daysOverdue: 68, category: '61-90 days', status: 'Overdue' },
      { invoice: 'INV-2024-738', customer: 'Downtown Retail', amount: 3, dueDate: '2024-10-12', daysOverdue: 107, category: '90+ days', status: 'Critical' }
    ],
    recoveryRateData,
    delinquentAccounts: [
      { customer: 'Retail Solutions', plan: 'Business', balance: 36, lastPayment: '2024-10-15', daysOverdue: 104, attempts: 5, status: 'Critical' },
      { customer: 'HealthCare Plus', plan: 'Starter', balance: 60, lastPayment: '2024-12-20', daysOverdue: 38, attempts: 3, status: 'Warning' },
      { customer: 'Downtown Retail', plan: 'Starter', balance: 60, lastPayment: '2024-12-28', daysOverdue: 30, attempts: 2, status: 'Warning' }
    ],
    refundData: [
      { id: 'REF-2025-012', date: '2025-01-25', customer: 'Restaurant Chain', amount: 600, type: 'Refund', reason: 'Service dissatisfaction', fee: '-', status: 'Completed' },
      { id: 'CHB-2025-003', date: '2025-01-22', customer: 'Tech Startup', amount: 100, type: 'Chargeback', reason: 'Unauthorized charge', fee: 15, status: 'Under Review' },
      { id: 'REF-2025-008', date: '2025-01-18', customer: 'Education Hub', amount: 30, type: 'Refund', reason: 'Billing error', fee: '-', status: 'Completed' }
    ],
    taxByJurisdiction: [
      { jurisdiction: 'California, USA', transactions: Math.round(45 * multiplier), revenue: Math.round(4620 * multiplier), rate: '7.25%', collected: Math.round(335 * multiplier) },
      { jurisdiction: 'New York, USA', transactions: Math.round(38 * multiplier), revenue: Math.round(4460 * multiplier), rate: '8.82%', collected: Math.round(393 * multiplier) },
      { jurisdiction: 'Texas, USA', transactions: Math.round(33 * multiplier), revenue: Math.round(3660 * multiplier), rate: '6.25%', collected: Math.round(228 * multiplier) },
      { jurisdiction: 'United Kingdom', transactions: Math.round(28 * multiplier), revenue: Math.round(3360 * multiplier), rate: '20%', collected: Math.round(672 * multiplier) },
      { jurisdiction: 'Germany', transactions: Math.round(22 * multiplier), revenue: Math.round(2640 * multiplier), rate: '19%', collected: Math.round(501 * multiplier) },
      { jurisdiction: 'Canada', transactions: Math.round(19 * multiplier), revenue: Math.round(2280 * multiplier), rate: '13%', collected: Math.round(296 * multiplier) },
      { jurisdiction: 'Japan', transactions: Math.round(184 * multiplier), revenue: Math.round(22080 * multiplier), rate: '10%', collected: Math.round(2208 * multiplier) }
    ],
    dsoTrendData,
    planPieData: [
      { name: 'Starter', value: 67 },
      { name: 'Business', value: 33 }
    ],
    taxRegionData: [
      { name: 'Texas, USA', value: 20 },
      { name: 'California, USA', value: 28 },
      { name: 'United Kingdom', value: 16 },
      { name: 'Germany', value: 18 },
      { name: 'Canada', value: 18 }
    ]
  };
};

const BillingDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('transactions');
  const { theme: currentTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tabId);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const isDark = mounted && (resolvedTheme === 'dark' || currentTheme === 'dark');

  const currency = useSelector((state: RootState) => state.settings.currency);
  const currencySymbol = getCurrencySymbol(currency);

  const [timeRange, setTimeRange] = useState<string>('last 30 days');



  // New subscription billing report API integrations
  const { data: newStatsData } = useGetSubscriptionBillingStatsQuery({ timeRange });
  const { data: newTrendData } = useGetSubscriptionBillingTrendQuery({ timeRange });
  const { data: newRecentTxData } = useGetSubscriptionBillingRecentTransactionsQuery({ timeRange });
  const { data: newSummaryData } = useGetSubscriptionBillingTransactionSummaryQuery({ timeRange });
  const { data: failedTrendsData } = useGetFailedPaymentTrendsQuery({ timeRange });
  const { data: failedReasonsData } = useGetFailedPaymentReasonsQuery({ timeRange });
  const { data: taxStatsData } = useGetTaxReportStatsQuery({ timeRange });
  const { data: taxBreakdownData } = useGetTaxBreakdownQuery({ timeRange });
  const { data: taxRegionApiData } = useGetTaxRegionAnalyticsQuery({ timeRange });
  const { data: refundsStatsData } = useGetRefundsStatsQuery({ timeRange });
  const { data: refundsDetailsData } = useGetRefundsDetailsQuery({ timeRange, page: 1, limit: 100 });
  const { data: refundsReasonsData } = useGetRefundsReasonsQuery({ timeRange });
  const { data: refundsChargebackHealthData } = useGetRefundsChargebackHealthQuery({ timeRange });
  const { data: refundsImpactData } = useGetRefundsImpactAnalysisQuery({ timeRange });



  const handleExport = async () => {
    try {
      toast.loading("Preparing PDF report...");

      const rawData = {
        overview: {
          successRate: { value: kpiData.successRate.value, trend: kpiData.successRate.trend },
          failedPayments: { count: kpiData.failedPayments.count, amount: kpiData.failedPayments.value },
          overdueInvoices: kpiData.overdueInvoices,
          recoveryRate: kpiData.recoveryRate,
          avgDSO: kpiData.avgDSO
        },
        recentTransactions: recentTransactions,
        agingReport: { summary: agingData },
        failedPaymentsAnalysis: { commonFailureReasons: commonFailureReasons },
        delinquencyReport: { details: delinquentAccounts },
        refundReport: { summary: refundSummary },
        taxReport: { summary: taxSummary },
        dsoAnalysis: { metrics: dsoMetrics }
      };

      toast.dismiss();

      const doc = new jsPDF();
      const timeRangeLabel = timeRanges.find(t => t.value === timeRange)?.label || timeRange || 'All Time';

      // Branded header with logo
      let currentY = await addPdfHeader(
        doc,
        'Subscription & Billing Report',
        `Period: ${timeRangeLabel}  |  Generated: ${new Date().toLocaleString()}`
      );

      // Section 1: Billing Overview
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text('1. Billing Overview', 14, currentY);

      const overview = rawData.overview || {};
      const overviewRows = [
        ['Metric', 'Value', 'Trend'],
        ['Success Rate', `${overview.successRate?.value || 0}%`, overview.successRate?.trend || 'Stable'],
        ['Failed Payments Count', (overview.failedPayments?.count || 0).toLocaleString(), ''],
        ['Failed Payments Amount', `${currencySymbol}${(overview.failedPayments?.amount || 0).toLocaleString()}`, ''],
        ['Overdue Invoices Count', (overview.overdueInvoices?.count || 0).toLocaleString(), ''],
        ['Overdue Invoices Amount', `${currencySymbol}${(overview.overdueInvoices?.amount || 0).toLocaleString()}`, ''],
        ['Recovery Rate', `${overview.recoveryRate?.value || 0}%`, ''],
        // ['Avg DSO', `${overview.avgDSO?.value || 0} days`, overview.avgDSO?.status || ''],
      ];

      autoTable(doc, {
        head: [overviewRows[0]],
        body: overviewRows.slice(1),
        startY: currentY + 5,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] } // Blue-500
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 2: Recent Transactions
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text('2. Recent Transactions', 14, currentY);

      const transactions = rawData.recentTransactions || [];
      const txRows = transactions.map((tx: any) => [
        tx.id || tx.transactionId || '-',
        tx.date || '-',
        tx.customer || '-',
        `${currencySymbol}${tx.amount || 0}`,
        tx.status || '-',
        tx.method || '-',
        tx.invoice || '-'
      ]);

      autoTable(doc, {
        head: [['ID', 'Date', 'Customer', 'Amount', 'Status', 'Method', 'Invoice']],
        body: txRows,
        startY: currentY + 5,
        theme: 'grid',
        styles: { fontSize: 7 },
        headStyles: { fillColor: [139, 92, 246] } // Purple-500
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 3: Invoice Aging Summary
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text('3. Invoice Aging Summary', 14, currentY);
      const agingRows = (rawData.agingReport?.summary || []).map((item: any) => [
        item.range,
        item.invoices || 0,
        `${currencySymbol}${(item.amount || 0).toLocaleString()}`
      ]);
      autoTable(doc, {
        head: [['Range', 'Invoice Count', 'Amount']],
        body: agingRows,
        startY: currentY + 5,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [245, 158, 11] } // Amber-500
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 4: Failed Payments Analysis
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text('4. Failed Payments Analysis', 14, currentY);
      const failedRows = (rawData.failedPaymentsAnalysis?.commonFailureReasons || []).map((item: any) => [
        item.reason,
        `${item.percentage}%`
      ]);
      autoTable(doc, {
        head: [['Reason', 'Percentage']],
        body: failedRows,
        startY: currentY + 5,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [239, 68, 68] } // Red-500
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 5: Delinquent Accounts
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text('5. Delinquent Accounts', 14, currentY);
      const delRows = (rawData.delinquencyReport?.details || []).map((item: any) => [
        item.customer,
        `${currencySymbol}${item.balance}`,
        `${item.daysOverdue || item.daysPastDue} days`,
        item.status
      ]);
      autoTable(doc, {
        head: [['Customer', 'Balance', 'Days Overdue', 'Status']],
        body: delRows,
        startY: currentY + 5,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [107, 114, 128] } // Gray-500
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;

      // Section 6: Refund & Tax Summary
      if (currentY > 230) { doc.addPage(); currentY = 20; }
      doc.setFontSize(14);
      doc.text('6. Refund & Tax Summary', 14, currentY);
      const refundTaxRows = [
        ['Total Refunds', rawData.refundReport?.summary?.totalRefunds || 0, 'Tax Collected', `${currencySymbol}${(rawData.taxReport?.summary?.taxCollected || 0).toLocaleString()}`],
        ['Refund Amount', `${currencySymbol}${(rawData.refundReport?.summary?.refundAmount || 0).toLocaleString()}`, 'Taxable Revenue', `${currencySymbol}${(rawData.taxReport?.summary?.taxableRevenue || 0).toLocaleString()}`],
        ['Chargebacks', rawData.refundReport?.summary?.chargebacks || 0, 'Avg Tax Rate', rawData.taxReport?.summary?.avgTaxRate || '0%'],
      ];
      autoTable(doc, {
        body: refundTaxRows,
        startY: currentY + 5,
        theme: 'plain',
        styles: { fontSize: 8 }
      });

      doc.save(`Subscription_Billing_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("Billing report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setShowExportMenu(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const rawData = {
        overview: {
          successRate: { value: kpiData.successRate.value, trend: kpiData.successRate.trend },
          failedPayments: { count: kpiData.failedPayments.count, amount: kpiData.failedPayments.value },
          overdueInvoices: kpiData.overdueInvoices,
          recoveryRate: kpiData.recoveryRate,
          avgDSO: kpiData.avgDSO
        },
        recentTransactions: recentTransactions,
        agingReport: { summary: agingData },
        failedPaymentsAnalysis: { commonFailureReasons: commonFailureReasons },
        delinquencyReport: { details: delinquentAccounts },
        refundReport: { summary: refundSummary },
        taxReport: { summary: taxSummary },
        dsoAnalysis: { metrics: dsoMetrics }
      };

      const wb = XLSX.utils.book_new();

      // Overview sheet
      const overview = rawData.overview || {};
      const overviewRows = [
        ['Metric', 'Value', 'Growth'],
        ['Success Rate', `${overview.successRate?.value || 0}%`, overview.successRate?.trend || ''],
        ['Failed Payments Count', overview.failedPayments?.count || 0, ''],
        ['Failed Payments Amount', `${currencySymbol}${overview.failedPayments?.amount || 0}`, ''],
        ['Overdue Invoices Count', overview.overdueInvoices?.count || 0, ''],
        ['Overdue Invoices Amount', `${currencySymbol}${overview.overdueInvoices?.amount || 0}`, ''],
        ['Recovery Rate', `${overview.recoveryRate?.value || 0}%`, ''],
        // ['Avg DSO', `${overview.avgDSO?.value || 0} days`, overview.avgDSO?.status || ''],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewRows), 'Overview');

      // Transactions sheet
      const transactions = rawData.recentTransactions || [];
      const transactionsRows = [
        ['ID', 'Date', 'Customer', 'Amount', 'Status', 'Method', 'Invoice'],
        ...transactions.map((tx: any) => [
          tx.id || tx.transactionId || '-',
          tx.date || '-',
          tx.customer || '-',
          `${currencySymbol}${tx.amount || 0}`,
          tx.status || '-',
          tx.method || '-',
          tx.invoice || '-'
        ])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(transactionsRows), 'Transactions');

      // Delinquent Accounts sheet
      const delinquent = rawData.delinquencyReport?.details || [];
      const delinquentRows = [
        ['Customer', 'Balance', 'Days Overdue', 'Status'],
        ...delinquent.map((item: any) => [
          item.customer,
          `${currencySymbol}${item.balance}`,
          `${item.daysOverdue || item.daysPastDue} days`,
          item.status
        ])
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(delinquentRows), 'Delinquent Accounts');

      // Refund & Tax summary
      const refundTaxRows = [
        ['Label', 'Value', 'Label', 'Value'],
        ['Total Refunds', rawData.refundReport?.summary?.totalRefunds || 0, 'Tax Collected', `${currencySymbol}${(rawData.taxReport?.summary?.taxCollected || 0).toLocaleString()}`],
        ['Refund Amount', `${currencySymbol}${(rawData.refundReport?.summary?.refundAmount || 0).toLocaleString()}`, 'Taxable Revenue', `${currencySymbol}${(rawData.taxReport?.summary?.taxableRevenue || 0).toLocaleString()}`],
        ['Chargebacks', rawData.refundReport?.summary?.chargebacks || 0, 'Avg Tax Rate', rawData.taxReport?.summary?.avgTaxRate || '0%'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(refundTaxRows), 'Refund & Tax');

      // DSO Metrics sheet
      const dso = rawData.dsoAnalysis?.metrics || {};
      const dsoRows = [
        ['Metric', 'Value'],
        ['Current DSO', `${dso.currentDso || 0} days`],
        ['Best Possible DSO', `${dso.bestPossibleDso || 0} days`],
        ['Collection Efficiency', dso.collectionEfficiency || '0%'],
        ['DSO Status', dso.dsoStatus || '-'],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dsoRows), 'DSO Metrics');

      XLSX.writeFile(wb, `billing-report-${timeRange || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success("Billing report exported successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("Failed to export report");
    }
  };

  const {
    xAxisKey,
    kpiData,
    transactionData,
    recentTransactions,
    agingData,
    overdueInvoices,
    failedPaymentData,
    failedPaymentTrends,
    recoveryRateData,
    delinquentAccounts,
    refundData,
    taxByJurisdiction,
    dsoTrendData,
    planPieData,
    taxRegionData,
    paymentMethods,
    transactionVolume,
    transactionTotals,
    dunningEffectiveness,
    commonFailureReasons,
    delinquencySummary,
    refundSummary,
    refundReasons,
    chargebackHealth,
    refundImpact,
    taxSummary,
    dsoMetrics,
    agingBucketAnalysis
  } = useMemo(() => {
    const numericRange = timeRange === 'last 1 day' ? 1 : timeRange === 'last 7 days' ? 7 : timeRange === 'last 1 year' ? 365 : 30;
    const defaultData = generateBillingData(numericRange);

    // Mapping API data or using defaults
    const kpi = {
      successRate: {
        value: newStatsData?.data?.successRate?.amount !== undefined ? newStatsData.data.successRate.amount : defaultData.kpiData.successRate.value,
        change: newStatsData?.data?.successRate?.growth !== undefined ? newStatsData.data.successRate.growth : defaultData.kpiData.successRate.change,
        trend: newStatsData?.data?.successRate?.growthLabel !== undefined ? newStatsData.data.successRate.growthLabel : defaultData.kpiData.successRate.trend
      },
      failedPayments: {
        value: newStatsData?.data?.failedPayments?.amount !== undefined ? newStatsData.data.failedPayments.amount : defaultData.kpiData.failedPayments.value,
        count: newStatsData?.data?.failedPayments?.percentage !== undefined ? newStatsData.data.failedPayments.percentage : defaultData.kpiData.failedPayments.count,
        change: newStatsData?.data?.failedPayments?.growth !== undefined ? newStatsData.data.failedPayments.growth : defaultData.kpiData.failedPayments.change,
        trend: newStatsData?.data?.failedPayments?.growthLabel !== undefined ? newStatsData.data.failedPayments.growthLabel : defaultData.kpiData.failedPayments.trend
      },
      overdueInvoices: defaultData.kpiData.overdueInvoices,
      recoveryRate: defaultData.kpiData.recoveryRate,
      avgDSO: defaultData.kpiData.avgDSO
    };

    const tData = newTrendData?.data?.chartData?.map((item: any) => ({
      [defaultData.xAxisKey]: item.label,
      successful: item.successful,
      failed: item.failed,
      refunded: item.refunded
    })) || defaultData.transactionData;

    const trendTotals = newTrendData?.data?.summary ? {
      total: newTrendData.data.summary.total,
      successful: newTrendData.data.summary.successful,
      failed: newTrendData.data.summary.failed,
      refunded: newTrendData.data.summary.refunded
    } : {
      total: 0,
      successful: 0,
      failed: 0,
      refunded: 0
    };

    const rtData = newRecentTxData?.data && newRecentTxData.data.length > 0
      ? newRecentTxData.data.map((txn: any) => ({
        id: txn.transactionId || txn.id,
        date: txn.date ? new Date(txn.date).toISOString().split('T')[0] : '-',
        customer: txn.customer || '-',
        amount: txn.amount,
        status: txn.status === 'success' ? 'Successful' :
          txn.status === 'failed' ? 'Failed' :
            txn.status === 'pending' ? 'Pending' :
              txn.status ? txn.status.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '-',
        method: txn.paymentMethod ? txn.paymentMethod.toUpperCase() : '-',
        invoice: txn.invoice || '-'
      }))
      : defaultData.recentTransactions;

    const aging = defaultData.agingData;

    const fpData = failedTrendsData?.data?.chartData?.map((item: any) => ({
      label: item.label,
      failedPayments: item.failedPayments,
    })) || defaultData.failedPaymentData.map((d: any) => ({ label: d[defaultData.xAxisKey], failedPayments: d.failed }));

    const fpReasons = failedReasonsData?.data?.reasons?.map((r: any) => ({
      reason: r.label,
      percentage: parseFloat(r.percentage) || 0,
      count: r.count,
      amount: r.amount,
    })) || [
      { reason: 'Insufficient Funds', percentage: 52, count: 0, amount: 0 },
      { reason: 'Expired Card', percentage: 24, count: 0, amount: 0 },
      { reason: 'Card Blocked', percentage: 14, count: 0, amount: 0 },
      { reason: 'Incorrect CVV', percentage: 10, count: 0, amount: 0 },
    ];

    const rrData = defaultData.recoveryRateData;

    const daData = defaultData.delinquentAccounts;

    const refData = refundsDetailsData?.data?.data && Array.isArray(refundsDetailsData.data.data)
      ? refundsDetailsData.data.data.map((item: any) => ({
          id: item.id ? (item.id.length > 8 ? item.id.substring(0, 8).toUpperCase() : item.id) : '-',
          date: item.date || '-',
          customer: item.customer || '-',
          amount: item.amount || 0,
          type: item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1).toLowerCase()) : '-',
          reason: item.reason || '-',
          fee: item.platformFee !== undefined ? `${currencySymbol}${item.platformFee.toLocaleString()}` : '-',
          status: item.status ? (item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()) : '-'
        }))
      : defaultData.refundData;

    const txJData = (taxBreakdownData?.data && Array.isArray(taxBreakdownData.data))
      ? taxBreakdownData.data.map((item: any) => ({
          jurisdiction: item.region,
          transactions: item.transactions,
          revenue: item.income,
          rate: `${item.taxRate}%`,
          collected: item.taxCollected,
        }))
      : defaultData.taxByJurisdiction;

    const dTrendData = defaultData.dsoTrendData;

    const pPieData = defaultData.planPieData;

    const tRegData = (taxRegionApiData?.data && Array.isArray(taxRegionApiData.data))
      ? taxRegionApiData.data.map((item: any) => ({
          name: item.region,
          value: item.value,
        }))
      : defaultData.taxRegionData;

    const methods = newSummaryData?.data?.paymentMethods
      ? newSummaryData.data.paymentMethods.map((m: any) => ({
        method: m.name ? m.name.toUpperCase() : '-',
        percentage: m.percentage ? parseFloat(m.percentage) : 0
      }))
      : [];

    const volume = newSummaryData?.data?.transactionVolume
      ? {
        transactionVolume: {
          value: newSummaryData.data.transactionVolume.amount,
          period: 'Total processed',
          change: newSummaryData.data.transactionVolume.growth
        }
      }
      : { transactionVolume: { value: 0, period: 'Total processed', change: 0 } };

    const avgTx = newSummaryData?.data?.averageTransaction
      ? {
        averageTransaction: {
          value: newSummaryData.data.averageTransaction.amount || newSummaryData.data.averageTransaction.perTransaction,
          period: 'Per transaction',
          change: newSummaryData.data.averageTransaction.growth
        }
      }
      : { averageTransaction: { value: 0, period: 'Per transaction', change: 0 } };

    return {
      ...defaultData,
      kpiData: kpi,
      transactionData: tData,
      recentTransactions: rtData,
      transactionTotals: trendTotals,
      agingData: aging,
      failedPaymentData: fpData,
      recoveryRateData: rrData,
      delinquentAccounts: daData,
      refundData: refData,
      taxByJurisdiction: txJData,
      dsoTrendData: dTrendData,
      planPieData: pPieData,
      taxRegionData: tRegData,
      paymentMethods: methods,
      transactionVolume: {
        transactionVolume: volume.transactionVolume || {},
        averageTransaction: avgTx.averageTransaction || {}
      },
      dunningEffectiveness: [
        { category: 'First Attempt (Email)', successRate: 45, color: '#10b981', subText: 'Sent within 24 hours of failure' },
        { category: 'Second Attempt (SMS)', successRate: 28, color: '#3b82f6', subText: 'Sent 3 days after first failure' },
        { category: 'Third Attempt (Escalate)', successRate: 15, color: '#f59e0b', subText: 'Sent 7 days after second failure' }
      ],
      failedPaymentTrends: fpData,
      commonFailureReasons: fpReasons,
      delinquencySummary: {
        delinquentAccounts: 3,
        totalOutstanding: 156,
        avgDaysPastDue: 45,
        collectionAttempts: 8
      },
      refundSummary: refundsStatsData?.data?.data
        ? {
            totalRefunds: refundsStatsData.data.data.totalRefunds,
            refundAmount: refundsStatsData.data.data.refundAmount,
            chargebacks: refundsStatsData.data.data.chargebacks,
            chargebackFees: refundsStatsData.data.data.chargebackFees
          }
        : {
            totalRefunds: 0,
            refundAmount: 0,
            chargebacks: 0,
            chargebackFees: 0
          },
      refundReasons: refundsReasonsData?.data?.reasons || [],
      chargebackHealth: refundsChargebackHealthData?.data?.data
        ? {
            rate: refundsChargebackHealthData.data.data.chargebackRatePercent,
            context: `${refundsChargebackHealthData.data.data.chargebacks} chargebacks / ${refundsChargebackHealthData.data.data.totalTransactions} transactions`,
            status: refundsChargebackHealthData.data.data.status,
            message: refundsChargebackHealthData.data.data.status === 'ALERT'
              ? `Chargeback rate is above the ${refundsChargebackHealthData.data.data.thresholdPercent}% threshold!`
              : `Chargeback rate is within the healthy ${refundsChargebackHealthData.data.data.thresholdPercent}% limit.`
          }
        : {
            rate: 0,
            context: 'No data',
            status: 'HEALTHY',
            message: 'Rate is within limits'
          },
      refundImpact: refundsImpactData?.data?.data
        ? {
            refundRate: refundsImpactData.data.data.refundRate,
            refundRateSubtitle: refundsImpactData.data.data.refundRateSubtitle,
            revenueImpact: refundsImpactData.data.data.revenueImpact,
            avgRefundValue: refundsImpactData.data.data.avgRefundValue
          }
        : {
            refundRate: 0,
            refundRateSubtitle: 'No data',
            revenueImpact: 0,
            avgRefundValue: 0
          },
      taxSummary: taxStatsData?.data
        ? {
            taxCollected: taxStatsData.data.totalTaxCollected,
            jurisdictions: taxStatsData.data.totalRegion,
            taxableRevenue: taxStatsData.data.taxableRevenue,
            avgTaxRate: `${taxStatsData.data.averageTaxRate}%`,
          }
        : {
            taxCollected: 456,
            jurisdictions: 6,
            taxableRevenue: 3420,
            avgTaxRate: '12.5%',
          },
      dsoMetrics: {
        currentDso: 28,
        bestPossibleDso: 25,
        collectionEfficiency: '85%',
        dsoStatus: 'Good'
      },
      agingBucketAnalysis: [
        { label: 'Current (0-30 Days)', percentage: 70 },
        { label: '31-60 Days', percentage: 18 },
        { label: '61-90 Days', percentage: 8 },
        { label: '90+ Days', percentage: 4 }
      ]
    };
  }, [timeRange, newStatsData, newTrendData, newRecentTxData, newSummaryData, failedTrendsData, failedReasonsData, taxStatsData, taxBreakdownData, taxRegionApiData, refundsStatsData, refundsDetailsData, refundsReasonsData, refundsChargebackHealthData, refundsImpactData]);

  const timeRanges = [
    { value: 'last 1 day', label: 'last 1 day' },
    { value: 'last 7 days', label: 'last 7 days' },
    { value: 'last 30 days', label: 'last 30 days' },
    { value: 'last 1 year', label: 'last 1 year' }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

  const theme = {
    bg: 'bg-gray-50 dark:bg-gray-900',
    card: 'bg-white dark:bg-gray-800',
    text: 'text-gray-900 dark:text-gray-100',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700'
  };

  const tabs = [
    { id: 'transactions', label: 'Transactions' },
    // { id: 'invoice-aging', label: 'Invoice Aging' },
    { id: 'failed-payment', label: 'Failed Payment' },
    // { id: 'delinquency', label: 'Delinquency' },
    { id: 'refund', label: 'Refund' },
    { id: 'tax', label: 'Tax' },
    // { id: 'dso', label: 'DSO' }
  ];

  // --- Render Functions ---
  const renderTransactionsTab = () => (
    <div className="space-y-6">
      <div className={`bg-navbarBg rounded-lg p-6 shadow-sm border border-border`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Detailed Transaction Report</h3>
        <p className={`${theme.textSecondary} text-sm mb-6`}>Complete transaction history with status and payment methods</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-navbarBg rounded-xl border border-border">
            <div className="text-3xl font-bold text-purple-600">{transactionTotals?.total || 0}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Total Transactions</div>
          </div>
          <div className="text-center p-4 bg-navbarBg rounded-xl border border-border">
            <div className="text-3xl font-bold text-green-600">{transactionTotals?.successful || 0}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Successful</div>
          </div>
          <div className="text-center p-4 bg-navbarBg rounded-xl border border-border">
            <div className="text-3xl font-bold text-red-600">{transactionTotals?.failed || 0}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Failed</div>
          </div>
          <div className="text-center p-4 bg-navbarBg rounded-xl border border-border">
            <div className="text-3xl font-bold text-orange-600">{transactionTotals?.refunded || 0}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Refunded</div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={transactionData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={xAxisKey} stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                color: isDark ? '#f3f4f6' : '#111827'
              }}
            />
            <Legend />
            <Bar dataKey="successful" fill="#10b981" name="Successful" />
            <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            <Bar dataKey="refunded" fill="#f59e0b" name="Refunded" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className={`bg-navbarBg rounded-lg p-6 shadow-sm border border-border`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${theme.text}`}>Recent Transactions</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme.border}`}>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Transaction ID</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Date</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Customer</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Amount</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Status</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Payment Method</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn: any) => (
                <tr key={txn.id} className={`border-b ${theme.border} ${theme.hover}`}>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>{txn.id}</td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{txn.date}</td>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>{txn.customer}</td>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>{currencySymbol}{txn.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${txn.status === 'Successful' ? 'bg-green-100 text-green-800' :
                      txn.status === 'Failed' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{txn.method}</td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{txn.invoice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className='border border-border rounded-xl p-4'>
            <h4 className={`font-semibold mb-2 ${theme.text}`}>Payment Methods</h4>
            <div className="space-y-2">
              {paymentMethods.map((m: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className={theme.textSecondary}>{m.method}</span>
                  <span className={theme.text}>{m.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className='border border-border rounded-xl p-4'>
            <h4 className={`font-semibold mb-2 ${theme.text}`}>Transaction Volume</h4>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${theme.text}`}>{currencySymbol}{(transactionVolume.transactionVolume?.value || 0).toLocaleString()}</div>
              <div className={`text-sm ${theme.textSecondary}`}>{transactionVolume.transactionVolume?.period || 'Total processed'}</div>
              <div className={`text-sm ${transactionVolume.transactionVolume?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transactionVolume.transactionVolume?.change >= 0 ? '+' : ''}{transactionVolume.transactionVolume?.change}% vs last period
              </div>
            </div>
          </div>

          <div className='border border-border rounded-xl p-4'>
            <h4 className={`font-semibold mb-2 ${theme.text}`}>Average Transaction</h4>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${theme.text}`}>{currencySymbol}{(transactionVolume.averageTransaction?.value || 0).toLocaleString()}</div>
              <div className={`text-sm ${theme.textSecondary}`}>{transactionVolume.averageTransaction?.period || 'Per transaction'}</div>
              <div className={`text-sm ${transactionVolume.averageTransaction?.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transactionVolume.averageTransaction?.change >= 0 ? '+' : ''}{transactionVolume.averageTransaction?.change}% change
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // const renderInvoiceAgingTab = () => (
  //   <div className="space-y-6">
  //     <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //       <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Invoice Aging Report</h3>
  //       <p className={`${theme.textSecondary} text-sm mb-6`}>Outstanding invoices categorized by age</p>

  //       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  //         {agingReportData?.data?.summary?.map((item: any, idx: number) => (
  //           <div key={idx} className={`p-4 rounded-xl border border-border ${item.range === '90+ Days' ? 'bg-red-100 dark:bg-red-900/20' :
  //             item.range === '61-90 Days' ? 'bg-red-50 dark:bg-red-800/20' :
  //               item.range === '31-60 Days' ? 'bg-orange-50 dark:bg-orange-900/20' :
  //                 'bg-yellow-50 dark:bg-yellow-900/20'
  //             }`}>
  //             <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{item.range}</div>
  //             <div className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{item.count} invoice{item.count !== 1 ? 's' : ''}</div>
  //             <div className={`text-sm font-semibold ${item.range === '90+ Days' ? 'text-red-700 dark:text-red-400' :
  //               item.range === '61-90 Days' ? 'text-red-600 dark:text-red-500' :
  //                 item.range === '31-60 Days' ? 'text-orange-600 dark:text-orange-500' :
  //                   'text-yellow-600 dark:text-yellow-500'
  //               }`}>{currencySymbol}{item.amount.toLocaleString()} {item.label || 'outstanding'}</div>
  //           </div>
  //         ))}
  //       </div>

  //       <ResponsiveContainer width="100%" height={300}>
  //         <BarChart data={agingData}>
  //           <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
  //           <XAxis dataKey="range" stroke={isDark ? '#9ca3af' : '#6b7280'} />
  //           <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
  //           <Tooltip
  //             contentStyle={{
  //               backgroundColor: isDark ? '#1f2937' : '#ffffff',
  //               border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
  //             }}
  //           />
  //           <Bar dataKey="amount" fill="#f59e0b" name={`Outstanding Amount (${currencySymbol})`} />
  //         </BarChart>
  //       </ResponsiveContainer>
  //     </div>

  //     <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //       <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Overdue Invoice Details</h3>

  //       <div className="overflow-x-auto">
  //         <table className="w-full">
  //           <thead>
  //             <tr className={`border-b ${theme.border}`}>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Invoice</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Customer</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Amount</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Due Date</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Days Overdue</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Category</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Status</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {overdueInvoices.map((invoice: any, idx: number) => (
  //               <tr key={idx} className={`border-b ${theme.border} ${theme.hover}`}>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{invoice.invoice}</td>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{invoice.customer}</td>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{currencySymbol}{invoice.amount}</td>
  //                 <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{invoice.dueDate}</td>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{invoice.daysOverdue} days</td>
  //                 <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{invoice.category}</td>
  //                 <td className="py-3 px-4">
  //                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
  //                     }`}>
  //                     {invoice.status}
  //                   </span>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>

  //       <div className="mt-6 p-4 bg-blue-50 border border-border rounded-xl">
  //         <div className="flex items-start">
  //           <AlertTriangle className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={20} />
  //           <div>
  //             <p className="text-sm text-blue-900 font-medium">Collection Priority: Focus on 90+ day overdue invoices first</p>
  //             <p className="text-sm text-blue-700 mt-1">These accounts have the highest risk of becoming uncollectible. Consider automated reminders and personal outreach for invoices over 60 days past due.</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderFailedPaymentTab = () => (
    <div className="space-y-6">
      <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
        <h3 className={`text-lg font-semibold  ${theme.text}`}>Failed Payment & Dunning Effectiveness</h3>
        <p className={`${theme.textSecondary} text-sm mb-6`}>Tracker for failed transaction attempts and common reason</p>

        <div className="grid grid-cols-1 gap-6">
          <div className="h-80 pb-6">
            <h4 className={`font-semibold mb-4 ${theme.text}`}>Dunning Effectiveness Report</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={failedPaymentTrends} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="label" stroke={isDark ? '#9ca3af' : '#6b7280'} tick={{ fontSize: 12 }} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    color: isDark ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend />
                <Bar dataKey="failedPayments" fill="#ef4444" name="Failed Payments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Dunning Strategy Performance</h3>

        <div className="mt-2">
          <h4 className={`font-semibold mb-4 ${theme.text}`}>Common Failure Reasons</h4>
          <div className="space-y-5">
            {commonFailureReasons.map((item: any, idx: number) => {
              const barColors = ['#ef4444', '#f97316', '#f59e0b', '#8b5cf6'];
              const color = barColors[idx % barColors.length];
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${theme.text}`}>{item.reason}</span>
                    <span className={`text-sm font-semibold ${theme.text}`}>{item.percentage}%</span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                  {/* {item.count > 0 && (
                    <p className={`text-xs mt-1 ${theme.textSecondary}`}>{item.count} transaction{item.count !== 1 ? 's' : ''} · {currencySymbol}{(item.amount || 0).toLocaleString()}</p>
                  )} */}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );


  // const renderDelinquencyTab = () => (
  //   <div className="space-y-6">
  //     <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //       <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Overdue & Delinquency Report</h3>
  //       <p className={`${theme.textSecondary} text-sm mb-6`}>Accounts with payment issues and outstanding balances</p>

  //       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  //         <div className="p-4 bg-red-50 rounded-xl border border-red-200">
  //           <div className="text-sm text-gray-600 mb-1">Delinquent Accounts</div>
  //           <div className="text-3xl font-bold text-red-600">{delinquencySummary.delinquentAccounts || 0}</div>
  //           <div className="text-sm text-red-600">Active delinquencies</div>
  //         </div>
  //         <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
  //           <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
  //           <div className="text-3xl font-bold text-orange-600">{currencySymbol}{(delinquencySummary.totalOutstanding || 0).toLocaleString()}</div>
  //           <div className="text-sm text-orange-600">Across {delinquencySummary.delinquentAccounts || 0} accounts</div>
  //         </div>
  //         <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
  //           <div className="text-sm text-gray-600 mb-1">Avg Days Past Due</div>
  //           <div className="text-3xl font-bold text-yellow-600">{delinquencySummary.avgDaysPastDue || 0}</div>
  //           <div className="text-sm text-yellow-600">Average delay</div>
  //         </div>
  //         <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
  //           <div className="text-sm text-gray-600 mb-1">Collection Attempts</div>
  //           <div className="text-3xl font-bold text-blue-600">{delinquencySummary.collectionAttempts || 0}</div>
  //           <div className="text-sm text-blue-600">Total this month</div>
  //         </div>
  //       </div>
  //     </div>

  //     <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //       <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Delinquent Account Details</h3>

  //       <div className="overflow-x-auto">
  //         <table className="w-full">
  //           <thead>
  //             <tr className={`border-b ${theme.border}`}>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Customer</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Plan</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Outstanding Balance</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Last Payment</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Days Past Due</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Collection Attempts</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Status</th>
  //               <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Action</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //             {delinquentAccounts.map((account: any, idx: number) => (
  //               <tr key={idx} className={`border-b ${theme.border} ${theme.hover}`}>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{account.customer}</td>
  //                 <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{account.plan}</td>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{currencySymbol}{account.balance}</td>
  //                 <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{account.lastPayment}</td>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{account.daysOverdue} days</td>
  //                 <td className={`py-3 px-4 ${theme.text} text-sm`}>{account.attempts}</td>
  //                 <td className="py-3 px-4">
  //                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${account.status === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
  //                     }`}>
  //                     {account.status}
  //                   </span>
  //                 </td>
  //                 <td className="py-3 px-4">
  //                   <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Contact</button>
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //       <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //         <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Delinquency by Plan Type</h3>
  //         <ResponsiveContainer width="100%" height={250}>
  //           <PieChart>
  //             <Pie
  //               data={planPieData}
  //               cx="50%"
  //               cy="50%"
  //               labelLine={false}
  //               label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
  //               outerRadius={80}
  //               fill="#8884d8"
  //               dataKey="value"
  //             >
  //               {planPieData.map((entry: any, index: number) => (
  //                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  //               ))}
  //             </Pie>
  //             <Tooltip />
  //           </PieChart>
  //         </ResponsiveContainer>
  //       </div>

  //       <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //         <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Collection Actions Required</h3>

  //         <div className="space-y-4">
  //           {(delinquencyReportData?.data?.actionsRequired || []).map((action: any, idx: number) => (
  //             <div key={idx} className={`p-4 rounded-xl border ${action.priority.includes('Critical') ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
  //               }`}>
  //               <div className="flex items-center mb-2">
  //                 {action.priority.includes('Critical') ? <AlertTriangle className="text-red-600 mr-2" size={20} /> : <Clock className="text-yellow-600 mr-2" size={20} />}
  //                 <span className="font-semibold text-gray-900">{action.priority}</span>
  //               </div>
  //               <p className="text-sm text-gray-700">{action.count} {action.message}</p>
  //               <p className="text-xs text-gray-600 mt-1">{action.instruction}</p>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>

  //     <div className={`p-4 bg-blue-50 border border-blue-200 rounded-xl`}>
  //       <div className="flex items-start">
  //         <AlertTriangle className="text-blue-600 mr-3 mt-1 flex-shrink-0" size={20} />
  //         <div>
  //           <p className="text-sm text-blue-900 font-medium">Recommended Action</p>
  //           <p className="text-sm text-blue-700 mt-1">Accounts past 90 days should be escalated to senior management. Consider payment plan negotiations or service suspension for accounts with multiple failed collection attempts. Document all contact attempts for compliance.</p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  const renderRefundTab = () => (
    <div className="space-y-6 bg-navbarBg rounded-xl p-6 shadow-sm border border-border" >
      <div>
        <h3 className={`text-xl md:text-2xl font-bold ${theme.text}`}>Refund & Chargeback Report</h3>
        <p className={`${theme.textSecondary} text-sm mt-1`}>Track refunds and customer-initiated disputes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Refunds */}
        <div className={`bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex justify-between items-center transition-all duration-200`}>
          <div>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Total Refunds</div>
            <div className={`text-3xl font-bold ${theme.text}`}>{refundSummary.totalRefunds || 0}</div>
          </div>
          <RefreshCw className="text-orange-500 transition-colors duration-200" size={28} />
        </div>

        {/* Refund Amount */}
        <div className={`bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex justify-between items-center transition-all duration-200`}>
          <div>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Refund Amount</div>
            <div className={`text-3xl font-bold text-amber-500 dark:text-amber-400`}>{currencySymbol}{(refundSummary.refundAmount || 0).toLocaleString()}</div>
          </div>
          <DollarSign className="text-amber-500 transition-colors duration-200" size={28} />
        </div>

        {/* Chargebacks */}
        <div className={`bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex justify-between items-center transition-all duration-200`}>
          <div>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Chargebacks</div>
            <div className={`text-3xl font-bold text-red-500 dark:text-red-400`}>{refundSummary.chargebacks || 0}</div>
          </div>
          <AlertTriangle className="text-red-500 transition-colors duration-200" size={28} />
        </div>

        {/* Chargeback Fees */}
        <div className={`bg-navbarBg rounded-xl p-5 shadow-sm border border-border flex justify-between items-center transition-all duration-200`}>
          <div>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Chargeback Fees</div>
            <div className={`text-3xl font-bold text-red-500 dark:text-red-400`}>{currencySymbol}{(refundSummary.chargebackFees || 0).toLocaleString()}</div>
          </div>
          <CreditCard className="text-red-500 transition-colors duration-200" size={28} />
        </div>
      </div>

      <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Refund & Chargeback Details</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme.border}`}>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>ID</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Date</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Customer</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Amount</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Type</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Reason</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Fee</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {refundData.map((item: any) => (
                <tr key={item.id} className={`border-b ${theme.border} ${theme.hover}`}>
                  <td className={`py-3 px-4 ${theme.text} text-sm font-medium`}>{item.id}</td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{item.date}</td>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>{item.customer}</td>
                  <td className={`py-3 px-4 ${theme.text} text-sm font-semibold`}>{currencySymbol}{item.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      (item.type || '').toLowerCase() === 'refund'
                        ? 'bg-amber-100/50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-red-100/50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{item.reason}</td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{item.fee}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                      (item.status || '').toLowerCase() === 'completed'
                        ? 'bg-green-100/50 text-green-600 dark:bg-green-950/40 dark:text-green-400'
                        : 'bg-amber-100/50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {refundData.length === 0 && (
                <tr>
                  <td colSpan={8} className={`py-8 text-center text-sm ${theme.textSecondary}`}>
                    No refund transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border flex flex-col justify-between`}>
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Refund Reasons</h3>
            <div className="space-y-4">
              {refundReasons.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <span className={`text-sm ${theme.text}`}>{item.reason}</span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {item.percentage}%
                  </span>
                </div>
              ))}
              {refundReasons.length === 0 && (
                <p className={`text-sm ${theme.textSecondary} text-center py-4`}>No reasons data available</p>
              )}
            </div>
          </div>
        </div>

        <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border flex flex-col justify-between`}>
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Chargeback Rate</h3>
            <div className="space-y-2">
              <div className={`text-5xl font-bold ${theme.text}`}>{chargebackHealth.rate}%</div>
              <div className={`text-xs ${theme.textSecondary}`}>{chargebackHealth.context}</div>
              <div className={`text-sm font-semibold ${
                chargebackHealth.status === 'Healthy' || chargebackHealth.status === 'HEALTHY'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {chargebackHealth.status === 'Healthy' || chargebackHealth.status === 'HEALTHY'
                  ? 'Well below 1% threshold'
                  : 'Above 1% threshold'}
              </div>
            </div>
          </div>
          <div className={`mt-4 p-3.5 transition-colors duration-200 rounded-lg border text-sm ${
            chargebackHealth.status === 'Healthy' || chargebackHealth.status === 'HEALTHY'
              ? 'bg-green-50/70 border-green-200/50 text-green-800 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-300'
              : 'bg-red-50/70 border-red-200/50 text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300'
          }`}>
            Chargeback rate is healthy and within acceptable limits
          </div>
        </div>
      </div>

      <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Refund Impact Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`bg-navbarBg rounded-xl p-5 border border-border transition-colors duration-200`}>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Refund Rate</div>
            <div className={`text-3xl font-bold ${theme.text}`}>{refundImpact.refundRate}%</div>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>{refundImpact.refundRateSubtitle}</div>
          </div>
          <div className={`bg-navbarBg rounded-xl p-5 border border-border transition-colors duration-200`}>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Revenue Impact</div>
            <div className={`text-3xl font-bold ${theme.text}`}>{currencySymbol}{refundImpact.revenueImpact.toLocaleString()}</div>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>Lost revenue (inc. fees)</div>
          </div>
          <div className={`bg-navbarBg rounded-xl p-5 border border-border transition-colors duration-200`}>
            <div className={`text-xs ${theme.textSecondary} mb-1 font-medium`}>Avg Refund Value</div>
            <div className={`text-3xl font-bold ${theme.text}`}>{currencySymbol}{refundImpact.avgRefundValue.toLocaleString()}</div>
            <div className={`text-xs ${theme.textSecondary} mt-1`}>Per refund request</div>
          </div>
        </div>
      </div>

      {/* Prevention Strategy Info Banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors duration-200 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40">
        <Info className="mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400 transition-colors duration-200" size={18} />
        <div>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 transition-colors duration-200">Prevention Strategy: </span>
          <span className="text-sm text-blue-600 dark:text-blue-400 transition-colors duration-200">Monitor refund reasons to identify service improvements. Most refunds are due to service dissatisfaction - consider implementing customer success check-ins during the first 30 days. Chargebacks should be investigated immediately to prevent future disputes.</span>
        </div>
      </div>
    </div>
  );

  const renderTaxTab = () => {
    const totalTransactions = taxByJurisdiction.reduce((s: number, i: any) => s + (i.transactions || 0), 0);
    const totalRevenue = taxByJurisdiction.reduce((s: number, i: any) => s + (i.revenue || 0), 0);
    const totalCollected = taxByJurisdiction.reduce((s: number, i: any) => s + (i.collected || 0), 0);

    return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* First card — purple highlighted */}
          <div className="p-5 rounded-xl bg-purple-50 border border-purple-200 dark:bg-purple-900/30 dark:border-purple-700/40 transition-colors duration-200">
            <div className="text-sm font-medium mb-2 text-purple-600 dark:text-purple-300 transition-colors duration-200">Total Tax Collected</div>
            <div className="text-3xl font-bold mb-1 text-purple-700 dark:text-purple-200 transition-colors duration-200">{currencySymbol}{(taxSummary.taxCollected || 0).toLocaleString()}</div>
            <div className="text-sm text-purple-500 dark:text-purple-400 transition-colors duration-200">This month</div>
          </div>
          {/* Jurisdictions */}
          <div className={`p-5 rounded-xl border ${theme.border} bg-navbarBg`}>
            <div className={`text-sm font-medium mb-2 ${theme.textSecondary}`}>Jurisdictions</div>
            <div className={`text-3xl font-bold mb-1 ${theme.text}`}>{taxSummary.jurisdictions || 0}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Active tax regions</div>
          </div>
          {/* Taxable Revenue */}
          <div className={`p-5 rounded-xl border ${theme.border} bg-navbarBg`}>
            <div className={`text-sm font-medium mb-2 ${theme.textSecondary}`}>Taxable Revenue</div>
            <div className={`text-3xl font-bold mb-1 ${theme.text}`}>{currencySymbol}{(taxSummary.taxableRevenue || 0).toLocaleString()}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Total taxable amount</div>
          </div>
          {/* Avg Tax Rate */}
          <div className={`p-5 rounded-xl border ${theme.border} bg-navbarBg`}>
            <div className={`text-sm font-medium mb-2 ${theme.textSecondary}`}>Avg Tax Rate</div>
            <div className={`text-3xl font-bold mb-1 ${theme.text}`}>{taxSummary.avgTaxRate || '0.0%'}</div>
            <div className={`text-sm ${theme.textSecondary}`}>Weighted average</div>
          </div>
        </div>
      </div>

      {/* Tax Breakdown Table */}
      <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Tax Breakdown by Jurisdiction</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme.border}`}>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Jurisdiction</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Transactions</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Income</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Tax Rate</th>
                <th className={`text-left py-3 px-4 ${theme.textSecondary} font-medium text-sm`}>Tax Collected</th>
              </tr>
            </thead>
            <tbody>
              {taxByJurisdiction.map((item: any, idx: number) => (
                <tr key={idx} className={`border-b ${theme.border} ${theme.hover}`}>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={theme.textSecondary}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      {item.jurisdiction}
                    </div>
                  </td>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>{item.transactions}</td>
                  <td className={`py-3 px-4 ${theme.text} text-sm`}>{currencySymbol}{(item.revenue || 0).toLocaleString()}</td>
                  <td className={`py-3 px-4 ${theme.textSecondary} text-sm`}>{item.rate}</td>
                  <td className={`py-3 px-4 ${theme.text} text-sm font-semibold`}>{currencySymbol}{(item.collected || 0).toLocaleString()}</td>
                </tr>
              ))}
              {/* Total row */}
              {taxByJurisdiction.length > 0 && (
                <tr className="transition-colors duration-200 bg-gray-50 dark:bg-gray-800/60">
                  <td className={`py-3 px-4 text-sm font-semibold ${theme.text}`}>Total</td>
                  <td className={`py-3 px-4 text-sm font-semibold ${theme.text}`}>{totalTransactions}</td>
                  <td className={`py-3 px-4 text-sm font-semibold ${theme.text}`}>{currencySymbol}{totalRevenue.toLocaleString()}</td>
                  <td className={`py-3 px-4 text-sm ${theme.textSecondary}`}>-</td>
                  <td className={`py-3 px-4 text-sm font-semibold ${theme.text}`}>{currencySymbol}{totalCollected.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Tax Collection by Region</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taxRegionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${(name || '').split(',')[0]}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taxRegionData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Tax Compliance Status</h3>

          <div className="space-y-3">
            {(taxRegionApiData?.data && Array.isArray(taxRegionApiData.data) ? taxRegionApiData.data : []).map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="text-green-600 mr-2" size={20} />
                  <div>
                    <span className="font-medium text-gray-900">{item.region}</span>
                    <p className="text-xs text-green-700">{item.percentage}% of total tax</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-green-700 font-semibold">{currencySymbol}{(item.value || 0).toLocaleString()}</span>
                  <p className="text-xs text-green-600">Compliant</p>
                </div>
              </div>
            ))}
            {(!taxRegionApiData?.data || (taxRegionApiData?.data as any[])?.length === 0) && (
              <p className={`text-sm ${theme.textSecondary} text-center py-4`}>No compliance data available</p>
            )}
          </div>
        </div>

      </div>

      {/* Tax Compliance Info Banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors duration-200 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/40">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400 transition-colors duration-200"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div>
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 transition-colors duration-200">Tax Compliance: </span>
          <span className="text-sm text-blue-600 dark:text-blue-400 transition-colors duration-200">All jurisdictions are up to date. Automated tax calculation is active for all regions. Review upcoming remittance deadlines and ensure sufficient funds are allocated. Export detailed reports for your accounting team or tax professional.</span>
        </div>
      </div>
    </div>
    );
  };

  // const renderDSOTab = () => (
  //   <div className="space-y-6">
  //     <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //       <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>DSO Analysis</h3>
  //       <p className={`${theme.textSecondary} text-sm mb-6`}>Day Sales Outstanding (DSO) trend and efficiency metrics</p>

  //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
  //         <div className="p-4 bg-green-50 rounded-xl border border-green-200">
  //           <div className="text-sm text-gray-600 mb-1">Current DSO</div>
  //           <div className="text-3xl font-bold text-green-600">{dsoMetrics.currentDso || 0} days</div>
  //           <div className="text-sm text-green-600">{dsoMetrics.dsoStatus || 'No status'}</div>
  //         </div>
  //         <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
  //           <div className="text-sm text-gray-600 mb-1">Best Possible DSO</div>
  //           <div className="text-3xl font-bold text-blue-600">{dsoMetrics.bestPossibleDso || 0} days</div>
  //           <div className="text-sm text-blue-600">Theoretical minimum</div>
  //         </div>
  //         <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
  //           <div className="text-sm text-gray-600 mb-1">Collection Efficiency</div>
  //           <div className="text-3xl font-bold text-purple-600">{dsoMetrics.collectionEfficiency || '0%'}</div>
  //           <div className="text-sm text-purple-600">Collection Effectiveness Index</div>
  //         </div>
  //       </div>

  //       <div className="h-80 p-6">
  //         <h4 className={`font-semibold mb-4 ${theme.text}`}>DSO Trend vs Target</h4>
  //         <ResponsiveContainer width="100%" height="100%">
  //           <AreaChart data={dsoTrendData}>
  //             <defs>
  //               <linearGradient id="colorDso" x1="0" y1="0" x2="0" y2="1">
  //                 <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
  //                 <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
  //               </linearGradient>
  //             </defs>
  //             <XAxis dataKey={xAxisKey} stroke={isDark ? '#9ca3af' : '#6b7280'} />
  //             <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
  //             <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: isDark ? '#1f2937' : '#ffffff',
  //                 border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
  //               }}
  //             />
  //             <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDso)" name="Actual DSO" />
  //             <Area type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" fill="none" name="Target (30 Days)" />
  //           </AreaChart>
  //         </ResponsiveContainer>
  //       </div>
  //     </div>

  //     <div className={`bg-navbarBg rounded-xl p-6 shadow-sm border border-border`}>
  //       <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>Aging Bucket Analysis</h3>
  //       <p className={`${theme.textSecondary} text-sm mb-4`}>Current accounts receivable aging distribution compared to industry standard</p>

  //       <div className="space-y-4">
  //         <div className="space-y-2">
  //           {agingBucketAnalysis.map((item: any, idx: number) => (
  //             <div key={idx} className="flex justify-between items-center">
  //               <span className={`${theme.text} w-24 capitalize`}>{item.label}</span>
  //               <div className="flex-1 mx-4 bg-gray-200 rounded-full h-4 overflow-hidden">
  //                 <div className={`h-full rounded-full ${item.label.includes('Current') ? 'bg-green-500' :
  //                   item.label.includes('1-30') ? 'bg-yellow-500' :
  //                     item.label.includes('31-60') ? 'bg-orange-500' :
  //                       'bg-red-500'
  //                   }`} style={{ width: `${item.percentage}%` }}></div>
  //               </div>
  //               <span className={`${theme.text} w-16 text-right`}>{item.percentage}%</span>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className={`min-h-screen`}>
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
                <Link href="/admin/dashboard">
                  <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Reports & Analytics</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-bgBlue dark:text-blue-400 font-medium">Billing & Payment Report</span>
              </div>
              <h1 className={`text-2xl md:text-3xl font-bold ${theme.text}`}>Billing & Payment Report</h1>
              <p className={`${theme.textSecondary} mt-1`}>Comprehensive financial analytics and subscription metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Dropdown
                value={timeRange || '--'}
                options={timeRanges.map(t => t.label)}
                onChange={(label) => setTimeRange(label === '--' ? '' : label)}
              />
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(prev => !prev)}
                  className="px-4 py-2 border border-bgBlue text-bgBlue rounded-lg shadow-customShadow flex items-center gap-2 transition-colors text-sm font-medium cursor-pointer bg-navbarBg hover:bg-blue-50 dark:hover:bg-blue-900/20 whitespace-nowrap"
                >
                  <Download size={18} />
                  Export Report
                </button>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 mt-2 bg-navbarBg border border-border rounded-lg shadow-xl z-20 min-w-[170px] overflow-hidden animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() => { handleExport(); setShowExportMenu(false); }}
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
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-6">
          <div className={`bg-navbarBg rounded-lg p-4 shadow-sm border border-border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textSecondary}`}>Success Payments</span>
              <CheckCircle size={30} className="text-green-500" />
            </div>
            <div className={`text-2xl font-bold ${theme.text}`}>{currencySymbol}{kpiData.successRate.value.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${kpiData.successRate.trend === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {kpiData.successRate.trend === 'increase' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{kpiData.successRate.change}%</span>
              <span className={theme.textSecondary}>{kpiData.successRate.trend === 'increase' ? 'Increase' : 'Reduction'}</span>
            </div>
          </div>

          <div className={`bg-navbarBg rounded-lg p-4 shadow-sm border border-border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textSecondary}`}>Failed Payments</span>
              <XCircle size={30} className="text-red-500" />
            </div>
            <div className={`text-2xl font-bold ${theme.text}`}>{currencySymbol}{kpiData.failedPayments.value.toLocaleString()}</div>
            <div className={`flex items-center gap-1 text-sm mt-1 ${kpiData.failedPayments.trend === 'reduction' ? 'text-green-600' : 'text-red-600'}`}>
              {kpiData.failedPayments.trend === 'reduction' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              <span>{kpiData.failedPayments.change}%</span>
              <span className={theme.textSecondary}>{kpiData.failedPayments.trend === 'reduction' ? 'Reduction' : 'Increase'}</span>
            </div>
          </div>

          {/* <div className={`bg-navbarBg rounded-lg p-4 shadow-sm border border-border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textSecondary}`}>Overdue Invoices</span>
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div className={`text-2xl font-bold ${theme.text}`}>{kpiData.overdueInvoices.count}</div>
            <div className={`text-sm ${theme.textSecondary} mt-1`}>${kpiData.overdueInvoices.amount} outstanding</div>
          </div>

          <div className={`bg-navbarBg rounded-lg p-4 shadow-sm border border-border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textSecondary}`}>Recovery Rate</span>
              <RefreshCw size={20} className="text-purple-600" />
            </div>
            <div className={`text-2xl font-bold ${theme.text}`}>{kpiData.recoveryRate.value}%</div>
            <div className={`text-sm text-green-600 mt-1`}>{kpiData.recoveryRate.recovered} recovered</div>
          </div>

          <div className={`bg-navbarBg rounded-lg p-4 shadow-sm border border-border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${theme.textSecondary}`}>Avg DSO</span>
              <Clock size={20} className="text-cyan-600" />
            </div>
            <div className={`text-2xl font-bold ${theme.text}`}>{kpiData.avgDSO.value} days</div>
            <div className={`text-sm ${theme.textSecondary} mt-1`}>Below {kpiData.avgDSO.target}-day target</div>
          </div> */}
        </div>

        {/* Tabs */}
        <div className="bg-navbarBg rounded-full border border-border p-1.5 mb-6 inline-flex gap-2 overflow-x-auto max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab === tab.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-100 dark:ring-blue-800 shadow-customShadow'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'transactions' && renderTransactionsTab()}
          {/* {activeTab === 'invoice-aging' && renderInvoiceAgingTab()} */}
          {activeTab === 'failed-payment' && renderFailedPaymentTab()}
          {/* {activeTab === 'delinquency' && renderDelinquencyTab()} */}
          {activeTab === 'refund' && renderRefundTab()}
          {activeTab === 'tax' && renderTaxTab()}
          {/* {activeTab === 'dso' && renderDSOTab()} */}
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;