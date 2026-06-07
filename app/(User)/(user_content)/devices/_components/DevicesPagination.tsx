"use client";

interface DevicesPaginationProps {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  filteredCount: number;
  itemsPerPage: number;
}

export default function DevicesPagination({
  currentPage,
  setCurrentPage,
  filteredCount,
  itemsPerPage,
}: DevicesPaginationProps) {
  const totalPages = Math.ceil(filteredCount / itemsPerPage);

  return (
    <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 bg-bgGray/50 dark:bg-gray-800/50">
      <div className="text-sm text-[#737373] dark:text-gray-400 font-medium text-center sm:text-left">
        Showing {filteredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
        {Math.min(currentPage * itemsPerPage, filteredCount)} of {filteredCount} devices
      </div>
      <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg text-sm font-semibold text-body cursor-pointer shadow-customShadow transition-colors bg-white dark:bg-gray-800 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === 0 || currentPage >= totalPages}
          className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg text-sm font-semibold text-body cursor-pointer shadow-customShadow transition-colors bg-white dark:bg-gray-800 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
