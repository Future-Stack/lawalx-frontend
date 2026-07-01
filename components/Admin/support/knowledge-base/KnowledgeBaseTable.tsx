import React from 'react';
import Image from 'next/image';
import { Eye, Edit, Trash2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCategory, getVideoUrl } from './helpers';

interface KnowledgeBaseTableProps {
    activeTab: 'FAQs' | 'Video Tutorial';
    currentItems: any[];
    isFaqsLoading: boolean;
    isVideosLoading: boolean;
    onRowClick: (item: any) => void;
    onPlayVideoClick: (url: string) => void;
    onEditClick: (item: any) => void;
    onDeleteClick: (id: string) => void;
}

export const KnowledgeBaseTable: React.FC<KnowledgeBaseTableProps> = ({
    activeTab,
    currentItems,
    isFaqsLoading,
    isVideosLoading,
    onRowClick,
    onPlayVideoClick,
    onEditClick,
    onDeleteClick,
}) => {
    const getStatusStyle = (status: string) => {
        if (status === 'PUBLISHED') return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800';
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'; // DRAFT
    };



    return (
        <div className="bg-navbarBg rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto thin-gray-scrollbar">
                <table className="w-full">
                    <thead className="bg-[#FFFFFF] dark:bg-gray-800/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[40%] min-w-[250px]">
                                {activeTab === 'FAQs' ? 'Question' : 'Title'}
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[15%] min-w-[100px]">Views</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[15%] min-w-[120px]">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[15%] min-w-[140px]">Category</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 w-[15%] min-w-[120px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {currentItems.map((item: any) => (
                            <tr
                                key={item.id}
                                onClick={() => {
                                    const selection = window.getSelection();
                                    if (selection && selection.toString()) return;
                                    onRowClick(item);
                                }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 text-nowrap">
                                    <div className="flex items-start gap-3">
                                        {/* Thumbnail for video */}
                                        {activeTab === 'Video Tutorial' && (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPlayVideoClick(item.videoLink || item.uploadVideo);
                                                }}
                                                className="w-16 h-10 rounded-lg bg-black flex-shrink-0 relative flex items-center justify-center cursor-pointer overflow-hidden group/play border border-border"
                                            >
                                                {(() => {
                                                    const rawUrl = item.videoLink || item.uploadVideo;
                                                    const videoUrl = getVideoUrl(rawUrl);

                                                    if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
                                                        let videoId = '';
                                                        if (rawUrl.includes('v=')) videoId = rawUrl.split('v=')[1]?.split('&')[0];
                                                        else if (rawUrl.includes('youtu.be/')) videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];

                                                        return (
                                                            <Image
                                                                src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                                                                alt={item.title}
                                                                fill
                                                                className="object-cover group-hover/play:scale-110 transition-transform"
                                                                unoptimized
                                                            />
                                                        );
                                                    }

                                                    return (
                                                        <video
                                                            src={`${videoUrl}#t=0.1`}
                                                            className="w-full h-full object-cover group-hover/play:scale-110 transition-transform"
                                                            preload="metadata"
                                                            muted
                                                        />
                                                    );
                                                })()}
                                                <div className="absolute inset-0 bg-black/20 group-hover/play:bg-black/40 transition-colors flex items-center justify-center">
                                                    <Play className="w-4 h-4 text-white fill-current" />
                                                </div>
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
                                <td className="px-6 py-4 text-nowrap">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {item.totalView || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-nowrap">
                                    <span
                                        className={cn("rounded-full px-3 py-0.5 font-medium text-xs border uppercase", getStatusStyle(item.status))}
                                    >
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-nowrap">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-3 py-0.5">
                                        {Array.isArray(item.category)
                                            ? formatCategory(item.category[0])
                                            : formatCategory(item.category)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRowClick(item);
                                            }}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditClick(item);
                                            }}
                                            className="p-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteClick(item.id);
                                            }}
                                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
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
        </div>
    );
};

export default KnowledgeBaseTable;
