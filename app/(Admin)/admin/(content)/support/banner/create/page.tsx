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
import { useCreateBannerMutation } from '@/redux/api/admin/bannerApi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const DEFAULT_CSS_TEMPLATE = `/* 
    Available CSS Classes:
    .banner-container      - Main wrapper
    .banner-text-content   - Left side content wrapper
    .banner-title          - Title text
    .banner-desc           - Description text
    .banner-buttons        - Button wrapper
    .primary-btn           - Primary action button
    .secondary-btn         - Secondary action button
    .banner-image-container - Right side wrapper
    .banner-image          - The image itself
*/

/* Example Styles */
.banner-container {
    /* Main Layout */
    /* display: flex; */
    /* flex-direction: row; */ /* Use column for mobile-like layout */
    /* background: linear-gradient(to right, #005C97, #363795); */
    /* padding: 2rem; */
}

.banner-text-content {
    /* Change width of text area */
    /* max-width: 60%; */
}

/* Image Positioning */
.banner-image-container {
    /* To move image to left: */
    /* order: -1; */
    
    /* To hide image: */
    /* display: none; */
}

.banner-title {
    /* font-size: 2rem; */
    /* font-weight: bold; */
    /* color: white; */
    /* margin-bottom: 0.5rem; */
}

.banner-desc {
    /* font-size: 1rem; */
    /* color: #e0e7ff; */
    /* margin-bottom: 1.5rem; */
}

.banner-buttons {
    /* display: flex; */
    /* gap: 1rem; */
}

.primary-btn {
    /* background-color: white; */
    /* color: #1e3a8a; */
}

.secondary-btn {
    /* background-color: rgba(30, 58, 138, 0.3); */
    /* border: 1px solid rgba(96, 165, 250, 0.3); */
}
`;

export default function CreateBannerPage() {
    const router = useRouter();
    const [createBanner, { isLoading }] = useCreateBannerMutation();

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
        customCSS: DEFAULT_CSS_TEMPLATE,
        primaryButtonIcon: '',
        secondaryButtonIcon: '',
        // New design fields
        imageWidth: 180,
        imageHeight: 180,
        isGradient: true,
        bgColor: '#005C97',
        gradientColor1: '#005C97',
        gradientColor2: '#363795',
        gradientDirection: 'to right',
        placeholderImage: null,
        imageShape: 'original',
    });

    const handleTabChange = (newTab: 'custom' | 'prebuilt') => {
        if (newTab === activeTab) return;

        // Reset fields when switching modes
        if (newTab === 'prebuilt') {
            setFormData(prev => ({
                ...prev,
                title: '',
                description: '',
                primaryButtonLabel: '',
                primaryButtonLink: '',
                enableSecondaryButton: false,
                secondaryButtonLabel: '',
                secondaryButtonLink: '',
                customCSS: DEFAULT_CSS_TEMPLATE,
                image: null,
                file: null,
                isGradient: true,
                bgColor: '#005C97',
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
            data.append('startDate', formData.startDate ? new Date(formData.startDate).toISOString() : '');
            data.append('endDate', formData.endDate ? new Date(formData.endDate).toISOString() : '');
            data.append('targetUserType', formData.targetUserType.toUpperCase().replace(' ', '_'));
            data.append('customCss', formData.customCSS || '');

            // Design fields
            data.append('imageWidth', String(formData.imageWidth || 180));
            data.append('imageHeight', String(formData.imageHeight || 180));
            data.append('isGradient', String(formData.isGradient));
            data.append('bgColor', formData.bgColor || '#005C97');
            data.append('gradientColor1', formData.gradientColor1 || '#005C97');
            data.append('gradientColor2', formData.gradientColor2 || '#363795');
            data.append('gradientDirection', formData.gradientDirection || 'to right');
            data.append('mediaPosition', formData.mediaPosition || 'right');
            data.append('imageShape', formData.imageShape || 'original');

            if (formData.placeholderFile) {
                data.append('placeholderMedia', formData.placeholderFile);
            }

            await createBanner(data).unwrap();
            toast.success('Banner created successfully');
            router.push('/admin/support/banner');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to create banner');
            console.error('Create error:', error);
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