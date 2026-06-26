import React from 'react';
import Link from 'next/link';
import { HomeIcon, ChevronRight, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KnowledgeBaseHeaderProps {
    onCreateFAQClick: () => void;
    onCreateVideoClick: () => void;
}

export const KnowledgeBaseHeader: React.FC<KnowledgeBaseHeaderProps> = ({
    onCreateFAQClick,
    onCreateVideoClick,
}) => {
    return (
        <>
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
                                <DropdownMenuItem onClick={onCreateFAQClick}>
                                    Create FAQ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onCreateVideoClick}>
                                    Create Video Tutorial
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </>
    );
};

export default KnowledgeBaseHeader;
