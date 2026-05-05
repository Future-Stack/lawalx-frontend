'use client';

import React, { useState } from 'react';
import { Upload, HelpCircle, Calendar, ChevronDown, Square, Circle, Hexagon, Star, Diamond, Triangle } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface BannerFormData {
    bannerType: string;
    title: string;
    description: string;
    image: string | null;
    file?: File | null;
    primaryButtonLabel: string;
    primaryButtonLink: string;
    enableSecondaryButton: boolean;
    secondaryButtonLabel: string;
    secondaryButtonLink: string;
    startDate: string;
    endDate: string;
    targetUserType: string;
    primaryButtonIcon?: string;
    secondaryButtonIcon?: string;
    status: string;
    // New design fields
    mediaWidth?: number;
    mediaHeight?: number;
    backgroundStyle?: 'SOLID' | 'GRADIENT';
    backgroundColor1?: string;
    backgroundColor2?: string;
    backgroundDirection?: string;
    placeholderImage?: string | null;
    placeholderFile?: File | null;
    mediaPosition?: 'LEFT' | 'RIGHT';
    mediaShape?: string;
    // Prebuilt specific
    uploadBannerFile?: File | null;
    bannerLinkRedirectURL?: string;
}

const AVAILABLE_ICONS = [
    'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ChevronRight', 'ChevronLeft',
    'Plus', 'Minus', 'Check', 'X', 'Search', 'Settings', 'User', 'Mail', 'Bell', 'Calendar', 'Clock', 'Home', 'Info', 'HelpCircle',
    'Star', 'Heart', 'ThumbsUp', 'ThumbsDown', 'Eye', 'EyeOff', 'Lock', 'Unlock', 'Trash', 'Edit',
    'ExternalLink', 'Link', 'Download', 'Upload', 'Share', 'Copy', 'Play', 'Pause', 'Square', 'Circle',
    'Zap', 'Gift', 'ShoppingBag', 'ShoppingCart', 'CreditCard', 'DollarSign', 'Percent', 'Tag', 'Bookmark',
    'Menu', 'Filter', 'Grid', 'List', 'LogOut', 'LogIn', 'RefreshCw'
];

interface BannerFormProps {
    data: BannerFormData;
    onChange: (data: BannerFormData) => void;
    mode: 'custom' | 'prebuilt';
}

