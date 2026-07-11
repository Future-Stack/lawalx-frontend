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
    useUpdateReportMutation,
    useLazyDownloadReportDataQuery
} from '@/redux/api/admin/reportHubApi';
import { toast } from 'sonner';
import { DATA_SOURCES } from '@/constants/reportHubConstants';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { addPdfHeader } from '@/lib/pdfUtils';
import { fetchAddressFromCoordinates, delay } from '@/lib/geocodeUtils';

/**
 * Converts local "HH:mm" time string to UTC "HH:mm" time string.
 */
function convertLocalTimeToUTC(localTime: string): string {
    if (!localTime) return "";
    const [hours, minutes] = localTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return localTime;
    
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    const utcHours = String(date.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${utcHours}:${utcMinutes}`;
}

/**
 * Converts UTC "HH:mm" time string to local "HH:mm" time string.
 */
function convertUTCToLocalTime(utcTime: string): string {
    if (!utcTime) return "";
    const [hours, minutes] = utcTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return utcTime;
    
    const date = new Date();
    date.setUTCHours(hours);
    date.setUTCMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    const localHours = String(date.getHours()).padStart(2, '0');
    const localMinutes = String(date.getMinutes()).padStart(2, '0');
    return `${localHours}:${localMinutes}`;
}

/**
 * Formats "HH:mm" time string to 12-hour AM/PM format.
 */
function formatTime12h(time24: string): string {
    if (!time24) return "";
    const [h, m] = time24.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return time24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${String(displayHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function ReportHub() {
    const [activeTab, setActiveTab] = useState<'saved' | 'history'>('saved');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewHistoryItem, setPreviewHistoryItem] = useState<{ id: string; reportName: string; fileUrl?: string | null } | null>(null);

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

    // Run History specific Search & Filter State
    const [historySearchQuery, setHistorySearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [selectedTriggerer, setSelectedTriggerer] = useState('All Triggered By');

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

    // History Query (only pass page/limit for pagination, filtering is client-side)
    const { data: historyData, isLoading: isHistoryLoading } = useGetReportHistoryQuery({
        page: currentPage,
        limit: itemsPerPage
    });

    // Mutations
    const [createReport] = useCreateReportMutation();
    const [updateReport] = useUpdateReportMutation();
    const [deleteReport] = useDeleteReportMutation();
    const [runReport] = useRunReportMutation();
    const [deleteHistory] = useDeleteReportHistoryMutation();
    const [triggerDownload] = useLazyDownloadReportDataQuery();

    const savedReports = reportsData?.data || [];
    const runHistory = historyData?.data || [];

    const uniqueTriggerers = useMemo(() => {
        if (!runHistory) return [];
        const triggerers = runHistory.map((run: any) => run.triggeredBy).filter(Boolean);
        return Array.from(new Set(triggerers)) as string[];
    }, [runHistory]);

    const filteredRunHistory = useMemo(() => {
        if (!runHistory) return [];
        return runHistory.filter((run: any) => {
            // Search by Report Name and Recipients
            if (historySearchQuery) {
                const searchLower = historySearchQuery.toLowerCase();
                const reportName = run.reportHub?.name?.toLowerCase() || '';
                const recipients = run.recipients?.join(', ').toLowerCase() || '';
                if (!reportName.includes(searchLower) && !recipients.includes(searchLower)) {
                    return false;
                }
            }
            // Filter by Status
            if (selectedStatus !== 'All Statuses') {
                if (selectedStatus === 'PENDING') {
                    if (run.status !== 'PROCESSING' && run.status !== 'PENDING') {
                        return false;
                    }
                } else if (run.status !== selectedStatus) {
                    return false;
                }
            }
            // Filter by Triggered By
            if (selectedTriggerer !== 'All Triggered By') {
                if (run.triggeredBy !== selectedTriggerer) {
                    return false;
                }
            }
            return true;
        });
    }, [runHistory, historySearchQuery, selectedStatus, selectedTriggerer]);

    // Pagination logic
    const reportsTotalPages = reportsData?.meta?.totalPages || 0;
    const historyTotalPages = historyData?.meta?.totalPages || 0;

    const totalPages = activeTab === 'saved' ? reportsTotalPages : historyTotalPages;
    const currentDataCount = activeTab === 'saved' ? savedReports.length : filteredRunHistory.length;
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

    const getFormDataToSend = (data: any) => {
        const dataSourceFields = DATA_SOURCES[data.dataSource] || [];
        const mappedColumns = (data.selectedColumnIds || []).map((id: string) => {
            const field = dataSourceFields.find(f => f.id === id);
            return field ? field.label : id;
        });

        const dayOfWeekMap: Record<string, string> = {
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat',
            'Sunday': 'Sun'
        };

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('description', data.description || "");
        formData.append('dataSource', data.dataSource);
        formData.append('columns', mappedColumns.join(','));
        formData.append('filters', ''); // Filters commented out
        formData.append('scheduleEnabled', String(data.enableSchedule));
        formData.append('scheduleType', data.frequency?.toLowerCase() || "");
        formData.append('emailRecipients', data.emailRecipients || "");
        formData.append('outputFormat', data.outputFormat?.toUpperCase() || "EXCEL");
        formData.append('emailSubject', data.emailSubject || `${data.name} Report`);
        formData.append('scheduleTime', convertLocalTimeToUTC(data.time || ""));
        formData.append('scheduleDayOfWeek', data.frequency === 'Weekly' ? (dayOfWeekMap[data.dayOfWeek] || "") : "");
        formData.append('scheduleDayOfMonth', data.frequency === 'Monthly' ? (data.dayOfMonth || "") : "");

        return formData;
    };

    const handleCreateReport = async (data: any) => {
        try {
            const formDataToSend = getFormDataToSend(data);
            await createReport(formDataToSend).unwrap();
            setIsFormOpen(false);
            toast.success("Report created successfully");
        } catch (error) {
            toast.error("Failed to create report");
        }
    };

    const handleUpdateReport = async (data: any) => {
        try {
            const formDataToSend = getFormDataToSend(data);
            await updateReport({
                id: editingReport.id,
                data: formDataToSend
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
        setPreviewHistoryItem({
            id: run.id,
            reportName: run.reportHub?.name || 'Report Preview',
            fileUrl: run.fileUrl,
        });
        setIsPreviewOpen(true);
    };

    const handleDownloadReport = async (run: any, format: 'PDF' | 'EXCEL') => {
        try {
            const loadingToast = toast.loading(`Preparing download data for "${run.reportHub?.name}"...`);
            const response = await triggerDownload(run.id).unwrap();
            toast.dismiss(loadingToast);

            const rawData = response?.data || [];
            if (rawData.length === 0) {
                toast.error("No data found for this report.");
                return;
            }

            // Clone data to avoid mutating RTK query cache
            const data = JSON.parse(JSON.stringify(rawData));

            // Perform geocoding if Location column exists
            const hasLocationColumn = data.some((item: any) => Object.keys(item).some(k => k.toLowerCase() === 'location'));
            if (hasLocationColumn) {
                let count = 0;
                let toastId: string | number | undefined;
                
                for (let i = 0; i < data.length; i++) {
                    for (const key of Object.keys(data[i])) {
                        if (key.toLowerCase() === 'location' && data[i][key]) {
                            let lat = NaN;
                            let lng = NaN;
                            let originalValue = String(data[i][key]);
                            
                            if (typeof data[i][key] === 'string') {
                                try {
                                    const loc = JSON.parse(data[i][key]);
                                    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                                        lat = loc.lat;
                                        lng = loc.lng;
                                    }
                                } catch (e) {
                                    if (data[i][key].includes(',')) {
                                        const parts = data[i][key].split(',');
                                        lat = parseFloat(parts[0]);
                                        lng = parseFloat(parts[1]);
                                    }
                                }
                            } else if (typeof data[i][key] === 'object') {
                                originalValue = JSON.stringify(data[i][key]);
                                if (typeof data[i][key].lat === 'number' && typeof data[i][key].lng === 'number') {
                                    lat = data[i][key].lat;
                                    lng = data[i][key].lng;
                                }
                            }
                            
                            if (!isNaN(lat) && !isNaN(lng)) {
                                if (count === 0 || count % 5 === 0) {
                                    toastId = toast.loading(`Geocoding location data (${count + 1}/${data.length})...`, { id: toastId });
                                }
                                const address = await fetchAddressFromCoordinates(lat, lng);
                                data[i][key] = address;
                                await delay(600); // Respect Nominatim rate limit
                                count++;
                            } else {
                                data[i][key] = originalValue;
                            }
                        }
                    }
                }
                if (toastId) toast.dismiss(toastId);
            }

            const reportName = run.reportHub?.name || 'Report';
            const formattedDate = new Date(run.runDate).toLocaleString();

            if (format === 'EXCEL') {
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");
                
                // Auto-fit column widths
                const maxLens = data.reduce((acc: any, row: any) => {
                    Object.keys(row).forEach(key => {
                        const valStr = row[key] ? String(row[key]) : '';
                        acc[key] = Math.max(acc[key] || key.length, valStr.length);
                    });
                    return acc;
                }, {});
                
                worksheet['!cols'] = Object.keys(maxLens).map(key => ({
                    wch: Math.min(Math.max(maxLens[key] + 3, 10), 50)
                }));

                XLSX.writeFile(workbook, `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
                toast.success("Excel downloaded successfully");
            } else if (format === 'PDF') {
                const doc = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                // Branded header identical to device-report
                const currentY = await addPdfHeader(
                    doc,
                    reportName,
                    `Triggered By: ${run.triggeredBy}  |  Generated: ${formattedDate}`
                );

                const columns = Object.keys(data[0]);
                const rows = data.map((item: any) => 
                    columns.map(col => item[col] != null ? String(item[col]) : '—')
                );

                autoTable(doc, {
                    startY: currentY,
                    head: [columns],
                    body: rows,
                    theme: 'striped',
                    headStyles: {
                        fillColor: [15, 90, 128], // #0F5A80
                        textColor: 255,
                        fontSize: 9,
                        fontStyle: 'bold',
                        halign: 'left'
                    },
                    bodyStyles: {
                        fontSize: 8,
                        textColor: [51, 51, 51]
                    },
                    alternateRowStyles: {
                        fillColor: [248, 249, 250]
                    },
                    margin: { top: 40, left: 14, right: 14, bottom: 20 },
                    didDrawPage: (dataDraw) => {
                        const str = `Page ${dataDraw.pageNumber} of ${doc.getNumberOfPages()}`;
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text(str, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
                        doc.text("Generated via Tape Report Hub", 14, doc.internal.pageSize.height - 10);
                    }
                });

                doc.save(`${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
                toast.success("PDF downloaded successfully");
            }
        } catch (error) {
            toast.error("Failed to generate report download file.");
            console.error(error);
        }
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
                    {activeTab === 'saved' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <div className="relative flex-1 max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by report name, recipients..."
                                    value={historySearchQuery}
                                    onChange={(e) => { setHistorySearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="pl-10 h-11 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-bgBlue"
                                />
                            </div>
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                                <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-11 rounded-xl bg-navbarBg border border-border text-gray-600 dark:text-gray-400 gap-2 px-4 shadow-none min-w-[140px]">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-navbarBg border border-border">
                                        <SelectItem value="All Statuses">All Statuses</SelectItem>
                                        <SelectItem value="COMPILED">Compiled</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="FAILED">Failed</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={selectedTriggerer} onValueChange={(v) => { setSelectedTriggerer(v); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-11 rounded-xl bg-navbarBg border border-border text-gray-600 dark:text-gray-400 gap-2 px-4 shadow-none min-w-[160px]">
                                        <SelectValue placeholder="All Triggered By" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl bg-navbarBg border border-border">
                                        <SelectItem value="All Triggered By">All Triggered By</SelectItem>
                                        {uniqueTriggerers.map(t => (
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto thin-gray-scrollbar">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-[#F1FBFF] dark:bg-blue-900/20">
                            {activeTab === 'saved' ? (
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 w-1/4 text-nowrap">
                                        Report Name
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Data Source</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Created By</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Created Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">
                                        Schedule
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Last Run</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-right text-nowrap">Actions</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 w-1/4 text-nowrap">
                                        Report Name
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Run Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Triggered By</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-nowrap">Recipients</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-right text-nowrap">Actions</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-400 text-center w-10 text-nowrap">Delete</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {activeTab === 'saved' ? (
                                savedReports.map((report: any) => (
                                    <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white text-nowrap">{report.name}</div>
                                        </td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <span className="px-2 text-nowrap text-xs py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium rounded-full border border-gray-100 dark:border-gray-700">
                                                {report.dataSource}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className="text-nowrap">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white text-nowrap">{report.user?.full_name}</div>
                                                <div className="text-[10px] text-gray-400 dark:text-gray-500 text-nowrap">{report.user?.account?.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400 text-nowrap">{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white text-nowrap">
                                                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                                                {report.scheduleEnabled ? (
                                                    <div className="text-nowrap">
                                                        <div className="text-sm font-bold text-gray-900 dark:text-white text-nowrap">
                                                            {report.scheduleType ? (report.scheduleType.charAt(0).toUpperCase() + report.scheduleType.slice(1)) : 'Scheduled'}
                                                        </div>
                                                        {(() => {
                                                            const localTime = report.scheduleTime ? formatTime12h(convertUTCToLocalTime(report.scheduleTime)) : '';
                                                            
                                                            let dayDetail = '';
                                                            if (report.scheduleType === 'weekly' && report.scheduleDayOfWeek) {
                                                                dayDetail = report.scheduleDayOfWeek;
                                                            } else if (report.scheduleType === 'monthly' && report.scheduleDayOfMonth) {
                                                                dayDetail = `Day ${report.scheduleDayOfMonth}`;
                                                            }
                                                            
                                                            const combined = [localTime, dayDetail].filter(Boolean).join(' • ');
                                                            
                                                            if (!combined) return null;
                                                            return (
                                                                <div className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mt-0.5 text-nowrap">
                                                                    {combined}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 dark:text-gray-400">Not Scheduled</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400 text-nowrap">
                                            {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-5 text-right text-nowrap">
                                            <div className="flex items-center justify-end gap-2 text-nowrap">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon-sm" className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200">
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
                                                                
                                                                const shortToLongDayMap: Record<string, string> = {
                                                                    'Mon': 'Monday',
                                                                    'Tue': 'Tuesday',
                                                                    'Wed': 'Wednesday',
                                                                    'Thu': 'Thursday',
                                                                    'Fri': 'Friday',
                                                                    'Sat': 'Saturday',
                                                                    'Sun': 'Sunday'
                                                                };

                                                                setEditingReport({
                                                                    ...report,
                                                                    selectedColumnIds,
                                                                    filters: [], // Filters commented out
                                                                    enableSchedule: report.scheduleEnabled,
                                                                    frequency: report.scheduleType ? (report.scheduleType.charAt(0).toUpperCase() + report.scheduleType.slice(1)) : 'Weekly',
                                                                    dayOfWeek: report.scheduleDayOfWeek ? (shortToLongDayMap[report.scheduleDayOfWeek] || report.scheduleDayOfWeek) : 'Monday',
                                                                    dayOfMonth: report.scheduleDayOfMonth ? String(report.scheduleDayOfMonth) : '1',
                                                                    time: report.scheduleTime ? convertUTCToLocalTime(report.scheduleTime) : '09:00',
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
                                filteredRunHistory.map((run: any) => (
                                    <tr key={run.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white text-nowrap">{run.reportHub?.name}</div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500 dark:text-gray-400 text-nowrap">{new Date(run.runDate).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-medium rounded-full border border-gray-100 dark:border-gray-700 text-nowrap">
                                                {run.triggeredBy}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className={cn(
                                                "flex items-center gap-2 text-sm font-medium text-nowrap",
                                                run.status === 'PROCESSING' ? 'text-blue-500 animate-pulse' :
                                                    run.status === 'FAILED' ? 'text-red-500' :
                                                        'text-green-500'
                                            )}>
                                                {run.status === 'PROCESSING' && <RefreshCcw className="w-4 h-4 animate-spin" />}
                                                {run.status === 'FAILED' && <AlertCircle className="w-4 h-4" />}
                                                {run.status === 'COMPILED' && <CheckCircle2 className="w-4 h-4" />}
                                                {run.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-nowrap">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 text-nowrap">
                                                <Mail className="w-4 h-4 opacity-50" />
                                                {run.recipients?.join(', ') || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right text-nowrap">
                                            <div className="flex items-center justify-end gap-3 text-nowrap">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-9 px-4 rounded-xl border-gray-200 cursor-pointer hover:bg-green-400 hover:text-white dark:hover:bg-green-600 dark:hover:text-white dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-none flex items-center gap-1.5"
                                                        >
                                                            <Download className="w-3.5 h-3.5" />
                                                            Download
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl w-36 bg-navbarBg border border-border text-gray-600 dark:text-gray-400">
                                                        <DropdownMenuItem 
                                                            className="cursor-pointer font-medium"
                                                            onClick={() => handleDownloadReport(run, 'PDF')}
                                                        >
                                                            As PDF
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="cursor-pointer font-medium"
                                                            onClick={() => handleDownloadReport(run, 'EXCEL')}
                                                        >
                                                            As Excel
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                                        <td className="px-6 py-5 text-center text-nowrap">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all text-nowrap"
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
                            className={cn("h-9 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-50/10 dark:hover:text-blue-500 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-none", currentPage === 1 && "opacity-50 cursor-not-allowed")}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center gap-1 mx-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={cn("w-8 h-8 cursor-pointer rounded-lg text-xs font-bold transition-all", currentPage === p ? "bg-blue-500 text-white" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700")}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <Button
                            variant="outline" size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={cn("h-9 px-4 rounded-xl hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-50/10 dark:hover:text-blue-500 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-none", (currentPage === totalPages || totalPages === 0) && "opacity-50 cursor-not-allowed")}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Preview Modal (Now triggered by 'Run') */}
            <ReportHubPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => { setIsPreviewOpen(false); setPreviewHistoryItem(null); }}
                historyItem={previewHistoryItem}
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