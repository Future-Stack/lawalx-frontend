'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Code, Home, HomeIcon, LayoutTemplate, Loader2 } from 'lucide-react';
import BannerForm, { BannerFormData } from '@/components/Admin/support/Banner/BannerForm';
import BannerPreview from '@/components/Admin/support/Banner/BannerPreview';
import { useParams, useRouter } from 'next/navigation';
import { useGetBannerByIdQuery, useUpdateBannerMutation } from '@/redux/api/admin/bannerApi';
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

export default function EditBannerPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const { data: banner, isLoading: isFetching } = useGetBannerByIdQuery(id as string, { skip: !id });
    const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

    const [activeTab, setActiveTab] = useState<'prebuilt' | 'custom'>('prebuilt');
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
        customCSS: DEFAULT_CSS_TEMPLATE,
        primaryButtonIcon: '',
        secondaryButtonIcon: '',
        status: 'Draft',
    });

    const formatValue = (val: string) => {
        if (!val) return '';
        return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
    };

    useEffect(() => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '') || '';
        if (banner) {
            setFormData({
                bannerType: banner.type ? formatValue(banner.type) : 'Upload',
                title: banner.title || '',
                description: banner.description || '',
                image: banner.mediaUrl ? (banner.mediaUrl.startsWith('http') ? banner.mediaUrl : `${baseUrl}/${banner.mediaUrl}`) : null,
                primaryButtonLabel: banner.primaryButtonLabel || '',
                primaryButtonLink: banner.primaryButtonUrl || '',
                enableSecondaryButton: banner.secondaryButtonEnabled || false,
                secondaryButtonLabel: banner.secondaryButtonLabel || '',
                secondaryButtonLink: banner.secondaryButtonUrl || '',
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
                targetUserType: banner.targetUserType || 'ALL_USERS',
                customCSS: banner.customCss || DEFAULT_CSS_TEMPLATE,
                primaryButtonIcon: banner.primaryButtonIcon || '',
                secondaryButtonIcon: banner.secondaryButtonIcon || '',
                status: banner.status ? formatValue(banner.status) : 'Draft',
            });
        }
    }, [banner]);

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

            await updateBanner({ id: id as string, data }).unwrap();
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
                <div className="flex items-center gap-3">
                    {/* <button 
                        onClick={() => handleSave('DRAFT')}
                        disabled={isUpdating}
                        className="px-4 py-2 border border-border bg-navbarBg rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-customShadow cursor-pointer disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Draft'}
                    </button> */}
                    <button 
                        onClick={() => handleSave()}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-bgBlue hover:bg-bgBlue/80 dark:bg-bgBlue dark:hover:bg-bgBlue/80 text-white rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                    </button>
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
                            onClick={() => setActiveTab('prebuilt')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === 'prebuilt'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <LayoutTemplate className="w-4 h-4" />
                            Prebuilt Form
                        </button>
                        <button
                            onClick={() => setActiveTab('custom')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeTab === 'custom'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-customShadow'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Code className="w-4 h-4" />
                            Custom Code
                        </button>
                    </div>

                    {/* Form and Preview Split */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                        {/* Left Side: Form */}
                        <div className="lg:col-span-5 h-full overflow-hidden">
                            {activeTab === 'prebuilt' ? (
                                <BannerForm data={formData} onChange={setFormData} />
                            ) : (
                                <div className="bg-navbarBg rounded-xl shadow-sm border border-border p-6 h-full flex flex-col">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Custom CSS</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Add custom CSS to style your banner. Use classes like <code>.banner-container</code>, <code>.banner-title</code>, <code>.banner-desc</code>, <code>.primary-btn</code>, <code>.secondary-btn</code>.
                                    </p>
                                    <textarea
                                        className="flex-1 w-full p-4 bg-navbarBg text-blue-400 font-mono text-sm rounded-lg focus:outline-none resize-none border border-border scrollbar-hide"
                                        placeholder=".banner-title { color: #ff0000; }"
                                        value={formData.customCSS}
                                        onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right Side: Preview */}
                        <div className="lg:col-span-7 h-full overflow-hidden">
                            <BannerPreview data={formData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
