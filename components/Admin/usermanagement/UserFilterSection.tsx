import React from "react";
import { Search } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import SliderDropdown from "@/components/shared/SliderDropdown";

interface UserFilterSectionProps {
  selectedUsersCount: number;
  totalUsersCount: number;
  usersLength: number;
  toggleSelectAll: () => void;
  handleBulkAction: (action: "suspend" | "unsuspend") => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  planFilter: string;
  setPlanFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  storageFilter: number;
  setStorageFilter: (val: number) => void;
}

export const UserFilterSection: React.FC<UserFilterSectionProps> = ({
  selectedUsersCount,
  totalUsersCount,
  usersLength,
  toggleSelectAll,
  handleBulkAction,
  searchTerm,
  setSearchTerm,
  planFilter,
  setPlanFilter,
  statusFilter,
  setStatusFilter,
  storageFilter,
  setStorageFilter,
}) => {
  return (
    <div className="p-4 border-b border-border">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <input
              type="checkbox"
              checked={selectedUsersCount === usersLength && usersLength > 0}
              onChange={toggleSelectAll}
              className="rounded border-gray-300 dark:border-gray-600 w-5 h-5 cursor-pointer"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedUsersCount > 0
              ? `Selected (${selectedUsersCount})`
              : `All Users (${totalUsersCount})`}
          </h2>
        </div>
        {selectedUsersCount > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("unsuspend")}
              className="px-4 cursor-pointer py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Unsuspend
            </button>
            <button
              onClick={() => handleBulkAction("suspend")}
              className="px-4 cursor-pointer py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
            >
              Suspend
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border bg-navbarBg rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full xl:w-auto">
          <Dropdown
            value={planFilter}
            options={["All Plans", "Free Trial", "Basic", "Premium", "Business", "Enterprise"]}
            onChange={setPlanFilter}
            className="w-full"
          />
          <Dropdown
            value={statusFilter}
            options={["All Status", "Active", "Suspended"]}
            onChange={setStatusFilter}
            className="w-full"
          />
          <SliderDropdown
            label="Storage"
            value={storageFilter}
            onChange={setStorageFilter}
            className="w-full sm:col-span-2 md:col-span-1"
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilterSection;
