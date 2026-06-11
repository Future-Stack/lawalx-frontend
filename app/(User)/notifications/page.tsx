"use client";

import {
    useGetMyNotificationsQuery,
    useReadAllNotificationsMutation,
    useReadNotificationMutation,
    useSoftDeleteNotificationMutation
} from "@/redux/api/users/notificationApi";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import UserDashboardNavbar from "@/components/layout/UserDashboardNavbar";
import NotificationCard from "@/components/notifications/NotificationCard";
import { useNotificationClick } from "@/hooks/useNotificationClick";
import type { NotificationHistoryItem } from "@/types/notification";

export default function NotificationsPage() {
    const { data: notificationData, isLoading } = useGetMyNotificationsQuery();
    const [readAllNotifications] = useReadAllNotificationsMutation();
    const [readNotification] = useReadNotificationMutation();
    const [deleteNotification] = useSoftDeleteNotificationMutation();
    const { handleNotificationClick } = useNotificationClick();

    const allNotifications: NotificationHistoryItem[] = notificationData?.data || [];

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
                        <button
                            onClick={handleReadAll}
                            className="px-3 py-1.5 text-sm font-medium text-bgBlue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors cursor-pointer"
                        >
                            Mark all as read
                        </button>
                    </div>

                    <div className="space-y-2 p-3">
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
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
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
