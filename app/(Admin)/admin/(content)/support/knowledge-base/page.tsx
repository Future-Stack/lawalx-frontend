'use client';

import React, { useState } from 'react';
import { AlertTriangle, UserCheck, VideoIcon } from 'lucide-react';
import CreateFAQModal from '@/components/Admin/modals/CreateFAQModal';
import CreateVideoTutorialModal from '@/components/Admin/modals/CreateVideoTutorialModal';
import DeleteConfirmationModal from '@/components/Admin/modals/DeleteConfirmationModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

// Import refactored components
import VideoPlayerModal from '@/components/Admin/support/knowledge-base/VideoPlayerModal';
import DetailsModal from '@/components/Admin/support/knowledge-base/DetailsModal';
import KnowledgeBaseHeader from '@/components/Admin/support/knowledge-base/KnowledgeBaseHeader';
import KnowledgeBaseStats from '@/components/Admin/support/knowledge-base/KnowledgeBaseStats';
import KnowledgeBaseTabs from '@/components/Admin/support/knowledge-base/KnowledgeBaseTabs';
import KnowledgeBaseFilters from '@/components/Admin/support/knowledge-base/KnowledgeBaseFilters';
import KnowledgeBaseTable from '@/components/Admin/support/knowledge-base/KnowledgeBaseTable';


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

    return (
        <div className="min-h-screen">
            <KnowledgeBaseHeader
                onCreateFAQClick={() => { setEditingFAQ(null); setIsCreateFAQOpen(true); }}
                onCreateVideoClick={() => { setEditingVideo(null); setIsCreateVideoOpen(true); }}
            />

            <KnowledgeBaseStats stats={stats} />

            <KnowledgeBaseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="px-1 text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                {totalItems} {activeTab === 'FAQs' ? 'FAQs' : 'Video Tutorials'}
            </div>

            <KnowledgeBaseFilters
                searchQuery={searchQuery}
                setSearchQuery={(q) => { setSearchQuery(q); setCurrentPage(1); }}
                statusFilter={statusFilter}
                setStatusFilter={(f) => { setStatusFilter(f); setCurrentPage(1); }}
            />

            <KnowledgeBaseTable
                activeTab={activeTab}
                currentItems={currentItems}
                isFaqsLoading={isFaqsLoading}
                isVideosLoading={isVideosLoading}
                onRowClick={(item) => setDetailsModal({ isOpen: true, data: item, type: activeTab === 'FAQs' ? 'FAQ' : 'Video' })}
                onPlayVideoClick={(url) => setVideoToPlay({ isOpen: true, url })}
                onEditClick={handleEdit}
                onDeleteClick={(id) => handleDeleteClick(id, activeTab === 'FAQs' ? 'FAQ' : 'Video')}
                totalPages={totalPages}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalItems={totalItems}
                limit={limit}
            />

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
        </div>
    );
}