"use client";

import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Activity, LogIn, Clock, AlertTriangle, ChevronDown, Download, Filter, CheckCircle, AlertCircle, Shield, TrendingUp, Home, ChevronRight } from 'lucide-react';
import Dropdown from '@/components/shared/Dropdown';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
  useGetUserActivityOverviewQuery, useGetAuditOverviewQuery, useGetRecentActivityQuery,
  useGetActionDistributionQuery, useGetSecurityEventsQuery, useGetAdoptionOverviewQuery,
  useGetAdoptionTrendQuery, useGetFeatureUsageQuery, useGetEngagementLevelsQuery,
  useGetSessionDurationTrendQuery, useGetInventoryOverviewQuery, useGetUserDirectoryQuery,
  useGetUsersByRoleQuery, useGetPermissionOverviewQuery, useGetAuthOverviewQuery,
  useGetAuthEventsQuery, useGetLoginActivityTrendQuery, useGetSecurityAlertsQuery,
  useLazyGetUserActivityExportQuery,
} from '@/redux/api/admin/User Report/userreportApi';

// Demo data generator
const generateData = (days: number) => {
  const factor = days === 1 ? 0.8 : days === 7 ? 0.95 : days === 30 ? 1 : 1.1;

  return {
    summary: {
      totalUsers: Math.round(456 * factor),
      activeUsers: Math.round(423 * factor),
      loginsToday: Math.round(533 * factor),
      avgSession: '38 min',
      failedLogins: Math.round(8 * factor)
    },
    activityLog: {
      totalActions: Math.round(18234 * factor),
      successRate: Math.round(18089 * factor),
      failedActions: Math.round(145 * factor),
      uniqueUsers: Math.round(423 * factor),
      recentActivity: [
        { id: 'ACT-2025-001', timestamp: '2025-01-27 14:32:15', user: 'admin@qupe.com', action: 'Content Upload', resource: 'Summer Sale Campaign', ip: '192.168.1.100', status: 'Success' },
        { id: 'ACT-2024-002', timestamp: '2025-01-27 14:28:43', user: 'manager@techcorp.com', action: 'System Config', resource: 'NYC-Times-Square-01', ip: '203.45.67.89', status: 'Success' },
        { id: 'ACT-2025-003', timestamp: '2025-01-27 14:19:22', user: 'editor@materialsone.com', action: 'Playlist Edit', resource: 'Weekend Special Playlist', ip: '172.16.0.45', status: 'Success' },
        { id: 'ACT-2025-004', timestamp: '2025-01-27 13:58:10', user: 'super@qupe.com', action: 'User Permission Change', resource: 'john.doe@company.com', ip: '192.168.1.101', status: 'Success' },
        { id: 'ACT-2024-005', timestamp: '2025-01-27 13:46:33', user: 'malicious@example.com', action: 'Device Deletion Attempt', resource: 'LA-Downtown-03', ip: '45.67.88.123', status: 'Failed' }
      ],
      actionDistribution: [
        { name: 'Content', value: Math.round(4500 * factor) },
        { name: 'System', value: Math.round(4200 * factor) },
        { name: 'Playlist', value: Math.round(3500 * factor) },
        { name: 'User Mgmt', value: Math.round(3000 * factor) },
        { name: 'Settings', value: Math.round(2800 * factor) }
      ]
    },
    userAdoption: {
      monthlyActiveUsers: Math.round(456 * factor),
      newUsers: Math.round(72 * factor),
      avgSessionDuration: '38 min',
      growthRate: '+18.7%',
      adoptionTrend: Array.from({ length: days === 1 ? 24 : days === 7 ? 7 : days === 30 ? 30 : 12 }, (_, i) => ({
        month: days === 1 ? `${i}:00` : days === 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
          days === 30 ? `Day ${i + 1}` :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        activeUsers: 200 + i * 50 + Math.random() * 100,
        newUsers: 40 + i * 5 + Math.random() * 20
      })),
      featureUsage: [
        { feature: 'Content Upload', rate: 95, users: 234, trend: '+3%' },
        { feature: 'Report Management', rate: 87, users: 198, trend: '+8%' },
        { feature: 'Playlist Creation', rate: 78, users: 176, trend: '+5%' },
        { feature: 'Analytics Dashboard', rate: 65, users: 142, trend: '-2%' },
        { feature: 'User Management', rate: 42, users: 98, trend: '+4%' },
        { feature: 'Device Monitoring', rate: 38, users: 87, trend: '+6%' }
      ],
      engagementLevels: [
        { level: 'Highly Engaged', users: 256, description: 'Daily logins, 5+ sessions' },
        { level: 'Moderately Engaged', users: 186, description: 'Weekly logins, 2-4 sessions' },
        { level: 'Low Engagement', users: 95, description: 'Monthly logins, <2 sessions' }
      ],
      sessionDuration: Array.from({ length: days === 1 ? 24 : days === 7 ? 7 : days === 30 ? 30 : 12 }, (_, i) => ({
        month: days === 1 ? `${i}:00` : days === 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
          days === 30 ? `Day ${i + 1}` :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        duration: 15 + i * 2 + Math.random() * 5
      }))
    },
    userInventory: {
      totalUsers: Math.round(456 * factor),
      activeUsers: Math.round(423 * factor),
      inactiveUsers: Math.round(33 * factor),
      organizations: Math.round(87 * factor),
      users: [
        { id: 'USR-001', name: 'John Admin', email: 'admin@qupe.com', role: 'Super Admin', org: 'Qupe Platform', status: 'Active', lastLogin: '2025-01-27 14:32' },
        { id: 'USR-002', name: 'Sarah Manager', email: 'manager@techcorp.com', role: 'Admin', org: 'TechCorp Inc.', status: 'Active', lastLogin: '2025-01-27 14:28' },
        { id: 'USR-003', name: 'Mike Editor', email: 'editor@mediasolutions.com', role: 'Editor', org: 'Media Solutions', status: 'Active', lastLogin: '2025-01-26 18:45' },
        { id: 'USR-004', name: 'Lisa Viewer', email: 'viewer@healthcare.com', role: 'Viewer', org: 'HealthCare Plus', status: 'Active', lastLogin: '2025-01-26 16:40' },
        { id: 'USR-005', name: 'Tom Inactive', email: 'old.user@company.com', role: 'Editor', org: 'Old Company', status: 'Inactive', lastLogin: '2024-11-15 10:23' }
      ],
      roleDistribution: [
        { name: 'Super Admin', value: Math.round(234 * factor), color: '#f59e0b' },
        { name: 'Admin', value: Math.round(123 * factor), color: '#8b5cf6' },
        { name: 'Viewer', value: Math.round(99 * factor), color: '#10b981' }
      ],
      permissions: [
        { name: 'Full Access (Super Admin)', count: 8, description: 'All platform features' },
        { name: 'Admin Access', count: 83, description: 'Organization management' },
        { name: 'Editor Access', count: 234, description: 'Content & screen management' },
        { name: 'View-Only Access', count: 182, description: 'Read-only permissions' }
      ]
    },
    authentication: {
      successfulLogins: Math.round(533 * factor),
      failedAttempts: Math.round(8 * factor),
      twoFactorVerified: Math.round(512 * factor),
      successRate: '98.5%',
      authEvents: [
        { id: 'AUTH-2025-001', timestamp: '2025-01-27 14:38:19', user: 'admin@qupe.com', action: 'Login', status: 'Success', ip: '192.168.1.100', location: 'New York, USA', device: 'Chrome on Windows' },
        { id: 'AUTH-2025-002', timestamp: '2025-01-27 14:30:43', user: 'manager@techcorp.com', action: 'Login', status: 'Success', ip: '203.45.67.89', location: 'Los Angeles, USA', device: 'Safari on macOS' },
        { id: 'AUTH-2025-003', timestamp: '2025-01-27 14:10:02', user: 'editor@mediasolutions.com', action: 'Login Attempt', status: 'Failed', ip: '45.67.88.101', location: 'Unknown', device: 'Unknown' },
        { id: 'AUTH-2025-004', timestamp: '2025-01-27 14:10:01', user: 'editor@materialsone.com', action: 'Login', status: 'Success', ip: '172.16.0.45', location: 'Chicago, USA', device: 'Firefox on Linux' },
        { id: 'AUTH-2025-005', timestamp: '2025-01-27 14:10:33', user: 'admin@qupe.com', action: '2FA Verification', status: 'Success', ip: '192.168.1.100', location: 'New York, USA', device: 'Chrome on Windows' }
      ],
      loginActivity: Array.from({ length: days === 1 ? 24 : days === 7 ? 7 : days === 30 ? 30 : 12 }, (_, i) => ({
        time: days === 1 ? `${i}:00` : days === 7 ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] :
          days === 30 ? `Day ${i + 1}` :
            ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        successful: 60 + Math.random() * 40,
        failed: 2 + Math.random() * 5
      })),
      securityAlerts: [
        { type: 'error', title: 'Suspicious IP Detected', description: '3 failed attempts from 45.88.12.53', time: '2025-01-27 13:45' },
        { type: 'warning', title: 'New Location Login', description: 'User logged in from new city', time: '2025-01-27 12:30' },
        { type: 'success', title: 'All Systems Normal', description: 'No critical security events', time: 'Current' }
      ]
    }
  };
};

