import React from "react";
import { Search, List as ListIcon, Calendar as CalendarIcon } from "lucide-react";
import BaseSelect from "@/common/BaseSelect";
import { cn } from "@/lib/utils";

interface SearchFilterBarProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    sortOption: string;
    setSortOption: (val: string) => void;
    sortOptions: { label: string; value: string }[];
    view: "list" | "calendar";
    setView: (val: "list" | "calendar") => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    sortOptions,
    view,
    setView,
}) => {
    return (
        <div className="bg-navbarBg border border-border rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search screen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 md:py-3 bg-bgGray dark:bg-gray-800 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:w-40">
                        <BaseSelect
                            value={sortOption}
                            onChange={setSortOption}
                            options={sortOptions}
                            placeholder="Sort By"
                            showLabel={false}
                        />
                    </div>

                    <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-bgGray dark:bg-gray-800">
                        <button
                            onClick={() => setView("list")}
                            className={cn(
                                "p-2 rounded-md transition-all cursor-pointer",
                                view === "list" ? "bg-white dark:bg-gray-700 text-bgBlue shadow-customShadow" : "text-gray-400"
                            )}
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setView("calendar")}
                            className={cn(
                                "p-2 rounded-md transition-all cursor-pointer",
                                view === "calendar" ? "bg-white dark:bg-gray-700 text-bgBlue shadow-customShadow" : "text-gray-400"
                            )}
                        >
                            <CalendarIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchFilterBar;
