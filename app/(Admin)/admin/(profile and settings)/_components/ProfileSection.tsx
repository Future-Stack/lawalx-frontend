'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Info, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useUploadProfilePhotoMutation,
} from '@/redux/api/admin/profile&settings/adminSettingsApi';
import { toast } from 'sonner';

const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return '/images/profile-settings.png';
    if (path.startsWith('http')) return path;
    
    // Derive base domain from NEXT_PUBLIC_BASE_URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function ProfileSection() {
    const { data: profileData, isLoading, isError, error } = useGetAdminProfileQuery({});
    const [updateAdminProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
    const [uploadProfilePhoto, { isLoading: isUploading }] = useUploadProfilePhotoMutation();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [fullName, setFullName] = useState('');
    const [officialName, setOfficialName] = useState('');
    const [designation, setDesignation] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [website, setWebsite] = useState('');
    const [industryType, setIndustryType] = useState('');
    const [totalEmployees, setTotalEmployees] = useState('');
    const [location, setLocation] = useState('');
    const [cityCountry, setCityCountry] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneCountry, setPhoneCountry] = useState('');
    const [imageUrl, setImageUrl] = useState('/images/profile-settings.png');

    useEffect(() => {
        if (profileData?.success && profileData?.data) {
            const d = profileData.data;
            setFullName(d.fullname || d.full_name || '');
            setOfficialName(d.officialName || '');
            setDesignation(d.designation || '');
            setCompanyName(d.company_name || '');
            setWebsite(d.website || '');
            setIndustryType(d.industryType || '');
            setTotalEmployees(d.totalEmployees || '');
            setLocation(d.location || '');
            setCityCountry(d.cityCountry || '');
            setPhoneNumber(d.phoneNumber || '');
            setPhoneCountry(d.phoneCountry || '');
            if (d.profileImage || d.image_url) {
                setImageUrl(getFullImageUrl(d.profileImage || d.image_url));
            }
        }
    }, [profileData]);

    const handleSave = async () => {
        try {
            const res = await updateAdminProfile({
                full_name: fullName,
                officialName,
                designation,
                company_name: companyName,
                website,
                industryType,
                totalEmployees,
                location,
                cityCountry,
                phoneNumber,
                phoneCountry,
            }).unwrap();
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
                if (res.data?.image_url) setImageUrl(getFullImageUrl(res.data.image_url));
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
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-sm">
                                <Image
                                    src={imageUrl}
                                    alt="Profile"
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                />
                            </div>
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
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>

                        {/* Official Name */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Official Name</Label>
                            <Input
                                type="text"
                                value={officialName}
                                onChange={(e) => setOfficialName(e.target.value)}
                                placeholder="Enter official name"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
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

                        {/* Designation */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Designation</Label>
                            <Input
                                type="text"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                placeholder="Enter designation (e.g. Software Engineer)"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Phone</Label>
                            <div className="flex gap-2 flex-1 max-w-2xl">
                                <Input
                                    type="text"
                                    value={phoneCountry}
                                    onChange={(e) => setPhoneCountry(e.target.value)}
                                    placeholder="+1"
                                    className="w-20 bg-input border-border text-headings h-11"
                                />
                                <Input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="flex-1 bg-input border-border text-headings h-11"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Location</Label>
                            <Input
                                type="text"
                                value={cityCountry}
                                onChange={(e) => setCityCountry(e.target.value)}
                                placeholder="Enter city, country"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>

                        {/* Role */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Role</Label>
                            <div className="flex-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-100">
                                    {profile?.role || 'SUPERADMIN'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Company Section */}
                    <div className="border-t border-border pt-8 space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-headings">Company Information</h3>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Company</Label>
                            <Input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="Enter company name"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Website</Label>
                            <Input
                                type="url"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://example.com"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Industry</Label>
                            <Input
                                type="text"
                                value={industryType}
                                onChange={(e) => setIndustryType(e.target.value)}
                                placeholder="Enter industry"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <Label className="w-32 text-sm font-medium text-headings shrink-0">Team Size</Label>
                            <Input
                                type="text"
                                value={totalEmployees}
                                onChange={(e) => setTotalEmployees(e.target.value)}
                                placeholder="50-100"
                                className="flex-1 max-w-2xl bg-input border-border text-headings h-11"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
