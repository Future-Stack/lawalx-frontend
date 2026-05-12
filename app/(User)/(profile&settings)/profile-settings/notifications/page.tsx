/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetSettingsNotificationQuery, useUpdateSettingsNotificationMutation } from "@/redux/api/users/settings/settingsApi";
import { NotificationPreferences } from "@/redux/api/users/settings/settings.type";
import { toast } from "sonner";

export default function Notifications() {
    // 1. Fetch the user's notification settings from the server
    const { data: response, isLoading: isFetching } = useGetSettingsNotificationQuery(undefined);
    const [updateNotification, { isLoading: isUpdating }] = useUpdateSettingsNotificationMutation();
    const settings = (response?.data || {}) as Partial<NotificationPreferences>;
    const handleToggle = async (settingKey: string, currentStatus: boolean) => {
        try {
            const result = await updateNotification({ 
                [settingKey]: !currentStatus 
            }).unwrap();
            if (result.success) {
                toast.success(result.message || "Setting updated!");
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || "Something went wrong. Please try again.";
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-8 border border-border bg-[#FAFAFA] dark:bg-cardBg rounded-xl p-4 md:p-6">

            <div className="p-4">
                <h2 className="text-lg md:text-xl font-bold text-headings mb-6">Notification Preferences</h2>

                <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Email Notifications</h3>
                            <p className="text-xs text-muted">Receive email notifications for important events</p>
                        </div>
                        <button
                            onClick={() => handleToggle('email', !!settings.email)}
                            disabled={isFetching || isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.email ? 'bg-bgBlue' : 'bg-gray-200'} ${isFetching || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.email ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Push Notifications */}
                    {/* <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Push Notifications</h3>
                            <p className="text-xs text-muted">Receive push notifications on your device</p>
                        </div>
                        <button
                            onClick={() => handleToggle('push', !!permissions.push)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.push ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.push ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div> */}

                    {/* Device Alerts */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Device Alerts</h3>
                            <p className="text-xs text-muted">Get notified when devices go offline or have issues</p>
                        </div>
                        <button
                            onClick={() => handleToggle('deviceAlerts', !!settings.deviceAlerts)}
                            disabled={isFetching || isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.deviceAlerts ? 'bg-bgBlue' : 'bg-gray-200'} ${isFetching || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.deviceAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Video Upload Complete */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Video Upload Complete</h3>
                            <p className="text-xs text-muted">Get notified when video uploads are completed</p>
                        </div>
                        <button
                            onClick={() => handleToggle('videoUpload', !!settings.videoUpload)}
                            disabled={isFetching || isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.videoUpload ? 'bg-bgBlue' : 'bg-gray-200'} ${isFetching || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.videoUpload ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Schedule Updates */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Schedule Updates</h3>
                            <p className="text-xs text-muted">Receive notifications about schedule changes</p>
                        </div>
                        <button
                            onClick={() => handleToggle('scheduleUpdates', !!settings.scheduleUpdates)}
                            disabled={isFetching || isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.scheduleUpdates ? 'bg-bgBlue' : 'bg-gray-200'} ${isFetching || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.scheduleUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* System Alerts */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">System Alerts</h3>
                            <p className="text-xs text-muted">Receive general system-wide alerts</p>
                        </div>
                        <button
                            onClick={() => handleToggle('systemAlerts', !!settings.systemAlerts)}
                            disabled={isFetching || isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.systemAlerts ? 'bg-bgBlue' : 'bg-gray-200'} ${isFetching || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.systemAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Promotions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Promotions</h3>
                            <p className="text-xs text-muted">Receive marketing and promotional notifications</p>
                        </div>
                        <button
                            onClick={() => handleToggle('promotions', !!settings.promotions)}
                            disabled={isFetching || isUpdating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${settings.promotions ? 'bg-bgBlue' : 'bg-gray-200'} ${isFetching || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.promotions ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}