import React from 'react';

interface KnowledgeBasePaginationProps {
    currentItemsLength: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const KnowledgeBasePagination: React.FC<KnowledgeBasePaginationProps> = ({
    currentItemsLength,
    totalItems,
    currentPage,
    totalPages,
    setCurrentPage,
}) => {
    return (
        <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg rounded-b-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {currentItemsLength} of {totalItems} items
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
    );
};

export default KnowledgeBasePagination;
