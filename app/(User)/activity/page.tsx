/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity, Trash2, ArrowLeft, Eye, CircleCheckBigIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useGetAllActivitiesQuery, useDeleteActivityMutation, useDeleteAllActivityBulkSystemMutation } from "@/redux/api/users/dashboard/activityApi";
import UserDashboardNavbar from "@/components/layout/UserDashboardNavbar";
import ActivityDetailsModal from "@/components/dashboard/ActivityDetailsModal";
import CommonLoader from "@/common/CommonLoader";

export default function ActivityPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { data: activityData, isLoading } = useGetAllActivitiesQuery({ page: currentPage, limit: itemsPerPage });
    const [deleteActivity] = useDeleteActivityMutation();
    const [deleteAllActivityBulk, { isLoading: isDeletingBulk }] = useDeleteAllActivityBulkSystemMutation();

    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);

    const activities = activityData?.data || [];

    // Sort activities by date (newest first)
    const sortedActivities = [...activities].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalPages = activityData?.meta?.totalPages || 1;

    // Adjust page if items are deleted and current page is out of bounds
    useEffect(() => {
        if (currentPage > 1 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const handleDelete = async (id: string) => {
        try {
            await deleteActivity(id).unwrap();
            toast.success("Activity deleted successfully");
        } catch (error) {
            toast.error("Failed to delete activity");
            console.error("Delete error:", error);
        }
    };

    const handleCardClick = (activity: any) => {
        setSelectedActivity(activity);
        setIsDetailsOpen(true);
    };

    const paginatedActivities = sortedActivities;

    const toggleActivitySelection = (id: string) => {
        setSelectedActivityIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const allPageSelected = useMemo(() => {
        if (paginatedActivities.length === 0) return false;
        return paginatedActivities.every((act) => selectedActivityIds.includes(act.id));
    }, [paginatedActivities, selectedActivityIds]);

    const handleSelectAll = () => {
        const pageIds = paginatedActivities.map((act) => act.id);
        if (pageIds.length === 0) return;

        if (allPageSelected) {
            setSelectedActivityIds((prev) => prev.filter((id) => !pageIds.includes(id)));
        } else {
            setSelectedActivityIds((prev) => {
                const next = new Set([...prev, ...pageIds]);
                return Array.from(next);
            });
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedActivityIds.length === 0) return;
        try {
            await deleteAllActivityBulk({ ids: selectedActivityIds }).unwrap();
            toast.success("Selected activities deleted successfully");
            setSelectedActivityIds([]);
        } catch (error) {
            toast.error("Failed to delete selected activities");
            console.error("Delete selected error:", error);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <UserDashboardNavbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-navbarBg rounded-[20px] shadow-sm border border-border overflow-hidden">
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4 bg-navbarBg">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
                                <ArrowLeft className="w-5 h-5 text-headings" />
                            </Link>
                            <h1 className="text-xl font-bold text-headings cursor-default">Activity Log</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedActivityIds.length > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={isDeletingBulk}
                                    className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    title={`Delete Selected (${selectedActivityIds.length})`}
                                >
                                    {isDeletingBulk ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                            {paginatedActivities.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-bgBlue dark:hover:text-bgBlue transition-colors cursor-pointer select-none"
                                >
                                    <div
                                        className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                            allPageSelected
                                                ? "bg-bgBlue border-bgBlue text-white"
                                                : "border-gray-300 dark:border-gray-600 hover:border-bgBlue"
                                        }`}
                                    >
                                        {allPageSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                                    </div>
                                    <span>Select All</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="px-6 py-10">
                                <CommonLoader size={36} text="Loading activities..." />
                            </div>
                        ) : paginatedActivities.length === 0 ? (
                            <div className="p-12 text-center text-muted cursor-default">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-650" />
                                <p>No activities found</p>
                            </div>
                        ) : (
                            paginatedActivities.map((activity: any) => (
                                <div
                                    key={activity.id}
                                    onClick={() => handleCardClick(activity)}
                                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-navbarBg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all duration-200 group cursor-pointer border border-border hover:border-bgBlue"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleActivitySelection(activity.id);
                                            }}
                                            className="h-10 w-10 flex items-center justify-center flex-shrink-0 cursor-pointer group/chk"
                                        >
                                            <div
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                    selectedActivityIds.includes(activity.id)
                                                        ? "bg-bgBlue border-bgBlue text-white"
                                                        : "border-gray-300 dark:border-gray-600 group-hover/chk:border-bgBlue"
                                                }`}
                                            >
                                                {selectedActivityIds.includes(activity.id) && (
                                                    <CircleCheckBigIcon className="w-3.5 h-3.5" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-headings mb-1 cursor-pointer">
                                                {activity.actionType}
                                            </h3>
                                            <p className="text-sm text-body leading-relaxed cursor-pointer break-words">
                                                {activity.description}
                                            </p>
                                            <span className="text-xs text-muted mt-2 block cursor-default">
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action buttons flexed on the right and center-aligned */}
                                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center ml-14 sm:ml-0" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleCardClick(activity)}
                                            className="p-2 text-gray-500 hover:text-bgBlue dark:text-gray-400 dark:hover:text-blue-400 rounded-lg bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                            title="View Details"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        {/* <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                                            title="Delete Activity"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-navbarBg">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-body bg-navbarBg border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow transition-colors cursor-pointer"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                {getPageNumbers().map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span
                                                key={`ellipsis-${index}`}
                                                className="w-9 h-9 flex items-center justify-center text-muted select-none cursor-default"
                                            >
                                                ...
                                            </span>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(Number(page))}
                                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-customShadow ${
                                                currentPage === page
                                                    ? "bg-bgBlue text-white border border-bgBlue"
                                                    : "bg-navbarBg text-body border border-border hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-body bg-navbarBg border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow transition-colors cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ActivityDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedActivity(null);
                }}
                activity={selectedActivity}
            />
        </div>
    );
}

