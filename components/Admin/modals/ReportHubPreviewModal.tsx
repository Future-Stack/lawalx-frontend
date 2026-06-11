'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useGetReportPreviewQuery } from '@/redux/api/admin/reportHubApi';
import DeviceLocation from '@/components/common/DeviceLocation';

interface ReportHubPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    historyItem?: {
        id: string;
        reportName: string;
        fileUrl?: string | null;
    } | null;
}

export default function ReportHubPreviewModal({
    isOpen,
    onClose,
    historyItem,
}: ReportHubPreviewModalProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Reset page to 1 whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPage(1);
        }
    }, [isOpen]);

    // Fetch preview data from API
    const { data: previewResponse, isLoading, isFetching } = useGetReportPreviewQuery(
        { id: historyItem?.id || '', page: currentPage, limit: itemsPerPage },
        { skip: !isOpen || !historyItem?.id }
    );

    if (!isOpen || !historyItem) return null;

    const previewData: Record<string, any>[] = previewResponse?.data || [];
    const meta = previewResponse?.meta || { total: 0, page: 1, limit: itemsPerPage, totalPages: 0 };
    const totalPages = meta.totalPages || 0;

    // Dynamically extract column names from the first data item
    const columns: string[] = previewData.length > 0 ? Object.keys(previewData[0]) : [];

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getPaginationRange = () => {
        const delta = 1;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-white dark:bg-gray-900 border-none rounded-2xl overflow-hidden shadow-2xl focus:outline-none flex flex-col">
                <div className="p-6 overflow-y-auto flex-1 min-h-0">
                    <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                {historyItem.reportName}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                                Preview data for this report run
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Summary Box */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 flex items-center justify-between border border-gray-100 dark:border-gray-800">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Columns:</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{columns.length}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Total Rows:</p>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{meta.total}</p>
                            </div>
                        </div>
                        {/* {historyItem.fileUrl && (
                            <Button
                                className="bg-bgBlue hover:bg-bgBlue/80 text-white rounded-xl px-6 flex items-center gap-2 shadow-customShadow"
                                onClick={() => window.open(historyItem.fileUrl!, '_blank')}
                            >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                            </Button>
                        )} */}
                    </div>

                    {/* Table */}
                    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden mb-6 bg-white dark:bg-gray-900">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Loading preview...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#F1FBFF] dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-800">
                                        <tr>
                                            {columns.map((col) => (
                                                <th
                                                    key={col}
                                                    className="px-4 py-3 text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {previewData.map((item, rowIndex) => (
                                            <tr key={rowIndex} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                {columns.map((col, colIndex) => (
                                                    <td
                                                        key={col}
                                                        className={cn(
                                                            "px-4 py-4 text-sm whitespace-nowrap",
                                                            colIndex === 0
                                                                ? "font-bold text-gray-900 dark:text-gray-100"
                                                                : "text-gray-600 dark:text-gray-400"
                                                        )}
                                                    >
                                                        {col.toLowerCase() === 'location' && item[col] ? (() => {
                                                            let lat = NaN;
                                                            let lng = NaN;
                                                            let originalValue = String(item[col]);
                                                            
                                                            // Handle string formats
                                                            if (typeof item[col] === 'string') {
                                                                try {
                                                                    // Try JSON format like '{"lat":40.7128,"lng":-74.006}'
                                                                    const loc = JSON.parse(item[col]);
                                                                    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                                                                        lat = loc.lat;
                                                                        lng = loc.lng;
                                                                    }
                                                                } catch (e) {
                                                                    // Try comma-separated format like '40.7128,-74.006'
                                                                    if (item[col].includes(',')) {
                                                                        const parts = item[col].split(',');
                                                                        lat = parseFloat(parts[0]);
                                                                        lng = parseFloat(parts[1]);
                                                                    }
                                                                }
                                                            } else if (typeof item[col] === 'object') {
                                                                // Handle object format like { lat: 40.7128, lng: -74.006 }
                                                                originalValue = JSON.stringify(item[col]);
                                                                if (item[col] && typeof item[col].lat === 'number' && typeof item[col].lng === 'number') {
                                                                    lat = item[col].lat;
                                                                    lng = item[col].lng;
                                                                }
                                                            }

                                                            if (!isNaN(lat) && !isNaN(lng)) {
                                                                return <DeviceLocation lat={lat} lng={lng} />;
                                                            }
                                                            return originalValue;
                                                        })() : (
                                                            item[col] != null ? (typeof item[col] === 'object' ? JSON.stringify(item[col]) : String(item[col])) : '—'
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {previewData.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={columns.length || 1} className="px-4 py-8 text-center text-gray-400">
                                                    No data available for this report
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, meta.total)} of {meta.total} results
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-50/10 dark:hover:text-blue-500 dark:text-gray-300 font-bold shadow-customShadow disabled:opacity-30 transition-all hover:bg-gray-50 bg-white dark:bg-gray-900"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isFetching}
                                >
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1.5 mx-1">
                                    {getPaginationRange().map((p, idx) => (
                                        p === '...' ? (
                                            <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400 font-bold">
                                                ...
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setCurrentPage(Number(p))}
                                                disabled={isFetching}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                                                    currentPage === p
                                                        ? "bg-blue-500 text-white shadow-customShadow shadow-blue-500/20"
                                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        )
                                    ))}
                                </div>
                                <Button
                                    size="sm"
                                    className="h-9 px-4 rounded-xl text-gray-700 dark:text-gray-300 font-bold shadow-customShadow disabled:opacity-30 transition-all hover:bg-gray-50 bg-white dark:bg-gray-900"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalPages === 0 || isFetching}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50/30 text-gray-600 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <Button className="rounded-xl px-8 font-bold h-11 border border-border text-gray-600 dark:text-gray-400 shadow-customShadow" onClick={onClose}>
                        Close Preview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
