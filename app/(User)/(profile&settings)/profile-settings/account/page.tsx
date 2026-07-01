/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Loader2, Monitor, Clock, LogOut } from "lucide-react";
import { useState } from "react";
import { 
    useChangePasswordMutation, 
    useGetSettingsSessionsQuery,
    useDeleteSingleSessionMutation,
    useDeleteOtherSessionMutation
} from "@/redux/api/users/settings/settingsApi";
import { toast } from "sonner";
import { useAppDispatch } from "@/redux/store/hook";
import { logout } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";

export default function Account() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEndingSession, setIsEndingSession] = useState<string | null>(null);
    const [isEndingOthers, setIsEndingOthers] = useState(false);

    const [changePassword, { isLoading }] = useChangePasswordMutation();
    const { data: sessionData } = useGetSettingsSessionsQuery();
    const [deleteSingleSession] = useDeleteSingleSessionMutation();
    const [deleteOtherSession] = useDeleteOtherSessionMutation();

    const sessions = [...(sessionData?.data?.sessions || [])].sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return 0;
    });
    const notificationEmail = sessionData?.data?.notificationEmail;

    const handlePasswordChange = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        try {
            const res = await changePassword({ oldPassword, newPassword }).unwrap();
            if (res.success) {
                toast.success(res.message || "Password changed successfully. Please login again.");
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
                
                // Automatically logout and navigate to signin page
                setTimeout(() => {
                    dispatch(logout());
                    router.push("/signin");
                }, 1000);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to change password");
        }
    };

    const handleCancel = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleEndSession = async (sessionId: string, isCurrent: boolean) => {
        setIsEndingSession(sessionId);
        try {
            const res = await deleteSingleSession({ sessionId }).unwrap();
            if (res.success) {
                toast.success("Session ended successfully");
                if (isCurrent) {
                    setTimeout(() => {
                        dispatch(logout());
                        router.push("/signin");
                    }, 1000);
                }
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to end session");
        } finally {
            setIsEndingSession(null);
        }
    };

    const handleEndOtherSessions = async () => {
        setIsEndingOthers(true);
        try {
            const res = await deleteOtherSession().unwrap();
            if (res.success) {
                toast.success("All other sessions ended successfully");
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to end other sessions");
        } finally {
            setIsEndingOthers(false);
        }
    };

    return (
        <div className="space-y-8 border border-border bg-navbarBg  rounded-xl p-4 md:p-6">
            {/* Password Section */}
            <section>
                <h2 className="text-lg md:text-xl font-bold text-headings mb-6">Password</h2>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-48 text-sm font-medium text-body">Old Password</label>
                        <input
                            type="password"
                            placeholder="***********"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bgBlue/20"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-6 pb-6 border-b border-border">
                        <label className="w-48 text-sm font-medium text-body pt-2.5">New Password</label>
                        <div className="flex-1 space-y-2">
                            <input
                                type="password"
                                placeholder="***********"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bgBlue/20"
                            />
                            <p className="text-xs text-muted">Your Password must be more than 8 characters</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
                        <label className="w-48 text-sm font-medium text-body">Retype New Password</label>
                        <input
                            type="password"
                            placeholder="***********"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="flex-1 px-4 py-2.5 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bgBlue/20"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 bg-White border border-border text-body font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-customShadow cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePasswordChange}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-bgBlue text-white font-medium rounded-lg hover:bg-blue-500 transition-colors shadow-customShadow cursor-pointer flex items-center gap-2"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Change Password
                        </button>
                    </div>
                </div>
            </section>

            {/* Where you are logged in */}
            <section>
                <h2 className="text-lg md:text-xl font-bold text-headings mb-2">Where you are logged in</h2>
                <p className="text-sm text-muted mb-6">
                    We will notify you via <span className="text-headings font-medium">{notificationEmail || "your email"}</span> if there is any unusual activity on your account
                </p>

                <div className="space-y-3">
                    {sessions.map((session) => {
                        const isCurrent = session.isCurrent;
                        const lastActive = session.lastActive;

                        return (
                            <div
                                key={session.id}
                                className="rounded-xl border border-border p-4 bg-navbarBg"
                            >
                                {/* Top row: device info + time/badge */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-headings">{session.deviceName || 'Browser'}</p>
                                            <p className="text-xs text-muted mt-0.5">
                                                {session.location || 'Unknown'}{session.ipAddress ? ` • ${session.ipAddress}` : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right side: always show last active time, plus Current badge if applicable */}
                                    <div className="shrink-0 flex items-center gap-2">
                                        {isCurrent && (
                                            <span className="text-xs font-medium text-gray-500 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-0.5">
                                                Current
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1 text-xs text-muted">
                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                            <span>{lastActive}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom row: End Session button */}
                                <div className="mt-3 pl-8">
                                    <button
                                        disabled={isEndingSession === session.id}
                                        onClick={() => handleEndSession(session.id, isCurrent)}
                                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-customShadow transition-colors cursor-pointer flex items-center gap-1"
                                    >
                                        {isEndingSession === session.id && <Loader2 className="w-3 h-3 animate-spin" />}
                                        End Session
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {sessions.length > 1 && (
                        <button
                            disabled={isEndingOthers}
                            onClick={handleEndOtherSessions}
                            className="w-full mt-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isEndingOthers ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                            End All Other Sessions
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}