import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';

interface DashboardHeaderProps {
  onExport: () => void;
  onExportExcel: () => void;
  onAddClientClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onExport,
  onExportExcel,
  onAddClientClick
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="border-b border-border pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monitor system performance and manage client operations</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              className="cursor-pointer text-nowrap px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className='hidden lg:block'>Export Overview Report</span>
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 bg-navbarBg border border-border rounded-lg shadow-xl z-20 min-w-[170px] overflow-hidden animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => { onExport(); setShowExportMenu(false); }}
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
            onClick={onAddClientClick}
            className="cursor-pointer text-nowrap px-3 py-2 text-xs font-medium text-white bg-bgBlue rounded-md shadow-customShadow hover:bg-blue-500 dark:hover:bg-blue-500 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden lg:block">Add New Client</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
