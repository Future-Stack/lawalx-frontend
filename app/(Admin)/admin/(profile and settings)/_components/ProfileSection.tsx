/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Info, Loader2, AlertCircle, User } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useUploadProfilePhotoMutation,
} from '@/redux/api/admin/profile&settings/adminSettingsApi';
import { toast } from 'sonner';

const getFullImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

function ProfileAvatar({ imageUrl, name, size = 'lg' }: { imageUrl: string | null; name: string; size?: 'sm' | 'lg' }) {
    const initials = name
        ? name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
        : '';

    const sizeClasses = size === 'lg'
        ? 'w-24 h-24 text-2xl'
        : 'w-10 h-10 text-sm';

    if (imageUrl) {
        return (
            <div className={`relative ${sizeClasses} rounded-full overflow-hidden border-2 border-border shadow-sm flex-shrink-0`}>
                <Image src={imageUrl} alt="Profile" fill className="object-cover" sizes={size === 'lg' ? '96px' : '40px'} />
            </div>
        );
    }

    return (
        <div className={`${sizeClasses} rounded-full border-2 border-border shadow-sm flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center`}>
            {initials ? (
                <span className="font-bold text-white">{initials}</span>
            ) : (
                <User className={size === 'lg' ? 'w-10 h-10 text-white' : 'w-5 h-5 text-white'} />
            )}
        </div>
    );
}

export default function ProfileSection() {
    const { data: profileData, isLoading, isError, error } = useGetAdminProfileQuery({});
    const [updateAdminProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
    const [uploadProfilePhoto, { isLoading: isUploading }] = useUploadProfilePhotoMutation();
    console.log("profile get data response", profileData);


    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (profileData?.success && profileData?.data) {
            const d = profileData.data;
            setFullName(d.fullname || d.full_name || '');
            const imgPath = d.profileImage || d.image_url;
            setResolvedImageUrl(getFullImageUrl(imgPath));
        }
    }, [profileData]);

    const handleSave = async () => {
        try {
            const res = await updateAdminProfile({ full_name: fullName }).unwrap();
            if (res.success) {
                toast.success(res.message || 'Profile updated successfully');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to update profile');
        }
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await uploadProfilePhoto(formData).unwrap();
            if (res.success) {
                toast.success('Photo updated successfully');
                if (res.data?.image_url) setResolvedImageUrl(getFullImageUrl(res.data.image_url));
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to upload photo');
        }
    };

    if (isLoading) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                <p className="text-body">Loading profile...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-2 text-red-500">
                <AlertCircle className="w-8 h-8" />
                <p className="font-medium">Error loading profile</p>
                <p className="text-xs text-muted">{(error as any)?.data?.message || 'Check your connection'}</p>
            </div>
        );
    }

    const profile = profileData?.data;

    return (
        <div className="space-y-6">
            <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-[#F0FAFF] dark:bg-blue-900/10">
                    <h2 className="text-lg font-semibold text-headings">Personal Information</h2>
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="bg-bgBlue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Profile Photo */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <Label className="w-32 text-sm font-medium text-headings shrink-0">Profile Photo</Label>
                        <div className="flex items-center gap-6">
                            <ProfileAvatar imageUrl={resolvedImageUrl} name={fullName} size="lg" />
                            <div className="flex flex-col gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                                <div
                                    className="flex items-center justify-center border-2 border-dashed border-border rounded-xl p-6 bg-white dark:bg-gray-800 hover:border-bgBlue transition-colors cursor-pointer group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-bgBlue" /> : <Upload className="w-4 h-4 text-gray-500" />}
                                        </div>
                                        <p className="text-sm">
                                            <span className="text-bgBlue font-medium">{isUploading ? 'Uploading...' : 'Click to Upload'}</span>
                                            {!isUploading && <span className="text-muted"> or drag and drop</span>}
                                        </p>
                                        <p className="text-xs text-muted uppercase">SVG, PNG, or JPG (Max 800 × 800px)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border pt-8 space-y-6">
                        {/* Full Name */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Full Name</Label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter full name"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>

                        {/* Email (read-only) */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Email</Label>
                            <div className="flex-1 max-w-2xl relative">
                                <Input
                                    type="email"
                                    value={profile?.email || ''}
                                    readOnly
                                    className="w-full bg-input border-border text-muted h-11 pr-10 cursor-not-allowed"
                                />
                                <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted cursor-pointer hover:text-bgBlue" />
                            </div>
                        </div>

                        {/* Role */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Role</Label>
                            <div className="flex-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-100 dark:bg-red-950/20 dark:border-red-900/30">
                                    {profile?.role || 'ADMIN'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
