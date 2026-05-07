'use client';

import React from 'react';
import BaseSelect from '@/common/BaseSelect';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertCircle } from 'lucide-react';
import {
    useGetAdminPreferencesQuery,
    useUpdateAdminPreferencesMutation,
} from '@/redux/api/admin/profile&settings/adminSettingsApi';
import { toast } from 'sonner';

export default function PreferencesSection() {
    const { data: prefData, isLoading, isError, error } = useGetAdminPreferencesQuery({});
    const [updateAdminPreferences] = useUpdateAdminPreferencesMutation();

    const dateFormatOptions = [
        { label: 'DD/MM/YYYY', value: 'DMY' },
        { label: 'MM/DD/YYYY', value: 'MDY' },
        { label: 'YYYY/MM/DD', value: 'YMD' },
    ];

    const timeFormatOptions = [
        { label: '12 Hour', value: 'H12' },
        { label: '24 Hour', value: 'H24' },
    ];

    const languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'French', value: 'fr' },
    ];

    const handleUpdate = async (patch: any) => {
        try {
            const currentData = prefData?.data;
            if (!currentData) return;

            const fullPayload = {
                emailNotification: currentData.emailNotification,
                pushNotification: currentData.pushNotification,
                dateFormat: currentData.dateFormat,
                timeFormat: currentData.timeFormat,
                language: currentData.language,
                ...patch,
            };

            const res = await updateAdminPreferences(fullPayload).unwrap();
            if (res.success) {
                toast.success(res.message || 'Preferences updated');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update preferences');
        }
    };

    if (isLoading) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                <p className="text-body">Loading preferences...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-2 text-red-500">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium">Error loading preferences</p>
                <p className="text-xs text-muted">{(error as any)?.data?.message || 'Check your connection'}</p>
            </div>
        );
    }

    const preferences = prefData?.data;

    return (
        <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Notifications</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-sm font-semibold text-headings">Email Notifications</Label>
                            <p className="text-sm text-body">Receive system alerts via email</p>
                        </div>
                        <Switch
                            checked={preferences?.emailNotification ?? false}
                            onCheckedChange={(checked) => handleUpdate({ emailNotification: checked })}
                            className="cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