const UserActivityReports = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [timeRange, setTimeRange] = useState(30);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const timeRanges = [
    { value: 1, label: 'Last 1 day' },
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 365, label: 'Last 1 year' }
  ];

  const tabs = [
    { id: 'activity', label: 'Activity Log' },
    { id: 'adoption', label: 'User Adoption' },
    { id: 'inventory', label: 'User Inventory' },
    { id: 'authentication', label: 'Authentication' }
  ];

  const apiTimeRange = timeRange === 1 ? '1d' : timeRange === 7 ? '7d' : timeRange === 365 ? '1y' : '30d';
  const { data: overview } = useGetUserActivityOverviewQuery({ timeRange: apiTimeRange });
  const { data: auditOv } = useGetAuditOverviewQuery({ timeRange: apiTimeRange });
  const { data: recentAct } = useGetRecentActivityQuery({ timeRange: apiTimeRange });
  const { data: actDist } = useGetActionDistributionQuery({ timeRange: apiTimeRange });
  const { data: secEv } = useGetSecurityEventsQuery({ timeRange: apiTimeRange });
  const { data: adoptOv } = useGetAdoptionOverviewQuery({ timeRange: apiTimeRange });
  const { data: adoptTr } = useGetAdoptionTrendQuery({ timeRange: apiTimeRange });
  const { data: featUse } = useGetFeatureUsageQuery({ timeRange: apiTimeRange });
  const { data: engLvl } = useGetEngagementLevelsQuery({ timeRange: apiTimeRange });
  const { data: sessTr } = useGetSessionDurationTrendQuery({ timeRange: apiTimeRange });
  const { data: invOv } = useGetInventoryOverviewQuery({ timeRange: apiTimeRange });
  const { data: userDir } = useGetUserDirectoryQuery({ timeRange: apiTimeRange });
  const { data: byRole } = useGetUsersByRoleQuery({ timeRange: apiTimeRange });
  const { data: permOv } = useGetPermissionOverviewQuery({ timeRange: apiTimeRange });
  const { data: authOv } = useGetAuthOverviewQuery({ timeRange: apiTimeRange });
  const { data: authEv } = useGetAuthEventsQuery({ timeRange: apiTimeRange });
  const { data: loginTr } = useGetLoginActivityTrendQuery({ timeRange: apiTimeRange });
  const { data: secAl } = useGetSecurityAlertsQuery({ timeRange: apiTimeRange });
  const [triggerExport] = useLazyGetUserActivityExportQuery();

  const data = {
    summary: { totalUsers: overview?.data?.totalUsers?.value ?? 0, activeUsers: overview?.data?.activeUsers?.value ?? 0, loginsToday: overview?.data?.loginsToday?.value ?? 0, avgSession: `${overview?.data?.avgSession?.value ?? 0} min`, failedLogins: overview?.data?.failedLogins?.value ?? 0 },
    activityLog: { totalActions: auditOv?.data?.totalActions?.value ?? 0, successRate: auditOv?.data?.successful?.value ?? 0, failedActions: auditOv?.data?.failed?.value ?? 0, uniqueUsers: auditOv?.data?.uniqueUsers?.value ?? 0, recentActivity: (recentAct?.data ?? []).map((a: any) => ({ id: a.id, timestamp: new Date(a.timestamp).toLocaleString(), user: a.user, action: a.action, resource: a.resource, ip: a.ipAddress, status: a.status })), actionDistribution: (actDist?.data ?? []).map((a: any) => ({ name: a.label, value: a.value })) },
    userAdoption: { monthlyActiveUsers: adoptOv?.data?.activeUsers?.value ?? 0, newUsers: adoptOv?.data?.newUsers?.value ?? 0, avgSessionDuration: `${adoptOv?.data?.avgSessionDuration?.value ?? 0} min`, growthRate: adoptOv?.data?.growthRate?.value ?? '0%', adoptionTrend: (adoptTr?.data ?? []).map((a: any) => ({ month: a.label, activeUsers: a.activeUsers, newUsers: a.newUsers })), featureUsage: (featUse?.data ?? []).map((f: any) => ({ feature: f.name, rate: parseInt(String(f.percentage ?? '0')), users: f.users, trend: f.growth })), engagementLevels: engLvl?.data ? [{ level: 'Highly Engaged', users: engLvl.data.highlyEngaged?.users ?? 0, description: engLvl.data.highlyEngaged?.label ?? '' }, { level: 'Moderately Engaged', users: engLvl.data.moderatelyEngaged?.users ?? 0, description: engLvl.data.moderatelyEngaged?.label ?? '' }, { level: 'Low Engagement', users: engLvl.data.lowEngagement?.users ?? 0, description: engLvl.data.lowEngagement?.label ?? '' }] : [], sessionDuration: (sessTr?.data ?? []).map((s: any) => ({ month: s.label, duration: s.duration })) },
    userInventory: { totalUsers: invOv?.data?.totalUsers?.value ?? 0, activeUsers: invOv?.data?.active?.value ?? 0, inactiveUsers: invOv?.data?.inactive?.value ?? 0, organizations: invOv?.data?.organizations?.value ?? 0, users: (userDir?.data ?? []).map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role, org: u.organization, status: u.status, lastLogin: u.lastLogin ?? 'N/A' })), roleDistribution: (byRole?.data ?? []).map((r: any, i: number) => ({ name: r.role, value: r.count, color: ['#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'][i % 4] })), permissions: (permOv?.data ?? []).map((p: any) => ({ name: p.label, count: p.value, description: p.description })) },
    authentication: { successfulLogins: authOv?.data?.successLogins?.value ?? 0, failedAttempts: authOv?.data?.failedAttempts?.value ?? 0, twoFactorVerified: authOv?.data?.twoFactorVerified?.value ?? 0, successRate: authOv?.data?.successRate?.value ?? '0%', authEvents: (authEv?.data ?? []).map((e: any) => ({ id: e.id, timestamp: e.timestamp, user: e.user, action: e.action, status: e.status, ip: e.ipAddress, location: e.location ?? 'N/A', device: e.device ?? 'N/A' })), loginActivity: (loginTr?.data ?? []).map((l: any) => ({ time: l.label, successful: l.successfulLogins, failed: l.failedAttempts })), securityAlerts: (secAl?.data ?? []).map((a: any) => ({ type: a.type === 'SUCCESS' ? 'success' : a.type === 'WARNING' ? 'warning' : 'error', title: a.title, description: a.description, time: a.timestamp })) },
  };

  const handleExportPDF = async () => {
    try {
      const res = await triggerExport({ timeRange: apiTimeRange }).unwrap();
      const exp = res?.data;
      const doc = new jsPDF();
      doc.setFontSize(16); doc.text('User Activity Report', 14, 15);
      doc.setFontSize(10); doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 22);
      doc.setFontSize(13); doc.text('Summary', 14, 30);
      autoTable(doc, { startY: 34, head: [['Metric', 'Value']], body: [['Total Users', exp?.summary?.totalUsers?.value ?? 0], ['Active Users', exp?.summary?.activeUsers?.value ?? 0], ['Logins Today', exp?.summary?.loginsToday?.value ?? 0], ['Failed Logins', exp?.summary?.failedLogins?.value ?? 0]] });
      let y: number = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(13); doc.text('Audit Overview', 14, y);
      autoTable(doc, { startY: y + 4, head: [['Metric', 'Value']], body: [['Total Actions', exp?.audit?.overview?.totalActions?.value ?? 0], ['Successful', exp?.audit?.overview?.successful?.value ?? 0], ['Failed', exp?.audit?.overview?.failed?.value ?? 0], ['Unique Users', exp?.audit?.overview?.uniqueUsers?.value ?? 0]] });
      y = (doc as any).lastAutoTable.finalY + 10;
      if ((exp?.audit?.recentActivity ?? []).length) {
        doc.setFontSize(13); doc.text('Recent Activity', 14, y);
        autoTable(doc, { startY: y + 4, head: [['ID', 'Timestamp', 'User', 'Action', 'Resource', 'Status']], body: exp.audit.recentActivity.map((a: any) => [a.id, a.timestamp, a.user, a.action, a.resource, a.status]) });
        y = (doc as any).lastAutoTable.finalY + 10;
      }
      if ((exp?.inventory?.directory ?? []).length) {
        doc.setFontSize(13); doc.text('User Directory', 14, y);
        autoTable(doc, { startY: y + 4, head: [['ID', 'Name', 'Email', 'Role', 'Status']], body: exp.inventory.directory.map((u: any) => [u.id, u.name, u.email, u.role, u.status]) });
      }
      doc.save('user-activity-report.pdf');
    } catch (e) { console.error('PDF export failed', e); }
    setShowExportMenu(false);
  };

  const handleExportExcel = async () => {
    try {
      const res = await triggerExport({ timeRange: apiTimeRange }).unwrap();
      const exp = res?.data;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Metric', 'Value'], ['Total Users', exp?.summary?.totalUsers?.value ?? 0], ['Active Users', exp?.summary?.activeUsers?.value ?? 0], ['Logins Today', exp?.summary?.loginsToday?.value ?? 0], ['Failed Logins', exp?.summary?.failedLogins?.value ?? 0]]), 'Summary');
      if ((exp?.audit?.recentActivity ?? []).length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ID', 'Timestamp', 'User', 'Action', 'Resource', 'IP', 'Status'], ...exp.audit.recentActivity.map((a: any) => [a.id, a.timestamp, a.user, a.action, a.resource, a.ipAddress, a.status])]), 'Recent Activity');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ID', 'Name', 'Email', 'Role', 'Org', 'Status', 'Last Login'], ...(exp?.inventory?.directory ?? []).map((u: any) => [u.id, u.name, u.email, u.role, u.organization, u.status, u.lastLogin ?? 'N/A'])]), 'User Directory');
      if ((exp?.usage?.features ?? []).length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Feature', 'Users', '%', 'Growth'], ...exp.usage.features.map((f: any) => [f.name, f.users, f.percentage, f.growth])]), 'Feature Usage');
      XLSX.writeFile(wb, 'user-activity-report.xlsx');
    } catch (e) { console.error('Excel export failed', e); }
    setShowExportMenu(false);
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
              <span className="text-bgBlue dark:text-blue-400 font-medium">User & Activity Reports</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">User & Activity Reports</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              User behavior, system access, and accountability tracking
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
                className="px-4 py-2 border border-bgBlue text-bgBlue rounded-lg shadow-customShadow flex items-center gap-2 transition-colors text-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 bg-navbarBg border border-border rounded-lg shadow-lg z-10 min-w-[140px]">
                  <button onClick={handleExportPDF} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg cursor-pointer">📄 PDF</button>
                  <button onClick={handleExportExcel} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg cursor-pointer">📊 Excel</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Total Users</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{data.summary.totalUsers}</div>
            <div className="text-xs text-green-500">{overview?.data?.totalUsers?.growth > 0 ? '+' : ''}{overview?.data?.totalUsers?.growth ?? 0}% {overview?.data?.totalUsers?.label ?? 'this month'}</div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Active Users</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{data.summary.activeUsers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{overview?.data?.activeUsers?.percentage ?? 0}% {overview?.data?.activeUsers?.label ?? 'of total'}</div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Logins Today</span>
              <LogIn className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1 text-green-500">{data.summary.loginsToday}</div>
            <div className="text-xs text-green-500">{overview?.data?.loginsToday?.growth > 0 ? '+' : ''}{overview?.data?.loginsToday?.growth ?? 0}% {overview?.data?.loginsToday?.label ?? 'increase rate'}</div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Avg Session</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{data.summary.avgSession}</div>
            <div className="text-xs text-green-500">{overview?.data?.avgSession?.increase > 0 ? '+' : ''}{overview?.data?.avgSession?.increase ?? 0} {overview?.data?.avgSession?.label ?? 'min increase'}</div>
          </div>

          <div className="bg-navbarBg rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">Failed Logins</span>
              <AlertTriangle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold mb-1">{data.summary.failedLogins}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{overview?.data?.failedLogins?.percentage ?? 0}% {overview?.data?.failedLogins?.label ?? 'of attempts'}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-navbarBg rounded-full border border-border p-1.5 mb-6 inline-flex gap-2 overflow-x-auto max-w-full">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0${activeTab === tab.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-customShadow ring-1 ring-blue-100 dark:ring-blue-800'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">User Activity Log / Audit Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Detailed records of all user actions with timestamps</p>
                </div>
                {/* <button className="flex items-center gap-2 px-4 py-1.5 border border-bgBlue text-bgBlue rounded-lg transition-colors shadow-customShadow">
                  <Download size={18} />
                  <span>Export Report</span>
                </button> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Total Actions</div>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{data.activityLog.totalActions.toLocaleString()}</div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">This month</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Successful</div>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">{data.activityLog.successRate.toLocaleString()}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">98.9% success rate</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <div className="text-sm text-red-600 dark:text-red-400 mb-1">Failed/Failed</div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">{data.activityLog.failedActions}</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">1.1% of activity</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Unique Users</div>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.activityLog.uniqueUsers}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active this month</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Activity</h3>
                  {/* <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button> */}
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Timestamp</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Resource</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">IP Address</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.activityLog.recentActivity.map((activity: any, idx: number) => (
                        <tr key={idx} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 text-sm">{activity.id}</td>
                          <td className="py-3 px-4 text-sm">{activity.timestamp}</td>
                          <td className="py-3 px-4 text-sm">{activity.user}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                              {activity.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{activity.resource}</td>
                          <td className="py-3 px-4 text-sm">{activity.ip}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${activity.status === 'Success'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Action Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.activityLog.actionDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="name" className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                    <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '0.5rem'
                      }}
                      wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Security Events</h3>
                <div className="space-y-3">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-red-700 dark:text-red-400">Unauthorized Access Attempts</div>
                        <div className="text-sm text-red-600 dark:text-red-500 mt-1">{secEv?.data?.unauthorized?.count ?? 0} {secEv?.data?.unauthorized?.label ?? 'blocked this period'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-yellow-700 dark:text-yellow-400">Permission Changes</div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">{secEv?.data?.permissions?.count ?? 0} {secEv?.data?.permissions?.label ?? 'this month'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-green-700 dark:text-green-400">Audit Compliance</div>
                        <div className="text-sm text-green-600 dark:text-green-500 mt-1">{secEv?.data?.auditCompliance?.percentage ?? 100}% {secEv?.data?.auditCompliance?.label ?? 'logging active'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Adoption Tab */}
        {activeTab === 'adoption' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">User Adoption & Engagement Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track adoption, activity updates, and feature usage</p>
                </div>
                {/* <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 dark:hover:bg-gray-600 cursor-pointer">
                  <Download className="w-4 h-4" />
                  Export
                </button> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Monthly Active Users</div>
                      <div className="text-2xl font-bold">{data.userAdoption.monthlyActiveUsers}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">New Users</div>
                      <div className="text-2xl font-bold">{data.userAdoption.newUsers}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Avg Session Duration</div>
                      <div className="text-2xl font-bold">{data.userAdoption.avgSessionDuration}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                    <div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-500">Growth Rate</div>
                      <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{data.userAdoption.growthRate}</div>
                      <div className="text-xs text-yellow-600 dark:text-yellow-500">vs last month</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-4">User Adoption Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.userAdoption.adoptionTrend}>
                    <defs>
                      <linearGradient id="activeUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="newUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
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
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="activeUsers" stroke="#8b5cf6" fillOpacity={1} fill="url(#activeUsers)" name="Active Users" />
                    <Area type="monotone" dataKey="newUsers" stroke="#10b981" fillOpacity={1} fill="url(#newUsers)" name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <h3 className="font-semibold mb-4">Feature Usage</h3>
              <div className="space-y-4">
                {data.userAdoption.featureUsage.map((feature: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{feature.feature}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{feature.users} users</span>
                        <span className={`text-sm font-medium ${feature.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {feature.trend}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${feature.rate}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{feature.rate}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Engagement Levels</h3>
                <div className="space-y-3">
                  {data.userAdoption.engagementLevels.map((level, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${idx === 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                      idx === 1 ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                        'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-medium ${idx === 0 ? 'text-green-700 dark:text-green-400' :
                          idx === 1 ? 'text-blue-700 dark:text-blue-400' :
                            'text-yellow-700 dark:text-yellow-400'
                          }`}>{level.level}</span>
                        <span className={`text-lg font-bold ${idx === 0 ? 'text-green-700 dark:text-green-400' :
                          idx === 1 ? 'text-blue-700 dark:text-blue-400' :
                            'text-yellow-700 dark:text-yellow-400'
                          }`}>{level.users} users</span>
                      </div>
                      <div className={`text-xs ${idx === 0 ? 'text-green-600 dark:text-green-500' :
                        idx === 1 ? 'text-blue-600 dark:text-blue-500' :
                          'text-yellow-600 dark:text-yellow-500'
                        }`}>{level.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Session Duration Trend</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.userAdoption.sessionDuration}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="month"
                      className="fill-gray-600 dark:fill-gray-400"
                      tick={{ fontSize: 12 }}
                      interval={timeRange === 30 ? 4 : 0}
                    />
                    <YAxis className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        border: '1px solid var(--tooltip-border)',
                        borderRadius: '0.5rem'
                      }}
                      wrapperClassName="dark:[--tooltip-bg:#1f2937] dark:[--tooltip-border:#374151] [--tooltip-bg:#ffffff] [--tooltip-border:#e5e7eb]"
                      formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)} min`, 'Avg Session']}
                    />
                    <Line type="monotone" dataKey="duration" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* User Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">User Inventory & Permissions Report</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">All user accounts and assigned roles</p>
                </div>
                {/* <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 dark:hover:bg-gray-600 cursor-pointer">
                  <Download className="w-4 h-4" />
                  Export
                </button> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-purple-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Users</div>
                      <div className="text-2xl font-bold">{data.userInventory.totalUsers}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Active</div>
                      <div className="text-2xl font-bold">{data.userInventory.activeUsers}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Inactive</div>
                      <div className="text-2xl font-bold">{data.userInventory.inactiveUsers}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-navbarBg rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-8 h-8 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Organizations</div>
                      <div className="text-2xl font-bold">{data.userInventory.organizations}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">User Directory</h3>
                  {/* <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button> */}
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Role</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Organization</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.userInventory.users.map((user: any, idx: number) => (
                        <tr key={idx} className="border-b border-border hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 text-sm">{user.id}</td>
                          <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                          <td className="py-3 px-4 text-sm">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'Super Admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                              user.role === 'Admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                user.role === 'Editor' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{user.org}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                              }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{user.lastLogin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Users by Role</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.userInventory.roleDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.userInventory.roleDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {data.userInventory.roleDistribution.map((role: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></div>
                        <span className="text-sm">{role.name}</span>
                      </div>
                      <span className="text-sm font-medium">{role.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Permission Overview</h3>
                <div className="space-y-4">
                  {data.userInventory.permissions.map((perm: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{perm.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{perm.description}</div>
                      </div>
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{perm.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Tab */}
        {activeTab === 'authentication' && (
          <div className="space-y-6">
            <div className="bg-navbarBg rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Authentication & Access Log</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Track all login attempts for security monitoring</p>
                </div>
                {/* <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 dark:hover:bg-gray-600 cursor-pointer">
                  <Download className="w-4 h-4" />
                  Export
                </button> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Successful Logins</div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">{data.authentication.successfulLogins}</div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">Today</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <div className="text-sm text-red-600 dark:text-red-400 mb-1">Failed Attempts</div>
                  <div className="text-3xl font-bold text-red-700 dark:text-red-300">{data.authentication.failedAttempts}</div>
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">Requires review</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">2FA Verified</div>
                  <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{data.authentication.twoFactorVerified}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Enhanced security</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-600 dark:text-green-400 mb-1">Success Rate</div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-300">{data.authentication.successRate}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-xs text-green-600 dark:text-green-400">Excellent</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Authentication Events</h3>
                  {/* <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button> */}
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">ID</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Timestamp</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">User</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Action</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">IP Address</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Location</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">Device</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.authentication.authEvents.map((event: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="py-3 px-4 text-sm">{event.id}</td>
                          <td className="py-3 px-4 text-sm">{event.timestamp}</td>
                          <td className="py-3 px-4 text-sm">{event.user}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center gap-1.5">
                              {event.action === 'Login' ? <LogIn className="w-3.5 h-3.5 text-blue-500" /> :
                                event.action === '2FA Verification' ? <Shield className="w-3.5 h-3.5 text-purple-500" /> :
                                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                              {event.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${event.status === 'Success'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              }`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{event.ip}</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center gap-1.5">
                              {event.location !== 'Unknown' ? '🌍' : '❓'}
                              {event.location}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{event.device}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Login Activity by Hour</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.authentication.loginActivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="time" className="fill-gray-600 dark:fill-gray-400" tick={{ fontSize: 12 }} />
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
                    <Bar dataKey="successful" fill="#10b981" name="Successful Logins" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed Attempts" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-navbarBg rounded-lg p-6 border border-border">
                <h3 className="font-semibold mb-4">Security Alerts</h3>
                <div className="space-y-3">
                  {data.authentication.securityAlerts.map((alert: any, idx: number) => (
                    <div key={idx} className={`rounded-lg p-4 border ${alert.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      }`}>
                      <div className="flex items-start gap-3">
                        {alert.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" /> :
                          alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" /> :
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <div className={`font-medium ${alert.type === 'error' ? 'text-red-700 dark:text-red-400' :
                            alert.type === 'warning' ? 'text-yellow-700 dark:text-yellow-400' :
                              'text-green-700 dark:text-green-400'
                            }`}>{alert.title}</div>
                          <div className={`text-sm mt-1 ${alert.type === 'error' ? 'text-red-600 dark:text-red-500' :
                            alert.type === 'warning' ? 'text-yellow-600 dark:text-yellow-500' :
                              'text-green-600 dark:text-green-500'
                            }`}>{alert.description}</div>
                          {alert.time && (
                            <div className={`text-xs mt-2 ${alert.type === 'error' ? 'text-red-500 dark:text-red-600' :
                              alert.type === 'warning' ? 'text-yellow-500 dark:text-yellow-600' :
                                'text-green-500 dark:text-green-600'
                              }`}>{alert.time}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-700 dark:text-blue-400 mb-2">Security Monitoring</div>
                  <p className="text-sm text-blue-600 dark:text-blue-500">
                    Users are logged with IP addresses, timestamps, and device information. Failed login attempts trigger automatic alerts.
                    Consider enabling 2FA for all users to enhance security. Review suspicious IP regularly to safeguard your account from
                    unauthorized access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityReports;