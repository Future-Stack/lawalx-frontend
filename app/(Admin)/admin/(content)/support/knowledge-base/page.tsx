'use client';

import React, { useState } from 'react';
import { Search, Eye, Plus, MoreVertical, FileText, User, HelpCircle, AlertTriangle, Users, Play, Edit, Trash2, Home, ChevronRight, Video, ChevronDown, Check, HomeIcon, UserCheck, VideoIcon, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CreateFAQModal, { FAQData } from '@/components/Admin/modals/CreateFAQModal';
import CreateVideoTutorialModal, { VideoTutorialData } from '@/components/Admin/modals/CreateVideoTutorialModal';
import DeleteConfirmationModal from '@/components/Admin/modals/DeleteConfirmationModal';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
    useGetAllFaqsAdminQuery,
    useGetFaqStatsQuery,
    useCreateFaqMutation,
    useUpdateFaqMutation,
    useDeleteFaqMutation,
    useGetAllVideoFaqsAdminQuery,
    useCreateVideoFaqMutation,
    useUpdateVideoFaqMutation,
    useDeleteVideoFaqMutation
} from '@/redux/api/admin/knowledgeBaseApi';
import { toast } from 'sonner';

// Helpers
const formatCategory = (cat: string) => {
    if (!cat) return '';
    const map: Record<string, string> = {
        'DEVICEMANAGEMENT': 'Device Management',
        'CONTENT_PLAYLIST': 'Content & Playlists',
        'SCHEDULE': 'Schedule',
        'BILLANDSUBCRIPTION': 'Billing & Subscriptions',
        'SUBCRIPTION': 'Subscription'
    };
    return map[cat] || cat;
};

