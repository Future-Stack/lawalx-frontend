"use client";

import {
    useGetMyNotificationsQuery,
    useReadAllNotificationsMutation,
    useReadNotificationMutation,
    useSoftDeleteNotificationMutation
} from "@/redux/api/users/notificationApi";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NotificationCard from "@/components/notifications/NotificationCard";
import { useNotificationClick } from "@/hooks/useNotificationClick";
import type { NotificationHistoryItem } from "@/types/notification";

export default function AdminNotificationsPage() {
    const { data: notificationData, isLoading, isError } = useGetMyNotificationsQuery();
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

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-red-500 gap-2">
                <Bell className="w-10 h-10 opacity-20" />
                <p className="font-medium">Failed to load notifications</p>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="bg-navbarBg rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h1 className="text-xl font-bold text-headings">All Notifications</h1>
                    <button
                        onClick={handleReadAll}
                        className="px-4 py-2 text-sm font-semibold text-bgBlue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                    >
                        Mark all as read
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                        </div>
                    ) : allNotifications.length === 0 ? (
                        <div className="py-20 text-center text-muted">
                            <Bell className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="text-lg font-medium">No notifications yet</p>
                            <p className="text-sm">We&apos;ll notify you when something important happens.</p>
                        </div>
                    ) : (
                        allNotifications.map((item) => (
                            <NotificationCard
                                key={item.notificationId}
                                item={item}
                                onClick={handleNotificationClick}
                                onMarkRead={handleRead}
                                onDelete={handleDelete}
                                variant="admin"
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
