'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Settings, Home, HomeIcon, LayoutTemplate, Loader2, Calendar, Upload, Image } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import BannerForm, { BannerFormData } from '@/components/Admin/support/Banner/BannerForm';
import BannerPreview from '@/components/Admin/support/Banner/BannerPreview';
import { useParams, useRouter } from 'next/navigation';
import { useGetBannerByIdQuery, useUpdateCustomBannerMutation, useUpdatePrebuiltBannerMutation } from '@/redux/api/admin/bannerApi';
import { toast } from 'sonner';


export default function EditBannerPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const { data: banner, isLoading: isFetching } = useGetBannerByIdQuery(id as string, { skip: !id });
    const [updateCustomBanner, { isLoading: isUpdatingCustom }] = useUpdateCustomBannerMutation();
    const [updatePrebuiltBanner, { isLoading: isUpdatingPrebuilt }] = useUpdatePrebuiltBannerMutation();
    const isUpdating = isUpdatingCustom || isUpdatingPrebuilt;

    const [activeTab, setActiveTab] = useState<'custom' | 'prebuilt'>('custom');
    const [formData, setFormData] = useState<BannerFormData>({
        bannerType: 'Upload',
        title: '',
        description: '',
        image: null,
        primaryButtonLabel: '',
        primaryButtonLink: '',
        enableSecondaryButton: false,
        secondaryButtonLabel: '',
        secondaryButtonLink: '',
        startDate: '',
        endDate: '',
        targetUserType: 'ALL_USERS',
        primaryButtonIcon: '',
        secondaryButtonIcon: '',
        status: 'Draft',
        // New design fields
        mediaWidth: 180,
        mediaHeight: 180,
        backgroundStyle: 'GRADIENT',
        backgroundColor1: '#005C97',
        backgroundColor2: '#363795',
        backgroundDirection: 'to right',
        placeholderImage: null,
        mediaShape: 'original',
    });

    const formatValue = (val: string) => {
        if (!val) return '';
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    };

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '') || '';
        if (banner) {
            const isPrebuilt = !!banner.uploadBanner || !!banner.bannerLinkRedirectURL;
            setActiveTab(isPrebuilt ? 'prebuilt' : 'custom');

            setFormData({
                bannerType: banner.type ? formatValue(banner.type) : 'Upload',
                title: banner.title || '',
                description: banner.description || '',
                image: isPrebuilt 
                    ? (banner.uploadBanner ? (banner.uploadBanner.startsWith('http') ? banner.uploadBanner : `${baseUrl}/${banner.uploadBanner}`) : null)
                    : (banner.mediaUrl ? (banner.mediaUrl.startsWith('http') ? banner.mediaUrl : `${baseUrl}/${banner.mediaUrl}`) : null),
                primaryButtonLabel: banner.primaryButtonLabel || '',
                primaryButtonLink: banner.primaryButtonUrl || '',
                enableSecondaryButton: banner.secondaryButtonEnabled || false,
                secondaryButtonLabel: banner.secondaryButtonLabel || '',
                secondaryButtonLink: banner.secondaryButtonUrl || '',
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
                targetUserType: banner.targetUserType || 'ALL_USERS',
                primaryButtonIcon: banner.primaryButtonIcon || '',
                secondaryButtonIcon: banner.secondaryButtonIcon || '',
                status: banner.status ? formatValue(banner.status) : 'Draft',
                // New design fields
                mediaWidth: banner.mediaWidth || 180,
                mediaHeight: banner.mediaHeight || 180,
                backgroundStyle: banner.backgroundStyle || 'GRADIENT',
                backgroundColor1: banner.backgroundColor1 || '#005C97',
                backgroundColor2: banner.backgroundColor2 || '#363795',
                backgroundDirection: banner.backgroundDirection || 'to right',
                placeholderImage: banner.placeholderMediaUrl ? (banner.placeholderMediaUrl.startsWith('http') ? banner.placeholderMediaUrl : `${baseUrl}/${banner.placeholderMediaUrl}`) : null,
                mediaShape: banner.mediaShape || 'original',
                mediaPosition: banner.mediaPosition as 'LEFT' | 'RIGHT' || 'RIGHT',
                bannerLinkRedirectURL: banner.bannerLinkRedirectURL || '',
            });
        }
    }, [banner]);

    const handleTabChange = (newTab: 'custom' | 'prebuilt') => {
        if (newTab === activeTab) return;

        // Reset fields when switching modes
        if (newTab === 'prebuilt') {
            setFormData(prev => ({
                ...prev,
                primaryButtonLabel: '',
                primaryButtonLink: '',
                enableSecondaryButton: false,
                secondaryButtonLabel: '',
                secondaryButtonLink: '',
                image: null,
                file: null,
                backgroundStyle: 'SOLID',
                backgroundColor1: '#005C97',
                // Keep dates and metadata as they are global
            }));
        } else {
            // Switching to custom
            setFormData(prev => ({
                ...prev,
                image: null,
                file: null,
            }));
        }
        setActiveTab(newTab);
    };

    const handleSave = async (overrideStatus?: string) => {
        try {
            const data = new FormData();
            data.append('type', formData.bannerType.toUpperCase());
            data.append('status', overrideStatus || formData.status.toUpperCase());
            data.append('startDate', formData.startDate ? new Date(formData.startDate).toISOString() : '');
            data.append('endDate', formData.endDate ? new Date(formData.endDate).toISOString() : '');
            data.append('targetUserType', formData.targetUserType.toUpperCase().replace(' ', '_'));

            if (activeTab === 'custom') {
                data.append('title', formData.title);
                data.append('description', formData.description);
                if (formData.file) {
                    data.append('media', formData.file);
                }
                data.append('mediaType', formData.file?.type.startsWith('video') ? 'VIDEO' : 'IMAGE');
                data.append('primaryButtonLabel', formData.primaryButtonLabel);
                data.append('primaryButtonUrl', formData.primaryButtonLink);
                data.append('primaryButtonIcon', formData.primaryButtonIcon || '');
                data.append('secondaryButtonEnabled', String(formData.enableSecondaryButton));
                data.append('secondaryButtonLabel', formData.secondaryButtonLabel);
                data.append('secondaryButtonUrl', formData.secondaryButtonLink);
                data.append('secondaryButtonIcon', formData.secondaryButtonIcon || '');
                
                data.append('backgroundStyle', formData.backgroundStyle || 'GRADIENT');
                data.append('backgroundColor1', formData.backgroundColor1 || '#005C97');
                data.append('backgroundColor2', formData.backgroundColor2 || '#363795');
                data.append('backgroundDirection', formData.backgroundDirection || 'to right');
                data.append('mediaWidth', String(formData.mediaWidth || 180));
                data.append('mediaHeight', String(formData.mediaHeight || 180));
                data.append('mediaPosition', formData.mediaPosition || 'RIGHT');
                data.append('mediaShape', (formData.mediaShape || 'ORIGINAL').toUpperCase());

                if (formData.placeholderFile) {
                    data.append('placeholderMedia', formData.placeholderFile);
                }

                await updateCustomBanner({ id: id as string, data }).unwrap();
            } else {
                // Prebuilt
                data.append('title', formData.title || '');
                data.append('description', formData.description || '');
                if (formData.uploadBannerFile) {
                    data.append('uploadBanner', formData.uploadBannerFile);
                }
                data.append('bannerLinkRedirectURL', formData.bannerLinkRedirectURL || '');
                
                await updatePrebuiltBanner({ id: id as string, data }).unwrap();
            }

            toast.success('Banner updated successfully');
            router.push('/admin/support/banner');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update banner');
            console.error('Update error:', error);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-border flex items-center justify-between shrink-0 pb-6">
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
                        <Link href="/admin/dashboard">
                            <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span>Customer Supports</span>
                        <ChevronRight className="w-4 h-4" />
                        <span><Link href="/admin/support/banner" className="text-gray-500 dark:text-gray-400 hover:text-bgBlue dark:hover:text-bgBlue hover:underline transition-colors">Banner</Link></span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-bgBlue font-medium">Update Banner</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Update Banner</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage banner on the home page to advertise new features/promotions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {isFetching ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-bgBlue" />
                </div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col py-6">
                    {/* Tab Switcher */}
                    <div className="rounded-full border border-border p-1 inline-flex mb-6 shrink-0 w-max bg-navbarBg gap-2">
                        <button
                            onClick={() => handleTabChange('custom')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === 'custom'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <LayoutTemplate className="w-4 h-4" />
                            Custom Banner
                        </button>
                        <button
                            onClick={() => handleTabChange('prebuilt')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === 'prebuilt'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Image className="w-4 h-4" />
                            Prebuild Banner
                        </button>
                    </div>

                    {/* Form and Preview Split */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                        {/* Left Side: Form */}
                        <div className="lg:col-span-5 h-full flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto mb-6">
                                <BannerForm data={formData} onChange={setFormData} mode={activeTab} />
                            </div>

                            {/* Save Button below the form */}
                            <div className="shrink-0 p-4 flex items-center justify-end">
                                <button
                                    onClick={() => handleSave()}
                                    disabled={isUpdating}
                                    className="w-full md:w-auto px-8 py-2.5 bg-bgBlue hover:bg-bgBlue/80 text-white rounded-lg font-semibold transition-all shadow-customShadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update and Save Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Right Side: Preview */}
                        <div className="lg:col-span-7 h-full overflow-hidden">
                            <BannerPreview data={formData} mode={activeTab} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
