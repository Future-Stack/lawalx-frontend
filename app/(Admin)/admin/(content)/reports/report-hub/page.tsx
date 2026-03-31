'use client';

import React, { useState, useMemo } from 'react';
import {
    Home,
    Plus,
    FileText,
    Clock,
    CheckCircle2,
    Search,
    ChevronDown,
    Download,
    Eye,
    MoreHorizontal,
    Mail,
    RefreshCcw,
    AlertCircle,
    Calendar,
    Trash2,
    ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import ReportHubPreviewModal from '@/components/Admin/modals/ReportHubPreviewModal';
import ReportHubFormModal from '@/components/Admin/modals/ReportHubFormModal';
import ReportHubEditModal from '@/components/Admin/modals/ReportHubEditModal';
import DeleteConfirmationModal from '@/components/Admin/modals/DeleteConfirmationModal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import Link from 'next/link';
import { 
    useCreateReportMutation, 
    useDeleteReportHistoryMutation, 
    useDeleteReportMutation, 
    useGetAllReportsQuery, 
    useGetReportHistoryQuery, 
    useGetReportStatsQuery, 
    useRunReportMutation, 
    useUpdateReportMutation 
} from '@/redux/api/admin/reportHubApi';
import { toast } from 'sonner';
import { DATA_SOURCES } from '@/constants/reportHubConstants';

export default function ReportHub() {
    const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);

    // Form/Edit Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any>(null);

    // Delete Modal State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState<any>(null);
    const [historyToDelete, setHistoryToDelete] = useState<any>(null);
    const [isHistoryDeleteOpen, setIsHistoryDeleteOpen] = useState(false);

    // Run Status State
    const [runStatus, setRunStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [lastRunName, setLastRunName] = useState('');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDataSource, setSelectedDataSource] = useState('All Data Sources');
    const [selectedCreator, setSelectedCreator] = useState('All Creators');
    const [selectedSchedule, setSelectedSchedule] = useState('All Schedules');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Stats Query
    const { data: statsData } = useGetReportStatsQuery(undefined);
    
    const stats = useMemo(() => [
        { label: 'Total Custom Reports', value: statsData?.data?.totalReports || '0', subtext: 'Saved report templates', icon: FileText },
        { label: 'Active Schedules', value: statsData?.data?.activeSchedules || '0', subtext: 'Automated report runs', icon: Calendar },
        { label: 'Reports Generated', value: statsData?.data?.reportsGenerated || '0', subtext: 'Last 30 days', icon: RefreshCcw },
    ], [statsData]);

    // Reports Query
    const { data: reportsData, isLoading: isReportsLoading } = useGetAllReportsQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        dataSource: selectedDataSource === 'All Data Sources' ? undefined : selectedDataSource,
        schedule: selectedSchedule === 'All Schedules' ? undefined : selectedSchedule.toLowerCase()
    });

    // History Query
    const { data: historyData, isLoading: isHistoryLoading } = useGetReportHistoryQuery({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
    });

    // Mutations
    const [createReport] = useCreateReportMutation();
    const [updateReport] = useUpdateReportMutation();
    const [deleteReport] = useDeleteReportMutation();
    const [runReport] = useRunReportMutation();
    const [deleteHistory] = useDeleteReportHistoryMutation();

    const savedReports = reportsData?.data || [];
    const runHistory = historyData?.data || [];

    // Pagination logic
    const reportsTotalPages = reportsData?.meta?.totalPages || 0;
    const historyTotalPages = historyData?.meta?.totalPages || 0;

    const totalPages = activeTab === 'saved' ? reportsTotalPages : historyTotalPages;
    const currentDataCount = activeTab === 'saved' ? savedReports.length : runHistory.length;
    const totalDataCount = activeTab === 'saved' ? reportsData?.meta?.total || 0 : historyData?.meta?.total || 0;

    const handleRun = async (report: any) => {
        setLastRunName(report.name);
        setRunStatus('loading');
        try {
            await runReport(report.id).unwrap();
            setRunStatus('success');
            toast.success("Report run initiated successfully");
        } catch (error) {
            setRunStatus('idle');
            toast.error("Failed to run report");
        }
    };

    const handleCreateReport = async (data: any) => {
        try {
            const dataSourceFields = DATA_SOURCES[data.dataSource] || [];
            const mappedColumns = (data.selectedColumnIds || []).map((id: string) => {
                const field = dataSourceFields.find(f => f.id === id);
                return field ? field.label : id;
            });

            const mappedFilters = (data.filters || []).reduce((acc: any, filter: any) => {
                acc[filter.fieldId] = filter.value;
                return acc;
            }, {});

            await createReport({
                name: data.name,
                description: data.description || "",
                dataSource: data.dataSource,
                columns: mappedColumns,
                filters: mappedFilters,
                scheduleEnabled: data.enableSchedule,
                scheduleType: data.frequency?.toLowerCase(),
                emailRecipients: data.emailRecipients ? [data.emailRecipients] : [],
                outputFormat: data.outputFormat?.toUpperCase() || "EXCEL",
                emailSubject: data.emailSubject || `${data.name} Report`
            }).unwrap();
            setIsFormOpen(false);
            toast.success("Report created successfully");
        } catch (error) {
            toast.error("Failed to create report");
        }
    };

    const handleUpdateReport = async (data: any) => {
        try {
            const dataSourceFields = DATA_SOURCES[data.dataSource] || [];
            const mappedColumns = (data.selectedColumnIds || []).map((id: string) => {
                const field = dataSourceFields.find(f => f.id === id);
                return field ? field.label : id;
            });

            const mappedFilters = (data.filters || []).reduce((acc: any, filter: any) => {
                acc[filter.fieldId] = filter.value;
                return acc;
            }, {});

            await updateReport({
                id: editingReport.id,
                name: data.name,
                description: data.description,
                dataSource: data.dataSource,
                columns: mappedColumns,
                filters: mappedFilters,
                scheduleEnabled: data.enableSchedule,
                scheduleType: data.frequency?.toLowerCase(),
                emailRecipients: data.emailRecipients ? [data.emailRecipients] : [],
                outputFormat: data.outputFormat?.toUpperCase() || "EXCEL",
                emailSubject: data.emailSubject
            }).unwrap();
            setIsEditOpen(false);
            toast.success("Report updated successfully");
        } catch (error) {
            toast.error("Failed to update report");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteReport(id).unwrap();
            setIsDeleteOpen(false);
            toast.success("Report deleted successfully");
        } catch (error) {
            toast.error("Failed to delete report");
        }
    };

    const handleDeleteHistory = async (id: string) => {
        try {
            await deleteHistory(id).unwrap();
            setIsHistoryDeleteOpen(false);
            toast.success("History record deleted successfully");
        } catch (error) {
            toast.error("Failed to delete history");
        }
    };

    const handlePreview = (run: any) => {
        setPreviewData({
            title: run.name,
            description: "Detailed report view for " + run.name,
            dataSource: "Device Data", // This could be more dynamic if available
            columns: 5,
            rows: 18,
            data: Array(18).fill(null).map((_, i) => ({
                id: `DEV-${1000 + i}`,
                name: `Device ${i + 1}`,
                status: "Active",
                location: "New York",
                lastSync: "1 hours ago"
            }))
        });
        setIsPreviewOpen(true);
    };

    return (
        <div className="min-h-screen">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
            <Link href="/admin/dashboard">
                <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Reports & Analytics</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-bgBlue dark:text-blue-400 font-medium">Financial Report</span>
          </div> 

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Report Hub</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create, manage, and schedule custom reports across all data sources
                    </p>
                </div>
                <Button
                    onClick={() => setIsFormOpen(true)}
                    className="border border-bgBlue text-bgBlue rounded-xl h-11 px-6 shadow-customShadow hover:bg-bgBlue hover:text-white"
                >
                    <Plus className="w-5 h-5" />
                    Create New Report
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                                <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{stat.subtext}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-navbarBg p-1.5 rounded-full flex w-fit mb-8 border border-border">
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-8 py-2.5 mr-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === 'saved'
                        ? 'text-bgBlue shadow-customShadow border border-border'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Saved Reports
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-8 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === 'history'
                        ? 'text-bgBlue shadow-customShadow border border-border'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    Run History
                </button>
            </div>

            {/* Main Content Area */}
            <div className="border border-border rounded-2xl overflow-hidden bg-navbarBg shadow-sm">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, creator..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-10 h-11 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-bgBlue"
                        />
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <Select value={selectedDataSource} onValueChange={(v) => { setSelectedDataSource(v); setCurrentPage(1); }}>
                            <SelectTrigger className="h-11 rounded-xl bg-navbarBg border border-border text-gray-600 dark:text-gray-400 gap-2 px-4 shadow-none min-w-[160px]">
                                <SelectValue placeholder="All Data Sources" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-navbarBg border border-border">
                                <SelectItem value="All Data Sources">All Data Sources</SelectItem>
                                <SelectItem value="Device Data">Device Data</SelectItem>
                                <SelectItem value="Financial Data">Financial Data</SelectItem>
                                <SelectItem value="User Activity">User Activity</SelectItem>
                                <SelectItem value="Subscription & Billing">Subscription & Billing</SelectItem>
                                <SelectItem value="Customer Service & Support">Customer Service & Support</SelectItem>
                                <SelectItem value="Content & Program">Content & Program</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedCreator} onValueChange={(v) => { setSelectedCreator(v); setCurrentPage(1); }}>
                            <SelectTrigger className="h-11 rounded-xl bg-navbarBg border border-border text-gray-600 dark:text-gray-400 gap-2 px-4 shadow-none min-w-[140px]">
                                <SelectValue placeholder="All Creators" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-navbarBg border border-border">
                                <SelectItem value="All Creators">All Creators</SelectItem>
                                <SelectItem value="Sarah Wilson">Sarah Wilson</SelectItem>
                                <SelectItem value="John Doe">John Doe</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={selectedSchedule} onValueChange={(v) => { setSelectedSchedule(v); setCurrentPage(1); }}>
                            <SelectTrigger className="h-11 rounded-xl bg-navbarBg border border-border text-gray-600 dark:text-gray-400 gap-2 px-4 shadow-none min-w-[140px]">
                                <SelectValue placeholder="All Schedules" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-navbarBg border border-border">
                                <SelectItem value="All Schedules">All Schedules</SelectItem>
                                <SelectItem value="Daily">Daily</SelectItem>
                                <SelectItem value="Weekly">Weekly</SelectItem>
                                <SelectItem value="Monthly">Monthly</SelectItem>
                                <SelectItem value="Not Scheduled">Not Scheduled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F1FBFF] dark:bg-blue-900/20">
                            {activeTab === 'saved' ? (
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 w-1/4">
                                        Report Name <ChevronDown className="w-3 h-3 inline-block ml-1" />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Data Source</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Created By</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Created Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        Schedule <AlertCircle className="w-3 h-3 inline-block ml-1 opacity-50" />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Last Run</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 w-1/4">
                                        Report Name <ChevronDown className="w-3 h-3 inline-block ml-1" />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Run Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Triggered By</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        Status <AlertCircle className="w-3 h-3 inline-block ml-1 opacity-50" />
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Recipients</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center w-10">Delete</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {activeTab === 'saved' ? (
                                savedReports.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{report.name}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded-full border border-gray-100 dark:border-gray-700">
                                                {report.dataSource}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">{report.user?.full_name}</div>
                                                <div className="text-[10px] text-gray-400 dark:text-gray-500">{report.user?.account?.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                {report.scheduleEnabled ? report.scheduleType : 'Not Scheduled'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">
                                            {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                            <MoreHorizontal className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl w-40 bg-navbarBg border border-border text-gray-600 dark:text-gray-400">
                                                        <DropdownMenuItem 
                                                            onClick={() => { 
                                                                const dataSourceFields = DATA_SOURCES[report.dataSource] || [];
                                                                const selectedColumnIds = (report.columns || []).map((label: string) => {
                                                                    const field = dataSourceFields.find(f => f.label === label);
                                                                    return field ? field.id : label;
                                                                });
                                                                
                                                                const apiFilters = report.filters || {};
                                                                const mappedFilters = Object.entries(apiFilters).map(([fieldId, value]) => {
                                                                    const field = dataSourceFields.find(f => f.id === fieldId);
                                                                    const operator = field?.type === 'option' ? 'is' : 'eq';
                                                                    return { fieldId, operator, value: String(value) };
                                                                });

                                                                setEditingReport({
                                                                    ...report,
                                                                    selectedColumnIds,
                                                                    filters: mappedFilters,
                                                                    enableSchedule: report.scheduleEnabled,
                                                                    frequency: report.scheduleType ? (report.scheduleType.charAt(0).toUpperCase() + report.scheduleType.slice(1)) : 'Weekly',
                                                                    emailRecipients: report.emailRecipients?.join(', ') || ''
                                                                }); 
                                                                setIsEditOpen(true); 
                                                            }} 
                                                            className="cursor-pointer font-medium"
                                                        >
                                                            Edit Report
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => { setReportToDelete(report); setIsDeleteOpen(true); }} className="text-red-500 cursor-pointer font-medium">Delete Report</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <Button
                                                    variant="ghost"
                                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2 h-9 rounded-lg px-4"
                                                    onClick={() => handleRun(report)}
                                                >
                                                    <RefreshCcw className="w-4 h-4" />
                                                    Run
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                runHistory.map((run: any) => (
                                    <tr key={run.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{run.reportHub?.name}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400">{new Date(run.runDate).toLocaleString()}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded-full border border-gray-100 dark:border-gray-700">
                                                {run.triggeredBy}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "flex items-center gap-2 text-sm font-medium",
                                                run.status === 'Processing' ? 'text-blue-500 animate-pulse' :
                                                    run.status === 'Failed' ? 'text-red-500' :
                                                        'text-green-500'
                                            )}>
                                                {run.status === 'Processing' && <RefreshCcw className="w-4 h-4 animate-spin" />}
                                                {run.status === 'Failed' && <AlertCircle className="w-4 h-4" />}
                                                {run.status === 'Compiled' && <CheckCircle2 className="w-4 h-4" />}
                                                {run.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <Mail className="w-4 h-4 opacity-50" />
                                                {run.recipients?.join(', ') || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-9 px-4 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-none"
                                                    onClick={() => window.open(run.fileUrl, '_blank')}
                                                    disabled={!run.fileUrl}
                                                >
                                                    Download
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 gap-2 h-9 rounded-lg"
                                                    onClick={() => handlePreview(run)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Preview
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                onClick={() => {
                                                    setHistoryToDelete(run);
                                                    setIsHistoryDeleteOpen(true);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {savedReports.length === 0 && activeTab === 'saved' && (
                        <div className="p-12 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center gap-2">
                            <FileText className="w-12 h-12 opacity-10" />
                            <p>No reports found matching your criteria</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Showing {currentDataCount} of {totalDataCount} reports
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={cn("h-9 px-4 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-none", currentPage === 1 && "opacity-50 cursor-not-allowed")}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={cn("w-8 h-8 rounded-lg text-xs font-bold transition-all", currentPage === p ? "bg-blue-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={cn("h-9 px-4 rounded-xl border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-none", (currentPage === totalPages || totalPages === 0) && "opacity-50 cursor-not-allowed")}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Modal (Now triggered by 'Run') */}
            <ReportHubPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                reportData={previewData}
            />

            {/* Create Form Modal */}
            <ReportHubFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                mode="add"
                onSave={handleCreateReport}
            />

            {/* Edit Form Modal */}
            <ReportHubEditModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                reportData={editingReport}
                onUpdate={handleUpdateReport}
            />

            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => handleDelete(reportToDelete?.id)}
                itemName={reportToDelete?.name}
            />

            {/* Run History Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={isHistoryDeleteOpen}
                onClose={() => setIsHistoryDeleteOpen(false)}
                onConfirm={() => handleDeleteHistory(historyToDelete?.id)}
                itemName={historyToDelete?.name}
            />

            {/* Run Status Modal */}
            <Dialog open={runStatus !== 'idle'} onOpenChange={() => runStatus === 'success' && setRunStatus('idle')}>
                <DialogContent className="max-w-sm p-0 bg-white dark:bg-gray-900 border-none rounded-3xl overflow-hidden shadow-2xl focus:outline-none">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Report Run Status</DialogTitle>
                        <DialogDescription>Shows the progress or result of a report generation task.</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 text-center">
                        {runStatus === 'loading' ? (
                            <div className="space-y-6">
                                <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin mx-auto" />
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generating Report...</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we compile "{lastRunName}"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center border border-green-100 dark:border-green-800 mx-auto">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Report Created Successfully!</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">"{lastRunName}" has been added to your run history.</p>
                                </div>
                                <Button
                                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold"
                                    onClick={() => setRunStatus('idle')}
                                >
                                    Dismiss
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}