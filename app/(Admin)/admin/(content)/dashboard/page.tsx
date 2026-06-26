'use client';

import React, { useState, useMemo } from 'react';
import { Users, Headphones, Crown, DollarSign, TvMinimal } from 'lucide-react';
import AddUserModal from '@/components/Admin/usermanagement/AddUserModal';
import {
  useGetDashboardOverviewQuery,
  useLazyGetDashboardExportQuery,
} from '@/redux/api/admin/dashbaordApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfHeader } from '@/lib/pdfUtils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import TicketDetailsDialog from '../support/support-tickets/_components/TicketDetailsDialog';
import { type Ticket } from '@/redux/api/admin/support/adminSupportTicketApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store/store';
import { getCurrencySymbol } from '@/lib/currencyUtils';

// Import refactored subcomponents
import MetricCard from '@/components/Admin/dashboard/MetricCard';
import DashboardHeader from '@/components/Admin/dashboard/DashboardHeader';
import DateSelector, { DateRange } from '@/components/Admin/dashboard/DateSelector';
import SubscriptionDistribution from '@/components/Admin/dashboard/SubscriptionDistribution';
import PlatformActivityTrend from '@/components/Admin/dashboard/PlatformActivityTrend';
import ContentUsageBreakdown from '@/components/Admin/dashboard/ContentUsageBreakdown';
import RecentCriticalActivity from '@/components/Admin/dashboard/RecentCriticalActivity';
import RecentSupportTickets from '@/components/Admin/dashboard/RecentSupportTickets';

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  
  const currency = useSelector((state: RootState) => state.settings.currency);
  const currencySymbol = getCurrencySymbol(currency);

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
          ['MRR', `${currencySymbol}${(reportData.overview.monthlyRecurringRevenue.value || 0).toLocaleString()}`, `${reportData.overview.monthlyRecurringRevenue.growth || 0}%`],
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
            value={`${getCurrencySymbol(currency)}${(stats?.monthlyRecurringRevenue?.value || 0).toLocaleString()}`}
            change={`${stats?.monthlyRecurringRevenue?.growth || 0}%`}
            isPositive={(stats?.monthlyRecurringRevenue?.growth || 0) >= 0}
            subtitle={`ARR: ${getCurrencySymbol(currency)}${(stats?.monthlyRecurringRevenue?.arr || 0).toLocaleString()}`}
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
