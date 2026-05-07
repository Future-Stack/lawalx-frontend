'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Monitor, Clock, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import BaseDialog from '@/common/BaseDialog';
import {
    useGetAdminSecurityQuery,
    useUpdateAdminSecurityMutation,
    useChangeAdminPasswordMutation,
    useGetAdminSessionsQuery,
    useEndAdminSessionMutation,
    useEndAllOtherAdminSessionsMutation,
} from '@/redux/api/admin/profile&settings/adminSettingsApi';
import { toast } from 'sonner';

export default function SecuritySection() {
    const { data: securityData, isLoading: isSecLoading, isError: isSecError, error: secError } = useGetAdminSecurityQuery({});
    const { data: sessionsData, isLoading: isSessLoading, isError: isSessError, error: sessError } = useGetAdminSessionsQuery({});

    const [updateAdminSecurity] = useUpdateAdminSecurityMutation();
    const [changeAdminPassword, { isLoading: isChangingPass }] = useChangeAdminPasswordMutation();
    const [endAdminSession] = useEndAdminSessionMutation();
    const [endAllOtherAdminSessions] = useEndAllOtherAdminSessionsMutation();

    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [addEmailModalOpen, setAddEmailModalOpen] = useState(false);

    const handleUpdateSecurity = async (patch: any) => {
        try {
            const currentData = securityData?.data;
            if (!currentData) return;

            const fullPayload = {
                twoFactorEnabled: currentData.twoFactorEnabled,
                twoFactorEmail: currentData.twoFactorEmail,
                loginAlert: currentData.loginAlert,
                ...patch,
            };

            const res = await updateAdminSecurity(fullPayload).unwrap();
            if (res.success) {
                toast.success('Security settings updated');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update security settings');
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        try {
            const res = await changeAdminPassword({ oldPassword, newPassword }).unwrap();
            if (res.success) {
                toast.success(res.message || 'Password changed successfully');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to change password');
        }
    };

    const handleEndSession = async (sessionId: string) => {
        try {
            await endAdminSession(sessionId).unwrap();
            toast.success('Session ended');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to end session');
        }
    };

    const handleEndOtherSessions = async () => {
        try {
            await endAllOtherAdminSessions(undefined).unwrap();
            toast.success('All other sessions ended');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to end other sessions');
        }
    };

    const parseUserAgent = (ua: string) => {
        if (!ua) return 'Browser';
        if (ua.includes('Windows')) return 'Chrome on Windows';
        if (ua.includes('Mac')) return 'Chrome on macOS';
        if (ua.includes('Linux')) return 'Chrome on Linux';
        if (ua.includes('Android')) return 'Mobile (Android)';
        if (ua.includes('iPhone')) return 'Mobile (iPhone)';
        return 'Browser';
    };

    if (isSecLoading || isSessLoading) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                <p className="text-body">Loading security settings...</p>
            </div>
        );
    }

    if (isSecError || isSessError) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-2 text-red-500">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium">Error loading security data</p>
                <p className="text-xs text-muted">
                    {((secError || sessError) as any)?.data?.message || 'Check your connection or token'}
                </p>
            </div>
        );
    }

    const security = securityData?.data;
    const sessions: any[] = sessionsData?.data || [];
    const nonCurrentSessions = sessions.filter((s) => !s.isCurrent);

    return (
        <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Password</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label className="text-sm font-medium text-headings">Current Password</Label>
                        <div className="relative">
                            <Input
                                type={showOldPass ? 'text' : 'password'}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="bg-input border-border text-headings pr-10 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:border-bgBlue focus-visible:ring-bgBlue/30"
                            />
                            <button type="button" onClick={() => setShowOldPass(!showOldPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors">
                                {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label className="text-sm font-medium text-headings">New Password</Label>
                        <div className="relative">
                            <Input
                                type={showNewPass ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="bg-input border-border text-headings pr-10 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:border-bgBlue focus-visible:ring-bgBlue/30"
                            />
                            <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors">
                                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <Label className="text-sm font-medium text-headings">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirmPass ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="bg-input border-border text-headings pr-10 h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:border-bgBlue focus-visible:ring-bgBlue/30"
                            />
                            <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors">
                                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleChangePassword}
                            disabled={isChangingPass}
                            className="bg-bgBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                            {isChangingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isChangingPass ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Two-Factor Authentication */}
            {/* <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Two-Factor Authentication</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-semibold text-headings">Enable 2-FA</Label>
                            <p className="text-sm text-muted">Add an extra layer of security</p>
                        </div>
                        <Switch
                            checked={security?.twoFactorEnabled ?? false}
                            onCheckedChange={(checked) => handleUpdateSecurity({ twoFactorEnabled: checked })}
                            className="cursor-pointer"
                        />
                    </div>
                    <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center gap-4">
                        <Label className="text-sm font-medium text-headings w-24 shrink-0">2-FA Email</Label>
                        <div className="flex-1 relative">
                            <Input
                                disabled
                                value={security?.twoFactorEmail || 'Not set'}
                                className="bg-input/50 border-border text-muted h-11 pr-10"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-headings cursor-pointer">
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => setVerifyModalOpen(true)}
                            className="bg-bgBlue hover:bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors cursor-pointer shrink-0"
                        >
                            Change
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Security Notifications */}
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Security Notifications</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-semibold text-headings">Login Notifications</Label>
                            <p className="text-sm text-muted">Get alerted on new logins</p>
                        </div>
                        <Switch
                            checked={security?.loginAlert ?? false}
                            onCheckedChange={(checked) => handleUpdateSecurity({ loginAlert: checked })}
                            className="cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Active Sessions</h2>
                </div>
                <div className="p-4 space-y-3">
                    {sessions.map((session: any) => {
                        const isCurrent = session.isCurrent;
                        const lastActive = session.lastActive
                            ? (() => {
                                const diff = Math.round((Date.now() - new Date(session.lastActive).getTime()) / 60000);
                                if (diff < 1) return 'Just now';
                                if (diff < 60) return `${diff} minutes ago`;
                                const hrs = Math.round(diff / 60);
                                return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
                            })()
                            : '';

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
                                            <p className="text-sm font-bold text-headings">{parseUserAgent(session.userAgent)}</p>
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
                                        onClick={() => handleEndSession(session.id)}
                                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-md shadow-customShadow transition-colors cursor-pointer"
                                    >
                                        End Session
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {sessions.length > 1 && (
                        <button
                            onClick={handleEndOtherSessions}
                            className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            End All Other Sessions
                        </button>
                    )}
                </div>
            </div>

            {/* Verify 2FA Dialog */}
            <BaseDialog
                open={verifyModalOpen}
                setOpen={setVerifyModalOpen}
                title="Verification Code Sent"
                description={`A verification code has been sent to ${security?.twoFactorEmail || 'your email'}. Please check your inbox.`}
                maxWidth="md"
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-headings">6-Digit Code</Label>
                        <Input
                            placeholder="123 - 456"
                            className="bg-input border-border text-center text-lg tracking-widest h-12"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setVerifyModalOpen(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-headings hover:bg-gray-50 transition-colors font-medium cursor-pointer">Resend</button>
                        <button
                            onClick={() => { setVerifyModalOpen(false); setAddEmailModalOpen(true); }}
                            className="flex-1 bg-bgBlue hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-customShadow transition-colors cursor-pointer"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </BaseDialog>

            {/* Add 2FA Email Dialog */}
            <BaseDialog
                open={addEmailModalOpen}
                setOpen={setAddEmailModalOpen}
                title="Add 2-FA Email"
                description="Enter the email that will receive verification codes on login."
                maxWidth="md"
            >
                <div className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-headings">Verification Email</Label>
                            <Input type="email" placeholder="john@example.com" className="bg-input border-border h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-headings">Confirm Email</Label>
                            <Input type="email" placeholder="john@example.com" className="bg-input border-border h-11" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setAddEmailModalOpen(false)} className="flex-1 px-4 py-2.5 border border-border rounded-lg text-headings hover:bg-gray-50 transition-colors font-medium cursor-pointer">Cancel</button>
                        <button onClick={() => setAddEmailModalOpen(false)} className="flex-1 bg-bgBlue hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium shadow-customShadow transition-colors cursor-pointer">Add Email</button>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
}
