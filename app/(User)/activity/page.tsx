/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity, Trash2, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useGetAllActivitiesQuery, useDeleteActivityMutation } from "@/redux/api/users/dashboard/activityApi";
import UserDashboardNavbar from "@/components/layout/UserDashboardNavbar";
import ActivityDetailsModal from "@/components/dashboard/ActivityDetailsModal";

export default function ActivityPage() {
    const { data: activityData, isLoading } = useGetAllActivitiesQuery();
    const [deleteActivity] = useDeleteActivityMutation();

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const itemsPerPage = 10;

    const activities = activityData?.data || [];

    // Sort activities by date (newest first)
    const sortedActivities = [...activities].sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

    // Adjust page if items are deleted and current page is out of bounds
    useEffect(() => {
        if (currentPage > 1 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [sortedActivities.length, totalPages, currentPage]);

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

    const paginatedActivities = sortedActivities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                    <div className="px-6 py-5 border-b border-border flex items-center gap-4 bg-navbarBg">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
                            <ArrowLeft className="w-5 h-5 text-headings" />
                        </Link>
                        <h1 className="text-xl font-bold text-headings cursor-default">Activity Log</h1>
                    </div>

                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted cursor-default">Loading activities...</div>
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
                                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-navbarBg hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors group cursor-pointer border-border"
                                >
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex-shrink-0 cursor-default">
                                            <Activity className="w-5 h-5" />
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
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 rounded-lg bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                                            title="Delete Activity"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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

