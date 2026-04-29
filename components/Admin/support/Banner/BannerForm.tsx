'use client';

import React, { useState } from 'react';
import { Upload, HelpCircle, Calendar, ChevronDown } from 'lucide-react';
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
    customCSS?: string;
    primaryButtonIcon?: string;
    secondaryButtonIcon?: string;
    status: string;
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
}

export default function BannerForm({ data, onChange }: BannerFormProps) {
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Type</label>
                    <Select value={data.bannerType} onValueChange={(val) => handleChange('bannerType', val)}>
                        <SelectTrigger className="w-full bg-navbarBg border-border">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                            <SelectItem value="Ended">Ended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Title */}
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

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Check out our new advanced analytics dashboard"
                    />
                </div>

                {/* Upload Video/Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Video/Image</label>
                    <div
                        className="border-2 border-dashed border-bgBlue bg-navbarBg rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        {data.image ? (
                            <img src={data.image} alt="Preview" className="max-h-32 mb-3 rounded" />
                        ) : (
                            <div className="w-10 h-10 bg-navbarBg rounded-lg shadow-sm flex items-center justify-center mb-3 border border-border">
                                <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            </div>
                        )}
                        <p className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-1">
                            Click to Upload <span className="text-gray-500 dark:text-gray-400 font-normal">or drag and drop</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">SVG, PNG, or JPG (Max 800 x 800px)</p>
                    </div>
                </div>

                {/* Primary Button */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Button Label</label>
                    <input
                        type="text"
                        value={data.primaryButtonLabel}
                        onChange={(e) => handleChange('primaryButtonLabel', e.target.value)}
                        className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Get Started"
                    />

                    {/* Icon Picker for Primary Button */}
                    <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Button Icon (Optional)</label>
                        <Select value={data.primaryButtonIcon} onValueChange={(val) => handleChange('primaryButtonIcon', val)}>
                            <SelectTrigger className="w-full bg-navbarBg border-border">
                                <SelectValue placeholder="No Icon" />
                            </SelectTrigger>
                            <SelectContent className="bg-navbarBg border-border max-h-[250px] overflow-y-auto">
                                <SelectItem value="none">No Icon</SelectItem>
                                {AVAILABLE_ICONS.map((icon) => (
                                    <SelectItem key={icon} value={icon} className="cursor-pointer">{icon}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            value={data.primaryButtonLink}
                            onChange={(e) => handleChange('primaryButtonLink', e.target.value)}
                            className="w-full px-4 pr-10 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="https://example.com"
                        />
                        <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    </div>
                </div>

                {/* Secondary Button Toggle */}
                <div className="flex items-center gap-2">
                    <div
                        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${data.enableSecondaryButton ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        onClick={() => handleChange('enableSecondaryButton', !data.enableSecondaryButton)}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${data.enableSecondaryButton ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Secondary Button</span>
                </div>

                {data.enableSecondaryButton && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Secondary Button Label</label>
                        <input
                            type="text"
                            value={data.secondaryButtonLabel}
                            onChange={(e) => handleChange('secondaryButtonLabel', e.target.value)}
                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Learn More"
                        />
                        {/* Icon Picker for Secondary Button */}
                        <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Button Icon (Optional)</label>
                            <Select value={data.secondaryButtonIcon} onValueChange={(val) => handleChange('secondaryButtonIcon', val)}>
                                <SelectTrigger className="w-full bg-navbarBg border-border">
                                    <SelectValue placeholder="No Icon" />
                                </SelectTrigger>
                                <SelectContent className="bg-navbarBg border-border max-h-[250px] overflow-y-auto">
                                    <SelectItem value="none">No Icon</SelectItem>
                                    {AVAILABLE_ICONS.map((icon) => (
                                        <SelectItem key={icon} value={icon} className="cursor-pointer">{icon}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={data.secondaryButtonLink}
                                onChange={(e) => handleChange('secondaryButtonLink', e.target.value)}
                                className="w-full px-4 pr-10 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="https://example.com/learn"
                            />
                            <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        </div>
                    </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <div className="relative group">
                        <input
                            type="date"
                            value={data.startDate}
                            onChange={(e) => handleChange('startDate', e.target.value)}
                            onClick={(e) => (e.target as any).showPicker?.()}
                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none group-hover:text-bgBlue transition-colors" />
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
                            className="w-full px-4 py-2.5 bg-navbarBg border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none group-hover:text-bgBlue transition-colors" />
                    </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Target User Type</label>
                    <Select value={data.targetUserType} onValueChange={(val) => handleChange('targetUserType', val)}>
                        <SelectTrigger className="w-full bg-navbarBg border-border">
                            <SelectValue placeholder="Select target users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Users">All Users</SelectItem>
                            <SelectItem value="New Users">New Users</SelectItem>
                            <SelectItem value="Premium Users">Premium Users</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}