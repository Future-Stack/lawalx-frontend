"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
    useGetMyNotificationsQuery,
    useReadAllNotificationsMutation,
    useReadNotificationMutation,
    useSoftDeleteNotificationMutation
} from "@/redux/api/users/notificationApi";
import { User, Monitor, Settings as SettingsIcon, Bell, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
    const { data: notificationData, isLoading, isError } = useGetMyNotificationsQuery();
    const [readAllNotifications] = useReadAllNotificationsMutation();
    const [readNotification] = useReadNotificationMutation();
    const [deleteNotification] = useSoftDeleteNotificationMutation();

    const allNotifications = notificationData?.data || [];

    const handleReadAll = async () => {
        try {
            await readAllNotifications().unwrap();
            toast.success("All notifications marked as read");
        } catch (error) {
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
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "USER": return User;
            case "DEVICE": return Monitor;
            case "SYSTEM": return SettingsIcon;
            default: return Bell;
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
                    <div className="flex gap-2">
                        <button
                            onClick={handleReadAll}
                            className="px-4 py-2 text-sm font-semibold text-bgBlue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                        >
                            Mark all as read
                        </button>
                    </div>
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
                            <p className="text-sm">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        allNotifications.map((item: any) => {
                            const Icon = getNotificationIcon(item.notification.actorType);
                            return (
                                <div
                                    key={item.notificationId}
                                    onClick={() => !item.isRead && handleRead(item.notificationId)}
                                    className={`p-5 rounded-2xl flex gap-5 transition-all duration-300 cursor-pointer group border ${!item.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 'bg-transparent border-transparent hover:border-border hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}
                                >
                                    <div className={`h-12 w-12 flex items-center justify-center rounded-full border shadow-sm flex-shrink-0 transition-transform group-hover:scale-110 ${!item.isRead ? 'border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 text-muted bg-navbarBg'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className={`text-md font-bold mb-1 tracking-tight ${!item.isRead ? 'text-headings' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {item.notification.title}
                                                </h3>
                                                <p className={`text-sm leading-relaxed mb-3 ${!item.isRead ? 'text-body font-medium' : 'text-muted'}`}>
                                                    {item.notification.body}
                                                </p>
                                            </div>
                                            {!item.isRead && (
                                                <span className="w-2.5 h-2.5 bg-bgBlue rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                                {formatDistanceToNow(new Date(item.notification.createdAt), { addSuffix: true })}
                                            </span>

                                            <div className="flex items-center gap-2">
                                                {!item.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRead(item.notificationId);
                                                        }}
                                                        className="p-2 text-muted hover:text-bgBlue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(item.notificationId, e)}
                                                    className="p-2 text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
