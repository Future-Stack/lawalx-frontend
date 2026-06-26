import React from 'react';

interface DevicePaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export const DevicePagination: React.FC<DevicePaginationProps> = ({
  currentPage,
  itemsPerPage,
  totalItems,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return (
    <div className="p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 bg-navbarBg rounded-b-xl">
      <div className="text-xs sm:text-sm text-center sm:text-left text-gray-500 dark:text-gray-400">
        Showing {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} devices
      </div>
      <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white dark:bg-gray-800 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};
