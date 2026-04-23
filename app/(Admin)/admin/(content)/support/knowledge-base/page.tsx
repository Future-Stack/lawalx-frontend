'use client';

import React, { useState } from 'react';
import { Search, Eye, Plus, MoreVertical, FileText, User, HelpCircle, AlertTriangle, Users, Play, Edit, Trash2, Home, ChevronRight, Video, ChevronDown, Check, HomeIcon, UserCheck, VideoIcon } from 'lucide-react';
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
import CreateFAQModal, { FAQData } from '@/components/Admin/modals/CreateFAQModal';
import CreateVideoTutorialModal, { VideoTutorialData } from '@/components/Admin/modals/CreateVideoTutorialModal';
import DeleteConfirmationModal from '@/components/Admin/modals/DeleteConfirmationModal';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock Data
const mockStats = [
    { label: 'Total FAQs', value: '1,100', subtext: '-8.2 % From Last Month', icon: UserCheck, trend: 'down' },
    { label: 'Total Video Tutorials', value: '1,100', subtext: '+8.2 % From Last Month', icon: VideoIcon, trend: 'up' },
];

const mockFAQs: FAQData[] = [
    { id: '1', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Device', status: 'Draft' as const },
    { id: '2', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Content', status: 'Published' as const },
    { id: '3', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Account', status: 'Published' as const },
    { id: '4', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Subscription', status: 'Draft' as const },
    { id: '5', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Device', status: 'Published' as const },
    { id: '6', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Subscription', status: 'Draft' as const },
    { id: '7', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Device', status: 'Published' as const },
    { id: '8', question: 'How do I reset my password?', answer: 'To reset your password, click on "Forgot Password" on the login page and follow the instructions sent to your email.', category: 'Subscription', status: 'Draft' as const },
];

const mockVideos: VideoTutorialData[] = [
    { id: '1', title: 'How do I reset my password?', description: 'To reset your password...', category: 'Device', status: 'Draft' as const, videoType: 'Upload', videoSource: 'video.mp4' },
    { id: '2', title: 'How do I reset my password?', description: 'To reset your password...', category: 'Content', status: 'Published' as const, videoType: 'Link', videoSource: 'https://youtube.com/...' },
    { id: '3', title: 'How do I reset my password?', description: 'To reset your password...', category: 'Account', status: 'Published' as const, videoType: 'Link', videoSource: 'https://youtube.com/...' },
];

export default function KnowledgeBase() {
    const [activeTab, setActiveTab] = useState<'FAQs' | 'Video Tutorial'>('FAQs');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All Status' | 'Draft' | 'Published'>('All Status');

    // Data State
    const [faqs, setFaqs] = useState<FAQData[]>(mockFAQs);
    const [videos, setVideos] = useState<VideoTutorialData[]>(mockVideos);

    // Modals
    const [isCreateFAQOpen, setIsCreateFAQOpen] = useState(false);
    const [isCreateVideoOpen, setIsCreateVideoOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQData | null>(null);
    const [editingVideo, setEditingVideo] = useState<VideoTutorialData | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'FAQ' | 'Video' } | null>(null);

    // Pagination (Mocked)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;


    // Filtering
    const getData = () => activeTab === 'FAQs' ? faqs : videos;
    const filteredData = getData().filter((item: any) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (item.question || item.title).toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);


    // Handlers
    const handleSaveFAQ = (data: FAQData) => {
        if (data.id) {
            setFaqs(faqs.map(f => f.id === data.id ? data : f));
        } else {
            setFaqs([...faqs, { ...data, id: Date.now().toString() }]);
        }
        setEditingFAQ(null);
    };

    const handleSaveVideo = (data: VideoTutorialData) => {
        if (data.id) {
            setVideos(videos.map(v => v.id === data.id ? data : v));
        } else {
            setVideos([...videos, { ...data, id: Date.now().toString() }]);
        }
        setEditingVideo(null);
    };

    const handleDeleteClick = (id: string, type: 'FAQ' | 'Video') => {
        setItemToDelete({ id, type });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            if (itemToDelete.type === 'FAQ') {
                setFaqs(faqs.filter(f => f.id !== itemToDelete.id));
            } else {
                setVideos(videos.filter(v => v.id !== itemToDelete.id));
            }
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleEdit = (item: any) => {
        if (activeTab === 'FAQs') {
            setEditingFAQ(item);
            setIsCreateFAQOpen(true);
        } else {
            setEditingVideo(item);
            setIsCreateVideoOpen(true);
        }
    };

    const getStatusStyle = (status: string) => {
        if (status === 'Published') return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'; // Draft
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
                        <Link href="/admin/reports/customer-service-&-support-reports" className="text-nowrap px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors">
                            <Eye className="w-4 h-4" />
                            <span>View Reports</span>
                        </Link>
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
                {mockStats.map((stat, idx) => (
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
                12 Devices
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search devices by name, location, screen, ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 text-sm bg-navbarBg border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                    />
                </div>

                {/* Status Dropdown */}
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[120px] h-11 rounded-xl text-xs bg-navbarBg border-border">
                        <span className="text-gray-500">Status</span>
                        {/* <SelectValue placeholder="Status" /> */}
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All Status">All Status</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                    </SelectContent>
                </Select>
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
                            {paginatedData.map((item: any) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            {/* Thumbnail placeholder for video */}
                                            {activeTab === 'Video Tutorial' && (
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                                                    <Play className="w-4 h-4 text-gray-500" />
                                                </div>
                                            )}
                                            <div className="max-w-xl">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                                    {activeTab === 'FAQs' ? item.question : item.title}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {activeTab === 'FAQs' ? item.answer : item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {Math.floor(Math.random() * 50) + 10}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={cn("rounded-full px-3 py-0.5 font-medium text-xs border", getStatusStyle(item.status))}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-3 py-0.5">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(item.id, activeTab === 'FAQs' ? 'FAQ' : 'Video')}
                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Showing {Math.min(startIndex + 1, filteredData.length)} of {filteredData.length} items
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed"
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
            />

            <CreateVideoTutorialModal
                isOpen={isCreateVideoOpen}
                onClose={() => setIsCreateVideoOpen(false)}
                onSave={handleSaveVideo}
                initialData={editingVideo}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${itemToDelete?.type}`}
                description={`Are you sure you want to delete this ${itemToDelete?.type === 'FAQ' ? 'FAQ' : 'video tutorial'}? This action cannot be undone.`}
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