const getVideoUrl = (url: string) => {
    if (!url) return '';

    // Direct file upload handling
    let cleanUrl = url.trim();
    if (cleanUrl.startsWith('/')) {
        cleanUrl = cleanUrl.substring(1);
    }

    if (cleanUrl.startsWith('uploads/')) {
        return `https://lawaltwo.sakibalhasa.xyz/${cleanUrl}`;
    }

    // YouTube handling
    if (cleanUrl.includes('youtube.com/watch?v=')) {
        const videoId = cleanUrl.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    if (cleanUrl.includes('youtu.be/')) {
        const videoId = cleanUrl.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
    }

    return cleanUrl;
};

// Video Player Modal Component
const VideoPlayerModal = ({ isOpen, onClose, videoUrl }: { isOpen: boolean, onClose: () => void, videoUrl: string }) => {
    if (!videoUrl) return null;

    const fullUrl = getVideoUrl(videoUrl);
    const isDirectFile = fullUrl.endsWith('.mp4') || fullUrl.endsWith('.webm') || fullUrl.includes('uploads/');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl bg-black border-none rounded-2xl p-0 overflow-hidden">
                <DialogTitle className="sr-only">Video Preview</DialogTitle>
                <div className="aspect-video w-full bg-black flex items-center justify-center">
                    {isDirectFile ? (
                        <video
                            src={fullUrl}
                            controls
                            autoPlay
                            className="w-full h-full"
                        />
                    ) : (
                        <iframe
                            src={fullUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </DialogContent>
        </Dialog>
    );
};

// Details Modal Component
const DetailsModal = ({ isOpen, onClose, data, type }: { isOpen: boolean, onClose: () => void, data: any, type: 'FAQ' | 'Video' }) => {
    if (!data) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-white dark:bg-cardBg border-none rounded-2xl p-6">
                <DialogHeader className="border-b border-border/50 pb-4 mb-4">
                    <DialogTitle className="text-xl font-bold text-headings">
                        {type === 'FAQ' ? 'FAQ Details' : 'Video Tutorial Details'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-1">{type === 'FAQ' ? 'Question' : 'Title'}</h4>
                        <p className="text-base font-semibold text-headings">{type === 'FAQ' ? data.question : data.title}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-1">{type === 'FAQ' ? 'Answer' : 'Description'}</h4>
                        <p className="text-sm text-headings whitespace-pre-wrap">{data.answer}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Category</h4>
                            <Badge variant="default" className="text-bgBlue border-bgBlue/30 bg-bgBlue/5">
                                {Array.isArray(data.category)
                                    ? data.category.map((c: string) => formatCategory(c)).join(', ')
                                    : formatCategory(data.category)}
                            </Badge>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Status</h4>
                            <Badge className={cn(
                                data.status === 'PUBLISHED' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-100 text-gray-600 border-gray-200",
                                "capitalize"
                            )}>
                                {data.status}
                            </Badge>
                        </div>
                    </div>
                    {type === 'Video' && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Video Source</h4>
                            {data.videoLink ? (
                                <a href={data.videoLink} target="_blank" rel="noopener noreferrer" className="text-bgBlue hover:underline text-sm break-all">
                                    {data.videoLink}
                                </a>
                            ) : data.uploadVideo ? (
                                <p className="text-sm text-headings">Uploaded Video: {data.uploadVideo}</p>
                            ) : (
                                <p className="text-sm text-muted italic">No video source provided</p>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Created At</h4>
                            <p className="text-xs text-muted">{new Date(data.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-1">Total Views</h4>
                            <p className="text-sm font-semibold text-headings">{data.totalView || 0}</p>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <Button onClick={onClose} className="bg-bgBlue hover:bg-blue-600 text-white rounded-xl px-8 cursor-pointer">Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function KnowledgeBase() {
    const [activeTab, setActiveTab] = useState<'FAQs' | 'Video Tutorial'>('FAQs');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All Status' | 'DRAFT' | 'PUBLISHED'>('All Status');
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 10;

    // API Queries
    const { data: statsData } = useGetFaqStatsQuery(undefined);

    const faqParams = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        status: statusFilter === 'All Status' ? undefined : statusFilter,
    };
    const { data: faqsData, isLoading: isFaqsLoading } = useGetAllFaqsAdminQuery(faqParams, { skip: activeTab !== 'FAQs' });

    const videoParams = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        status: statusFilter === 'All Status' ? undefined : statusFilter,
    };
    const { data: videosData, isLoading: isVideosLoading } = useGetAllVideoFaqsAdminQuery(videoParams, { skip: activeTab !== 'Video Tutorial' });

    // Mutations
    const [createFaq, { isLoading: isCreatingFaq }] = useCreateFaqMutation();
    const [updateFaq, { isLoading: isUpdatingFaq }] = useUpdateFaqMutation();
    const [deleteFaq] = useDeleteFaqMutation();

    const [createVideoFaq, { isLoading: isCreatingVideo }] = useCreateVideoFaqMutation();
    const [updateVideoFaq, { isLoading: isUpdatingVideo }] = useUpdateVideoFaqMutation();
    const [deleteVideoFaq] = useDeleteVideoFaqMutation();

    // Modals
    const [isCreateFAQOpen, setIsCreateFAQOpen] = useState(false);
    const [isCreateVideoOpen, setIsCreateVideoOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<any>(null);
    const [editingVideo, setEditingVideo] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'FAQ' | 'Video' } | null>(null);
    const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean, data: any, type: 'FAQ' | 'Video' }>({ isOpen: false, data: null, type: 'FAQ' });
    const [videoToPlay, setVideoToPlay] = useState<{ isOpen: boolean, url: string }>({ isOpen: false, url: '' });

    // Stats mapping
    const stats = [
        {
            label: 'Total FAQs',
            value: statsData?.textFaq?.thisMonth || 0,
            subtext: `${statsData?.textFaq?.percentageChange >= 0 ? '+' : ''}${statsData?.textFaq?.percentageChange}% From Last Month`,
            icon: UserCheck,
            trend: statsData?.textFaq?.percentageChange >= 0 ? 'up' : 'down'
        },
        {
            label: 'Total Video Tutorials',
            value: statsData?.videoFaq?.thisMonth || 0,
            subtext: `${statsData?.videoFaq?.percentageChange >= 0 ? '+' : ''}${statsData?.videoFaq?.percentageChange}% From Last Month`,
            icon: VideoIcon,
            trend: statsData?.videoFaq?.percentageChange >= 0 ? 'up' : 'down'
        },
    ];

    const currentItems = activeTab === 'FAQs' ? faqsData?.items || [] : videosData?.items || [];
    const meta = activeTab === 'FAQs' ? faqsData?.meta : videosData?.meta;
    const totalPages = meta?.totalPages || 1;
    const totalItems = meta?.total || 0;

    // Handlers
    const handleSaveFAQ = async (data: any) => {
        try {
            const payload = {
                question: data.question,
                answer: data.answer,
                category: [data.category],
                status: data.status.toUpperCase()
            };

            if (data.id) {
                await updateFaq({ id: data.id, data: payload }).unwrap();
                toast.success('FAQ updated successfully');
            } else {
                await createFaq(payload).unwrap();
                toast.success('FAQ created successfully');
            }
            setEditingFAQ(null);
            setIsCreateFAQOpen(false);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to save FAQ');
        }
    };

    const handleSaveVideo = async (data: any) => {
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('answer', data.description);
            formData.append('category', data.category);
            formData.append('status', data.status.toUpperCase());

            if (data.videoType === 'Link') {
                formData.append('videoLink', data.videoSource);
                formData.append('uploadVideo', '');
            } else {
                if (data.file) {
                    formData.append('uploadVideo', data.file);
                }
                formData.append('videoLink', '');
            }

            if (data.id) {
                await updateVideoFaq({ id: data.id, data: formData }).unwrap();
                toast.success('Video Tutorial updated successfully');
            } else {
                await createVideoFaq(formData).unwrap();
                toast.success('Video Tutorial created successfully');
            }
            setEditingVideo(null);
            setIsCreateVideoOpen(false);
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to save Video Tutorial');
        }
    };

    const handleDeleteClick = (id: string, type: 'FAQ' | 'Video') => {
        setItemToDelete({ id, type });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (itemToDelete) {
            try {
                if (itemToDelete.type === 'FAQ') {
                    await deleteFaq(itemToDelete.id).unwrap();
                    toast.success('FAQ deleted successfully');
                } else {
                    await deleteVideoFaq(itemToDelete.id).unwrap();
                    toast.success('Video Tutorial deleted successfully');
                }
                setIsDeleteModalOpen(false);
                setItemToDelete(null);
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to delete item');
            }
        }
    };

    const handleEdit = (item: any) => {
        if (activeTab === 'FAQs') {
            setEditingFAQ({
                ...item,
                category: Array.isArray(item.category) ? item.category[0] : item.category,
                status: item.status === 'PUBLISHED' ? 'Published' : 'Draft'
            });
            setIsCreateFAQOpen(true);
        } else {
            setEditingVideo({
                ...item,
                description: item.answer,
                videoType: item.videoLink ? 'Link' : 'Upload',
                videoSource: item.videoLink || item.uploadVideo,
                category: Array.isArray(item.category) ? item.category[0] : item.category,
                status: item.status === 'PUBLISHED' ? 'Published' : 'Draft'
            });
            setIsCreateVideoOpen(true);
        }
    };

    const getStatusStyle = (status: string) => {
        if (status === 'PUBLISHED') return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'; // DRAFT
    };


    return (
        <div className="min-h-screen">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6">
                <Link href="/admin/dashboard">
                    <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span>Customer Supports</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-bgBlue font-medium">Knowledge Base</span>
            </div>

            {/* Header */}
            <div className="border-b border-border pb-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base Management</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage customer support tickets and resolve issues</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="h-10 px-4 bg-bgBlue hover:bg-blue-600 text-white rounded-lg shadow-customShadow font-medium flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    Create
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => { setEditingFAQ(null); setIsCreateFAQOpen(true); }}>
                                    Create FAQ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setEditingVideo(null); setIsCreateVideoOpen(true); }}>
                                    Create Video Tutorial
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-navbarBg border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn("p-2 rounded-lg border",
                                stat.icon === AlertTriangle ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30" : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                            )}>
                                <stat.icon className={cn("w-5 h-5", stat.icon === AlertTriangle ? "text-red-500" : "text-gray-600 dark:text-gray-400")} />
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</span>
                        </div>
                        <div className={cn("text-3xl font-bold mb-1", stat.icon === AlertTriangle ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white")}>{stat.value}</div>
                        <div className="flex items-center gap-1">
                            <span className={cn("text-xs font-medium",
                                stat.trend === 'up' ? "text-green-500" :
                                    stat.trend === 'down' ? "text-red-500" :
                                        stat.trend === 'warn' ? "text-gray-500" : "text-gray-500"
                            )}>
                                {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : ''}
                            </span>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{stat.subtext}</p>
                        </div>

                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-navbarBg rounded-full border border-border p-1.5 mb-6 inline-flex gap-2 overflow-x-auto max-w-full scrollbar-hide">
                <button
                    onClick={() => setActiveTab('FAQs')}
                    className={cn(
                        "px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2",
                        activeTab === 'FAQs'
                            ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-customShadow ring-1 ring-black/5 dark:ring-white/10"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                >
                    <HelpCircle className="w-4 h-4" />
                    FAQs
                </button>
                <button
                    onClick={() => setActiveTab('Video Tutorial')}
                    className={cn(
                        "px-4 py-2 text-sm rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2",
                        activeTab === 'Video Tutorial'
                            ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-customShadow ring-1 ring-black/5 dark:ring-white/10"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                >
                    <Video className="w-4 h-4" />
                    Video Tutorial
                </button>
            </div>

            <div className="px-1 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                {totalItems} {activeTab === 'FAQs' ? 'FAQs' : 'Video Tutorials'}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex gap-2 p-2 dark:bg-navbarBg justify-between items-center w-full border border-border rounded-2xl p-1">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title or question"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 h-11 text-sm bg-navbarBg border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-headings dark:text-white"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <Select value={statusFilter} onValueChange={(value: any) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}>
                        <SelectTrigger className="w-[140px] h-11 rounded-xl text-xs bg-navbarBg border-border text-headings dark:text-white">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All Status">All Status</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>


            {/* Table */}
            <div className="bg-navbarBg rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#FFFFFF] dark:bg-gray-800/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-1/2">
                                    {activeTab === 'FAQs' ? 'Question' : 'Title'}
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Views</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Category</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {currentItems.map((item: any) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setDetailsModal({ isOpen: true, data: item, type: activeTab === 'FAQs' ? 'FAQ' : 'Video' })}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            {/* Thumbnail placeholder for video */}
                                            {activeTab === 'Video Tutorial' && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVideoToPlay({ isOpen: true, url: item.videoLink || item.uploadVideo });
                                                    }}
                                                    className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors group/play"
                                                >
                                                    <Play className="w-5 h-5 text-gray-500 group-hover/play:text-bgBlue transition-colors fill-current opacity-0 group-hover/play:opacity-100 absolute" />
                                                    <VideoIcon className="w-5 h-5 text-gray-400 group-hover/play:opacity-0 transition-opacity" />
                                                </div>
                                            )}
                                            <div className="max-w-xl">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                    {activeTab === 'FAQs' ? item.question : item.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {activeTab === 'FAQs' ? item.answer : item.answer}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {item.totalView || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={cn("rounded-full px-3 py-0.5 font-medium text-xs border uppercase", getStatusStyle(item.status))}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-3 py-0.5">
                                            {Array.isArray(item.category)
                                                ? formatCategory(item.category[0])
                                                : formatCategory(item.category)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDetailsModal({ isOpen: true, data: item, type: activeTab === 'FAQs' ? 'FAQ' : 'Video' });
                                                }}
                                                className="p-2 text-gray-400 hover:text-bgBlue dark:hover:text-blue-400 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(item);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(item.id, activeTab === 'FAQs' ? 'FAQ' : 'Video');
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isFaqsLoading && !isVideosLoading && currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {currentItems.length} of {totalItems} items
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>



            {/* Modals */}
            <CreateFAQModal
                isOpen={isCreateFAQOpen}
                onClose={() => setIsCreateFAQOpen(false)}
                onSave={handleSaveFAQ}
                initialData={editingFAQ}
                isSaving={isCreatingFaq || isUpdatingFaq}
            />

            <CreateVideoTutorialModal
                isOpen={isCreateVideoOpen}
                onClose={() => setIsCreateVideoOpen(false)}
                onSave={handleSaveVideo}
                initialData={editingVideo}
                isSaving={isCreatingVideo || isUpdatingVideo}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${itemToDelete?.type}`}
                description={`Are you sure you want to delete this ${itemToDelete?.type === 'FAQ' ? 'FAQ' : 'video tutorial'}? This action cannot be undone.`}
            />

            <DetailsModal
                isOpen={detailsModal.isOpen}
                onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })}
                data={detailsModal.data}
                type={detailsModal.type}
            />

            <VideoPlayerModal
                isOpen={videoToPlay.isOpen}
                onClose={() => setVideoToPlay({ ...videoToPlay, isOpen: false })}
                videoUrl={videoToPlay.url}
            />

        </div >
    );
}






// export default function(){
//     return(
//         <>
//             <div className="text-black dark:text-white text-2xl font-semibold">Knowledge Base page</div>
//         </>
//     )
// }