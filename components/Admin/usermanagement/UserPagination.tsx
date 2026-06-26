import React from "react";

interface UserPaginationProps {
  usersLength: number;
  totalCount: number;
  page: number;
  totalPages: number;
  setPage: (p: number | ((prev: number) => number)) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  usersLength,
  totalCount,
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg rounded-b-lg">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {usersLength} of {totalCount} users
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(prev => (prev < totalPages) ? prev + 1 : prev)}
          disabled={page === (totalPages || 1)}
          className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 cursor-pointer"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserPagination;
