import React from 'react';
import { HelpCircle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KnowledgeBaseTabsProps {
    activeTab: 'FAQs' | 'Video Tutorial';
    setActiveTab: (tab: 'FAQs' | 'Video Tutorial') => void;
}

export const KnowledgeBaseTabs: React.FC<KnowledgeBaseTabsProps> = ({
    activeTab,
    setActiveTab,
}) => {
    return (
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
    );
};

export default KnowledgeBaseTabs;
