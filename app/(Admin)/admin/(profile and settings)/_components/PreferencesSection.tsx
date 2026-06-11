'use client';

import React, { useState } from 'react';
import BaseSelect from '@/common/BaseSelect';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, AlertCircle, Upload, Eye, Trash2 } from 'lucide-react';
import {
    useGetAdminPreferencesQuery,
    useUpdateAdminPreferencesMutation,
} from '@/redux/api/admin/profile&settings/adminSettingsApi';
import {
    useGetAuthImageQuery,
    useUploadAuthImageMutation,
    useDeleteAuthImageMutation,
} from '@/redux/api/admin/profile&settings/signImageApi';
import { getUrl } from '@/lib/content-utils';
import Image from 'next/image';
import BaseDialog from '@/common/BaseDialog';
import { toast } from 'sonner';

function AuthImageCard({ type, title }: { type: 'signin' | 'signup', title: string }) {
    const { data: imgData, isLoading } = useGetAuthImageQuery(type);
    const [uploadAuthImage, { isLoading: isUploading }] = useUploadAuthImageMutation();
    const [deleteAuthImage, { isLoading: isDeleting }] = useDeleteAuthImageMutation();

    const [viewModalOpen, setViewModalOpen] = useState(false);

    const imageUrl = imgData?.data?.imageUrl ? getUrl(imgData.data.imageUrl) : null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await uploadAuthImage({ type, image: file }).unwrap();
            if (res.success) toast.success(`Image uploaded successfully`);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to upload image');
        }
    };

    const handleDelete = async () => {
        if (!imageUrl) return;
        try {
            const res = await deleteAuthImage(type).unwrap();
            if (res.success) toast.success(`Image deleted successfully`);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete image');
        }
    };

    return (
        <div className="border border-border rounded-xl p-4 flex flex-col items-center gap-4">
            <div className="w-full flex justify-between items-center">
                <span className="font-semibold text-headings">{title}</span>
                <div className="flex gap-2">
                    <button onClick={() => imageUrl && setViewModalOpen(true)} disabled={!imageUrl} className="cursor-pointer p-1.5 text-muted hover:text-bgBlue disabled:opacity-50 disabled:cursor-not-allowed">
                        <Eye className="w-4 h-4" />
                    </button>
                    <label className="cursor-pointer p-1.5 text-muted hover:text-bgBlue">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
                    </label>
                    <button onClick={handleDelete} disabled={!imageUrl || isDeleting} className="cursor-pointer p-1.5 text-muted hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="w-full aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-border relative">
                {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted" />
                ) : imageUrl ? (
                    <Image src={imageUrl} alt={title} fill className="object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted p-4 text-center">
                        <span className="text-sm font-medium">No Image Uploaded</span>
                        <span className="text-[10px] bg-gray-200/50 dark:bg-gray-700/50 px-2 py-1 rounded-md">Preferred size: 1000x1000px (1:1 Ratio)</span>
                    </div>
                )}
            </div>

            <BaseDialog open={viewModalOpen} setOpen={setViewModalOpen} title={title} description="" maxWidth="3xl">
                <div className="pt-4 relative w-full h-[60vh]">
                    {imageUrl && <Image src={imageUrl} alt={title} fill className="object-contain" />}
                </div>
            </BaseDialog>
        </div>
    );
}

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
            {/* Auth Images */}
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm mt-6">
                <div className="px-6 py-4 border-b border-border bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Authentication Page Images</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AuthImageCard type="signin" title="Sign In Page Image" />
                    <AuthImageCard type="signup" title="Sign Up Page Image" />
                </div>
            </div>
        </div>
    );
}
