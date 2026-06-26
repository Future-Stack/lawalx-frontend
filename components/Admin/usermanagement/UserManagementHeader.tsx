import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  ChevronRight,
  CloudDownload,
  UserRoundPlus,
} from "lucide-react";

interface UserManagementHeaderProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  onAddUserClick: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onExportPDF,
  onExportExcel,
  onAddUserClick
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/admin/dashboard">
          <Home className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-blue-500 dark:text-blue-400">
          User Management
        </span>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manage user accounts, subscriptions, and permissions
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              className="px-4 py-2 shadow-customShadow cursor-pointer bg-white dark:bg-gray-800 text-nowrap rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <CloudDownload className="w-4 h-4" />
              <span className="hidden lg:block">Export Report</span>
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 bg-navbarBg border border-border rounded-lg shadow-xl z-20 min-w-[170px] overflow-hidden animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => { onExportPDF(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2.5 cursor-pointer border-b border-border group"
                  >
                    <span className="text-red-500 text-lg group-hover:scale-110 transition-transform">📄</span>
                    <span className="font-medium">Export as PDF</span>
                  </button>
                  <button
                    onClick={() => { onExportExcel(); setShowExportMenu(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <span className="text-green-500 text-lg group-hover:scale-110 transition-transform">📊</span>
                    <span className="font-medium">Export as Excel</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={onAddUserClick}
            className="px-4 py-2 shadow-customShadow cursor-pointer bg-blue-500 hover:bg-blue-600 text-nowrap text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <UserRoundPlus className="w-4 h-4" />
            <span className="hidden lg:block">Add New User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementHeader;
