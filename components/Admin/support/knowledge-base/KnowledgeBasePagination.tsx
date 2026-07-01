import React from 'react';

interface KnowledgeBasePaginationProps {
    currentItemsLength: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    itemsPerPage?: number;
}

export const KnowledgeBasePagination: React.FC<KnowledgeBasePaginationProps> = ({
    currentItemsLength,
    totalItems,
    currentPage,
    totalPages,
    setCurrentPage,
    itemsPerPage = 10,
}) => {
    if (totalPages === 0) return null;

    const startIndex = (currentPage - 1) * itemsPerPage;

    return (
        <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg rounded-b-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    Previous
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default KnowledgeBasePagination;
