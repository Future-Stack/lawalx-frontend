'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Settings, HomeIcon, LayoutTemplate, Loader2, Calendar, Upload, Image } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import BannerForm, { BannerFormData } from '@/components/Admin/support/Banner/BannerForm';
import BannerPreview from '@/components/Admin/support/Banner/BannerPreview';
import { useCreateCustomBannerMutation, useCreatePrebuiltBannerMutation } from '@/redux/api/admin/bannerApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';


export default function CreateBannerPage() {
    const router = useRouter();
    const [createCustomBanner, { isLoading: isCreatingCustom }] = useCreateCustomBannerMutation();
    const [createPrebuiltBanner, { isLoading: isCreatingPrebuilt }] = useCreatePrebuiltBannerMutation();
    const isLoading = isCreatingCustom || isCreatingPrebuilt;

    const [activeTab, setActiveTab] = useState<'custom' | 'prebuilt'>('custom');
    const [formData, setFormData] = useState<BannerFormData>({
        bannerType: 'Upload',
        status: 'Active',
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
            // Validation
            if (activeTab === 'custom') {
                if (!formData.title?.trim()) {
                    toast.error('Title is required');
                    return;
                }
                if (!formData.description?.trim()) {
                    toast.error('Description is required');
                    return;
                }
            } else {
                if (!formData.title?.trim()) {
                    toast.error('Title is required');
                    return;
                }
            }

            const data = new FormData();
            console.log('Form data before sending:', {
                activeTab,
                title: formData.title,
                description: formData.description,
                hasFile: !!formData.file,
                hasUploadBannerFile: !!formData.uploadBannerFile,
                primaryButtonLabel: formData.primaryButtonLabel,
                primaryButtonLink: formData.primaryButtonLink
            });
            data.append('type', formData.bannerType.toUpperCase());
            data.append('status', overrideStatus || formData.status.toUpperCase());
            data.append('startDate', formData.startDate ? new Date(formData.startDate).toISOString() : '');
            data.append('endDate', formData.endDate ? new Date(formData.endDate).toISOString() : '');
            data.append('targetUserType', formData.targetUserType.toUpperCase().replace(' ', '_'));

            // Log FormData contents
            console.log('FormData entries:');
            for (const [key, value] of data.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

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

                console.log('Create data being sent:');
                for (const [key, value] of data.entries()) {
                    if (value instanceof File) {
                        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
                    } else {
                        console.log(`${key}: ${value}`);
                    }
                }
            } else {
                // Prebuilt
                data.append('title', formData.title || '');
                data.append('description', formData.description || '');
                if (formData.uploadBannerFile) {
                    data.append('uploadBanner', formData.uploadBannerFile);
                }
                data.append('bannerLinkRedirectURL', formData.bannerLinkRedirectURL || '');

                console.log('Create prebuilt data being sent:');
                for (const [key, value] of data.entries()) {
                    if (value instanceof File) {
                        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
                    } else {
                        console.log(`${key}: ${value}`);
                    }
                }
            }

            console.log('Sending API request...');
            try {
                if (activeTab === 'custom') {
                    await createCustomBanner(data).unwrap();
                } else {
                    await createPrebuiltBanner(data).unwrap();
                }
                console.log('API request successful');
            } catch (apiError) {
                console.error('API Error caught:', apiError);
                console.error('Error type:', typeof apiError);
                console.error('Error keys:', Object.keys(apiError || {}));
                throw apiError;
            }

            toast.success('Banner created successfully');
            router.push('/admin/support/banner');
        } catch (error: any) {
            console.error('Create error:', error);
            console.error('Error details:', {
                message: error?.message,
                status: error?.status,
                data: error?.data,
                originalStatus: error?.originalStatus,
                error: error?.error
            });
            toast.error(error?.data?.message || error?.message || 'Failed to create banner');
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
                        <span><Link href="/admin/support/banner" className="text-gray-700 dark:text-gray-400 hover:text-bgBlue dark:hover:text-blue-300">Banner</Link></span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-bgBlue font-medium">Create Banner</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Banner</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage banner on the home page to advertise new features/promotions.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
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
                                disabled={isLoading}
                                className="w-full md:w-auto px-8 py-2.5 bg-bgBlue hover:bg-bgBlue/80 text-white rounded-lg font-semibold transition-all shadow-customShadow cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create and Save Banner'}
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="lg:col-span-7 h-full overflow-hidden">
                        <BannerPreview data={formData} mode={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
}