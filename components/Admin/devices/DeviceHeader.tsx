import React from 'react';
import Link from 'next/link';
import { HomeIcon, ChevronRight, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const DeviceHeader: React.FC = () => {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/admin/dashboard">
          <HomeIcon className="w-4 h-4 cursor-pointer hover:text-bgBlue" />
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-blue-500 dark:text-blue-400">
          Devices
        </span>
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Device Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage all connected devices across customers</p>
        </div>
        <div className="flex flex-nowrap gap-2">
          <button
            onClick={() => router.push('/admin/reports/device-report')}
            className="text-nowrap px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceHeader;
