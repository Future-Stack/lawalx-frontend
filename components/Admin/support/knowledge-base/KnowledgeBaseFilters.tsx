import React from 'react';
import { Search } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface KnowledgeBaseFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: 'All Status' | 'DRAFT' | 'PUBLISHED';
    setStatusFilter: (filter: 'All Status' | 'DRAFT' | 'PUBLISHED') => void;
}

export const KnowledgeBaseFilters: React.FC<KnowledgeBaseFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex gap-2 p-2 bg-navbarBg justify-between items-center w-full border border-border rounded-2xl">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by title or question"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 text-sm bg-navbarBg border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-headings dark:text-white"
                    />
                </div>

                {/* Status Dropdown */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
    );
};

export default KnowledgeBaseFilters;
