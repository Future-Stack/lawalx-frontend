"use client";

import { useGetNotificationPermissionQuery, useUpdateNotificationPermissionMutation } from "@/redux/api/users/notificationPermisstionApi";
import { toast } from "sonner";

export default function Notifications() {
    const { data: permissionData, isLoading } = useGetNotificationPermissionQuery();
    const [updatePermission] = useUpdateNotificationPermissionMutation();

    const permissions = permissionData?.data || {};

    const handleToggle = async (field: string, currentValue: boolean) => {
        try {
            console.log(`Updating ${field} to ${!currentValue}`);
            const result = await updatePermission({ [field]: !currentValue }).unwrap();
            console.log("Update success:", result);
            toast.success("Notification updated successfully");
        } catch (error: any) {
            console.error("Failed to update notification:", error);
            const errorMessage = error?.data?.message || error?.message || "Failed to update notification";
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
                            onClick={() => handleToggle('email', !!permissions.email)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.email ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.email ? 'translate-x-6' : 'translate-x-1'}`} />
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
                            onClick={() => handleToggle('deviceAlerts', !!permissions.deviceAlerts)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.deviceAlerts ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.deviceAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Video Upload Complete */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Video Upload Complete</h3>
                            <p className="text-xs text-muted">Get notified when video uploads are completed</p>
                        </div>
                        <button
                            onClick={() => handleToggle('videoUpload', !!permissions.videoUpload)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.videoUpload ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.videoUpload ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Schedule Updates */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Schedule Updates</h3>
                            <p className="text-xs text-muted">Receive notifications about schedule changes</p>
                        </div>
                        <button
                            onClick={() => handleToggle('scheduleUpdates', !!permissions.scheduleUpdates)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.scheduleUpdates ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.scheduleUpdates ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* System Alerts */}
                    <div className="flex items-center justify-between pb-6 border-b border-border">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">System Alerts</h3>
                            <p className="text-xs text-muted">Receive general system-wide alerts</p>
                        </div>
                        <button
                            onClick={() => handleToggle('systemAlerts', !!permissions.systemAlerts)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.systemAlerts ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.systemAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Promotions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-headings mb-1">Promotions</h3>
                            <p className="text-xs text-muted">Receive marketing and promotional notifications</p>
                        </div>
                        <button
                            onClick={() => handleToggle('promotions', !!permissions.promotions)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${permissions.promotions ? 'bg-bgBlue' : 'bg-gray-200'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${permissions.promotions ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}