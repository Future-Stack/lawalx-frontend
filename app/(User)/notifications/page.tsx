"use client";

import { useState, useMemo } from "react";
import {
    useGetMyNotificationsQuery,
    useReadAllNotificationsMutation,
    useReadNotificationMutation,
    useSoftDeleteNotificationMutation,
    useDeleteNotificationBulkSystemMutation,
} from "@/redux/api/users/notificationApi";
import { Bell, Trash2, CircleCheckBigIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import UserDashboardNavbar from "@/components/layout/UserDashboardNavbar";
import NotificationCard from "@/components/notifications/NotificationCard";
import CommonLoader from "@/common/CommonLoader";
import { useNotificationClick } from "@/hooks/useNotificationClick";
import type { NotificationHistoryItem } from "@/types/notification";

export default function NotificationsPage() {
    const { data: notificationData, isLoading } = useGetMyNotificationsQuery();
    const [readAllNotifications] = useReadAllNotificationsMutation();
    const [readNotification] = useReadNotificationMutation();
    const [deleteNotification] = useSoftDeleteNotificationMutation();
    const [deleteNotificationBulk, { isLoading: isDeleting }] = useDeleteNotificationBulkSystemMutation();
    const { handleNotificationClick } = useNotificationClick();

    const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);

    const allNotifications: NotificationHistoryItem[] = notificationData?.data || [];

    const allPageSelected = useMemo(() => {
        if (allNotifications.length === 0) return false;
        return allNotifications.every((item) => selectedNotificationIds.includes(item.notificationId));
    }, [allNotifications, selectedNotificationIds]);

    const handleSelectAll = () => {
        const itemIds = allNotifications.map((item) => item.notificationId);
        if (itemIds.length === 0) return;

        if (allPageSelected) {
            setSelectedNotificationIds((prev) => prev.filter((id) => !itemIds.includes(id)));
        } else {
            setSelectedNotificationIds((prev) => {
                const next = new Set([...prev, ...itemIds]);
                return Array.from(next);
            });
        }
    };

    const toggleNotificationSelection = (id: string) => {
        setSelectedNotificationIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleDeleteSelected = async () => {
        if (selectedNotificationIds.length === 0) return;
        try {
            await deleteNotificationBulk({ ids: selectedNotificationIds }).unwrap();
            toast.success("Selected notifications deleted successfully");
            setSelectedNotificationIds([]);
        } catch (error) {
            toast.error("Failed to delete selected notifications");
            console.error("Delete selected error:", error);
        }
    };

    const handleReadAll = async () => {
        try {
            await readAllNotifications().unwrap();
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to mark all as read");
        }
    };

    const handleRead = async (id: string) => {
        try {
            await readNotification(id).unwrap();
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id).unwrap();
            toast.success("Notification deleted");
        } catch {
            toast.error("Failed to delete notification");
        }
    };

    return (
        <div className="min-h-screen bg-White">
            <UserDashboardNavbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-navbarBg rounded-xl shadow-sm border border-border">
                    <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Notifications</h1>
                        <div className="flex items-center gap-4">
                            {selectedNotificationIds.length > 0 && (
                                <button
                                    onClick={handleDeleteSelected}
                                    disabled={isDeleting}
                                    className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                    title={`Delete Selected (${selectedNotificationIds.length})`}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            )}
                            {allNotifications.length > 0 && (
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
                            <button
                                onClick={handleReadAll}
                                className="px-3 py-1.5 text-sm font-medium text-bgBlue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 p-3">
                        {isLoading ? (
                            <div className="px-6 py-10">
                                <CommonLoader size={36} text="Loading notifications..." />
                            </div>
                        ) : allNotifications.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            allNotifications.map((item) => (
                                <NotificationCard
                                    key={item.notificationId}
                                    item={item}
                                    onClick={handleNotificationClick}
                                    onMarkRead={handleRead}
                                    onDelete={handleDelete}
                                    variant="user"
                                    isSelected={selectedNotificationIds.includes(item.notificationId)}
                                    onToggleSelect={(id, e) => toggleNotificationSelection(id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
