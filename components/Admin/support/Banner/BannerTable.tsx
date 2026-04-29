'use client';

import { Search, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/Admin/modals/DeleteConfirmationModal';
import BannerPreview from './BannerPreview';
import { BannerFormData } from './BannerForm';
import { Edit, Trash2 } from 'lucide-react';
import { useDeleteBannerMutation, useGetAllBannersAdminQuery, useGetBannerCountQuery } from '@/redux/api/admin/bannerApi';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const normalizeValue = (val: string) => {
    if (!val) return 'null';
    if (val === 'UPLOAD') return 'Promotion';
    return val.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const getStatusColor = (status: string) => {
    const s = normalizeValue(status);
    switch (s) {
        case 'Active':
            return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
        case 'Ended':
            return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
        case 'Paused':
            return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
        case 'Draft':
            return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
};

const getTypeColor = (type: string) => {
    const t = normalizeValue(type);
    switch (t) {
        case 'Promotion':
        case 'Upload':
            return 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-800';
        case 'Announcement':
            return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        case 'Warning':
            return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800';
        case 'Published':
            return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
        default:
            return 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700';
    }
};

const ITEMS_PER_PAGE = 10;

export default function BannerTable() {
    const { data: banners = [], isLoading, isError } = useGetAllBannersAdminQuery({});
    const { data: countData } = useGetBannerCountQuery({});
    const [deleteBanner] = useDeleteBannerMutation();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [selectedBanner, setSelectedBanner] = useState<any | null>(null); // For details modal

    // Filter Logic
    const filteredBanners = (banners as any[]).filter((banner: any) => {
        const title = banner.title || '';
        const description = banner.description || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || banner.status === statusFilter.toUpperCase();
        return matchesSearch && matchesStatus;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBanners = filteredBanners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent row click
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;
        try {
            await deleteBanner(itemToDelete).unwrap();
            toast.success("Banner deleted successfully");
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (error) {
            toast.error("Failed to delete banner");
            console.error("Delete error:", error);
        }
    };

    const handleRowClick = (banner: any) => {
        setSelectedBanner(banner);
    };

    // Convert table row data to BannerFormData for preview (Mock conversion)
    const getPreviewData = (banner: any): BannerFormData => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '') || '';
        return {
            bannerType: banner.type || 'Upload',
            title: banner.title || 'null',
            description: banner.description || 'null',
            image: banner.mediaUrl ? (banner.mediaUrl.startsWith('http') ? banner.mediaUrl : `${baseUrl}/${banner.mediaUrl}`) : null,
            primaryButtonLabel: banner.primaryButtonLabel || 'null',
            primaryButtonLink: banner.primaryButtonUrl || '#',
            enableSecondaryButton: banner.secondaryButtonEnabled || false,
            secondaryButtonLabel: banner.secondaryButtonLabel || '',
            secondaryButtonLink: banner.secondaryButtonUrl || '',
            startDate: banner.startDate || 'null',
            endDate: banner.endDate || 'null',
            targetUserType: banner.targetUserType || 'All Users',
            customCSS: banner.customCss || '',
            primaryButtonIcon: banner.primaryButtonIcon || '',
            secondaryButtonIcon: banner.secondaryButtonIcon || '',
            status: banner.status || 'null',
        };
    };

    return (
        <>
            <div className="flex items-center mb-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Total Banners: {countData?.count || 0}</span>
                </div>
            </div>
            <div className="bg-navbarBg rounded-xl shadow-sm border border-border overflow-hidden">
                {/* Filter Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search banners by title, description..."
                                className="w-full pl-10 pr-4 py-4 border border-border bg-navbarBg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] border-border bg-navbarBg text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <SelectValue placeholder="All" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-navbarBg border-border">
                                <SelectItem value="All">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Paused">Paused</SelectItem>
                                <SelectItem value="Ended">Ended</SelectItem>
                            </SelectContent>
                        </Select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-navbarBg border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title & Description</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-navbarBg divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-bgBlue" />
                                    </td>
                                </tr>
                            ) : paginatedBanners.length > 0 ? (
                                paginatedBanners.map((banner: any) => (
                                    <tr
                                        key={banner.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => handleRowClick(banner)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{banner.title || 'null'}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{banner.description || 'null'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(banner.type)}`}>
                                                {normalizeValue(banner.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {banner.startDate ? new Date(banner.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'null'}
                                                        <span className="text-gray-400 mx-1">-</span>
                                                        {banner.endDate ? new Date(banner.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'null'}
                                                    </div>
                                                    <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                                                        {(() => {
                                                            if (!banner.startDate || !banner.endDate) return 'Duration null';
                                                            const start = new Date(banner.startDate);
                                                            const end = new Date(banner.endDate);
                                                            const diffTime = Math.abs(end.getTime() - start.getTime());
                                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                            return `${diffDays} Days Total`;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(banner.status)}`}>
                                                {normalizeValue(banner.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Link href={`/admin/support/banner/${banner.id}`}>
                                                    <button className="cursor-pointer text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" title="Edit">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    className="cursor-pointer text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    title="Delete"
                                                    onClick={(e) => handleDeleteClick(e, banner.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        {isError ? "Error loading banners." : "No banners found matching your filters."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-navbarBg">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, filteredBanners.length)}</span> of <span className="font-medium">{filteredBanners.length}</span> results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Banner Details Modal */}
            <Dialog open={!!selectedBanner} onOpenChange={(open) => !open && setSelectedBanner(null)}>
                <DialogContent className="max-w-5xl w-full p-0 bg-navbarBg border-border overflow-hidden rounded-xl">
                    <div className="h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-navbarBg">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBanner?.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Banner Details & Preview</p>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black/20">
                            {selectedBanner && (
                                <BannerPreview data={getPreviewData(selectedBanner)} />
                            )}
                        </div>
                        <div className="p-6 border-t border-border bg-navbarBg flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setSelectedBanner(null)} className="dark:border-gray-600 dark:text-gray-300">Close</Button>
                            <Link href={`/admin/support/banner/${selectedBanner?.id}`}>
                                <Button className="bg-bgBlue text-white hover:bg-blue-600">Edit Banner</Button>
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Banner"
                description="Are you sure you want to delete this banner? This action cannot be undone and the banner will be removed from the homepage immediately."
                itemName={banners.find((b: any) => b.id === itemToDelete)?.title}
            />
        </>
    );
}