export default function BannerForm({ data, onChange, mode }: BannerFormProps) {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (field: keyof BannerFormData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange({
                    ...data,
                    file: file,
                    image: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-navbarBg rounded-xl shadow-sm border border-border p-6 h-full overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Banner Configuration</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configure your banner content and appearance</p>

            <div className="space-y-6">
                {/* 1. Global Metadata (Type, Status, Target) - Always Shown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Type</label>
                        <Select value={data.bannerType} onValueChange={(val) => handleChange('bannerType', val)}>
                            <SelectTrigger className="w-full bg-navbarBg border-border">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="bg-navbarBg border-border">
                                <SelectItem value="Upload">Upload</SelectItem>
                                <SelectItem value="Announcement">Announcement</SelectItem>
                                <SelectItem value="Promotion">Promotion</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <Select value={data.status} onValueChange={(val) => handleChange('status', val)}>
                            <SelectTrigger className="w-full bg-navbarBg border-border">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-navbarBg border-border">
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Paused">Paused</SelectItem>
                                <SelectItem value="Ended">Ended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Targeted User</label>
                        <Select value={data.targetUserType} onValueChange={(val) => handleChange('targetUserType', val)}>
                            <SelectTrigger className="w-full bg-navbarBg border-border">
                                <SelectValue placeholder="Select target users" />
                            </SelectTrigger>
                            <SelectContent className="bg-navbarBg border-border">
                                <SelectItem value="ALL_USERS">All Users</SelectItem>
                                <SelectItem value="STARTER">Starter</SelectItem>
                                <SelectItem value="BUSINESS">Business</SelectItem>
                                <SelectItem value="FREE_TRIAL">Free Trial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 2. Content (Title, Description) - Now for both modes */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Download Our Mobile App"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Check out our new advanced analytics dashboard"
                        />
                    </div>
                </div>

                {mode === 'custom' ? (
                    <>

                        {/* 3. Background Style */}
                        <div className="space-y-4 p-4 border border-border rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Background Style</label>
                                <div className="flex bg-navbarBg border border-border rounded-lg p-1 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleChange('backgroundStyle', 'SOLID')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${data.backgroundStyle !== 'GRADIENT' ? 'bg-bgBlue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        Solid
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('backgroundStyle', 'GRADIENT')}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${data.backgroundStyle === 'GRADIENT' ? 'bg-bgBlue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                    >
                                        Gradient
                                    </button>
                                </div>
                            </div>

                            {data.backgroundStyle !== 'GRADIENT' ? (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Background Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={data.backgroundColor1 || '#005C97'}
                                            onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                            className="w-10 h-10 p-1 bg-navbarBg border border-border rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={data.backgroundColor1 || '#005C97'}
                                            onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                            className="flex-1 px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Color 1</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={data.backgroundColor1 || '#005C97'}
                                                    onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                                    className="w-8 h-8 p-1 bg-navbarBg border border-border rounded-lg cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.backgroundColor1 || '#005C97'}
                                                    onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                                    className="flex-1 px-2 py-1 bg-navbarBg border border-border rounded-lg text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Color 2</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={data.backgroundColor2 || '#363795'}
                                                    onChange={(e) => handleChange('backgroundColor2', e.target.value)}
                                                    className="w-8 h-8 p-1 bg-navbarBg border border-border rounded-lg cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.backgroundColor2 || '#363795'}
                                                    onChange={(e) => handleChange('backgroundColor2', e.target.value)}
                                                    className="flex-1 px-2 py-1 bg-navbarBg border border-border rounded-lg text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Direction</label>
                                        <Select value={data.backgroundDirection || 'to right'} onValueChange={(val) => handleChange('backgroundDirection', val)}>
                                            <SelectTrigger className="w-full bg-navbarBg border-border h-9 text-xs">
                                                <SelectValue placeholder="Select direction" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-navbarBg border-border">
                                                <SelectItem value="to right">Left to Right</SelectItem>
                                                <SelectItem value="to left">Right to Left</SelectItem>
                                                <SelectItem value="to bottom">Top to Bottom</SelectItem>
                                                <SelectItem value="to top">Bottom to Top</SelectItem>
                                                <SelectItem value="to bottom right">Top Left to Bottom Right</SelectItem>
                                                <SelectItem value="to bottom left">Top Right to Bottom Left</SelectItem>
                                                <SelectItem value="to top right">Bottom Left to Top Right</SelectItem>
                                                <SelectItem value="to top left">Bottom Right to Top Left</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. Media Upload & Dimensions */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banner Media</label>
                            <div
                                className="border-2 border-dashed border-bgBlue bg-navbarBg rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleImageUpload} />
                                {data.image ? (
                                    data.image.startsWith('data:video/') || data.image.match(/\.(mp4|webm|ogg)$/i) || data.file?.type.startsWith('video/') ? (
                                        <video src={data.image} className="max-h-24 mb-3 rounded" controls />
                                    ) : (
                                        <img src={data.image} alt="Preview" className="max-h-24 mb-3 rounded" />
                                    )
                                ) : (
                                    <div className="w-10 h-10 bg-navbarBg rounded-lg shadow-sm flex items-center justify-center mb-3 border border-border">
                                        <Upload className="w-5 h-5 text-gray-400" />
                                    </div>
                                )}
                                <p className="text-sm font-medium text-blue-500">Click to Upload Media</p>
                                <p className="text-xs text-gray-400">SVG, PNG, JPG, MP4 or WebM</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Width (px)</label>
                                    <input
                                        type="number"
                                        value={data.mediaWidth || 180}
                                        onChange={(e) => handleChange('mediaWidth', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Height (px)</label>
                                    <input
                                        type="number"
                                        value={data.mediaHeight || 180}
                                        onChange={(e) => handleChange('mediaHeight', parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            {/* Media Position */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Media Position</label>
                                <div className="flex p-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-border w-max gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleChange('mediaPosition', 'LEFT')}
                                        className={`px-4 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                            data.mediaPosition === 'LEFT'
                                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-border'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        Left Side
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('mediaPosition', 'RIGHT')}
                                        className={`px-4 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                                            (data.mediaPosition === 'RIGHT' || !data.mediaPosition)
                                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-border'
                                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    >
                                        Right Side
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5">Choose which side the image/video should appear on</p>
                            </div>

                            {/* Media Shape */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Media Shape</label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {[
                                        { id: 'original', icon: Square, label: 'Original' },
                                        { id: 'circle', icon: Circle, label: 'Circle' },
                                        { id: 'star', icon: Star, label: 'Star' },
                                        { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
                                        { id: 'diamond', icon: Diamond, label: 'Diamond' },
                                        { id: 'triangle', icon: Triangle, label: 'Triangle' },
                                    ].map((shape) => (
                                        <button
                                            key={shape.id}
                                            type="button"
                                            onClick={() => handleChange('mediaShape', shape.id)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                                (data.mediaShape?.toLowerCase() === shape.id || (!data.mediaShape && shape.id === 'original'))
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'bg-white dark:bg-gray-800/50 border-border text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        >
                                            <shape.icon className="w-4 h-4 mb-1" />
                                            <span className="text-[10px] font-medium">{shape.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5">Apply a visual shape/mask to your media</p>
                            </div>
                        </div>

                        {/* 5. Buttons */}
                        <div className="space-y-4">
                            <div className="p-4 border border-border rounded-xl space-y-4">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Primary Button</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={data.primaryButtonLabel}
                                        onChange={(e) => handleChange('primaryButtonLabel', e.target.value)}
                                        className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                        placeholder="Button Label"
                                    />
                                    <Select value={data.primaryButtonIcon} onValueChange={(val) => handleChange('primaryButtonIcon', val)}>
                                        <SelectTrigger className="w-full bg-navbarBg border-border text-sm h-9">
                                            <SelectValue placeholder="Icon" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-navbarBg border-border max-h-[200px]">
                                            <SelectItem value="none">No Icon</SelectItem>
                                            {AVAILABLE_ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <input
                                    type="text"
                                    value={data.primaryButtonLink}
                                    onChange={(e) => handleChange('primaryButtonLink', e.target.value)}
                                    className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                    placeholder="https://link.com"
                                />
                            </div>

                            <div className="p-4 border border-border rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Secondary Button</label>
                                    <div
                                        className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${data.enableSecondaryButton ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                        onClick={() => handleChange('enableSecondaryButton', !data.enableSecondaryButton)}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${data.enableSecondaryButton ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                                {data.enableSecondaryButton && (
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={data.secondaryButtonLabel}
                                                onChange={(e) => handleChange('secondaryButtonLabel', e.target.value)}
                                                className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                                placeholder="Button Label"
                                            />
                                            <Select value={data.secondaryButtonIcon} onValueChange={(val) => handleChange('secondaryButtonIcon', val)}>
                                                <SelectTrigger className="w-full bg-navbarBg border-border text-sm h-9">
                                                    <SelectValue placeholder="Icon" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-navbarBg border-border max-h-[200px]">
                                                    <SelectItem value="none">No Icon</SelectItem>
                                                    {AVAILABLE_ICONS.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.secondaryButtonLink}
                                            onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
                                            className="w-full px-3 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                            placeholder="https://link.com"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* 6. Scheduling */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        value={data.startDate}
                                        onChange={(e) => handleChange('startDate', e.target.value)}
                                        onClick={(e) => (e.target as any).showPicker?.()}
                                        className="w-full px-4 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                                <div className="relative group">
                                    <input
                                        type="date"
                                        value={data.endDate}
                                        onChange={(e) => handleChange('endDate', e.target.value)}
                                        onClick={(e) => (e.target as any).showPicker?.()}
                                        className="w-full px-4 py-2 bg-navbarBg border border-border rounded-lg text-sm"
                                    />
                                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Prebuilt Mode Specifics */}
                        <div className="space-y-6">
                            {/* Upload Banner Placeholder (Now the main banner in prebuilt) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Banner</label>
                                <div 
                                    className="border-2 border-dashed border-bgBlue bg-navbarBg rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*,video/*';
                                        input.onchange = (e) => {
                                            const file = (e.target as any).files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    onChange({ ...data, uploadBannerFile: file, image: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        };
                                        input.click();
                                    }}
                                >
                                    {data.image ? (
                                        data.image.startsWith('data:video/') || data.image.match(/\.(mp4|webm|ogg)$/i) || data.file?.type.startsWith('video/') ? (
                                            <video src={data.image} className="max-h-40 mb-3 rounded shadow-sm" controls />
                                        ) : (
                                            <img src={data.image} alt="Banner" className="max-h-40 mb-3 rounded shadow-sm" />
                                        )
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 border border-border">
                                            <Upload className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    <p className="text-sm font-medium text-blue-500">Click to Upload Banner Image/Video</p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs text-gray-400">In prebuilt mode, this image will be the entire banner</p>
                                        <p className="text-[10px] text-bgBlue font-medium">Recommended: 1920x600px (Desktop) or 1080x1080px (Square)</p>
                                        <p className="text-[10px] text-gray-400 italic">High quality JPG/PNG or MP4 recommended for best view</p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Link (Prebuilt) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Link (Redirect URL)</label>
                                <input
                                    type="text"
                                    value={data.bannerLinkRedirectURL}
                                    onChange={(e) => handleChange('bannerLinkRedirectURL', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    placeholder="https://example.com/promotion"
                                />
                                <p className="text-xs text-gray-400 mt-1.5">Users will be redirected to this URL when clicking the banner</p>
                            </div>

                            {/* Scheduling (Start Date for Prebuilt) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                                    <div className="relative group">
                                        <input
                                            type="date"
                                            value={data.startDate}
                                            onChange={(e) => handleChange('startDate', e.target.value)}
                                            onClick={(e) => (e.target as any).showPicker?.()}
                                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg text-sm"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                                    <div className="relative group">
                                        <input
                                            type="date"
                                            value={data.endDate}
                                            onChange={(e) => handleChange('endDate', e.target.value)}
                                            onClick={(e) => (e.target as any).showPicker?.()}
                                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg text-sm"
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}