import React from 'react';
import { Search } from 'lucide-react';
import Dropdown from './Dropdown';

interface DeviceFilterSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export const DeviceFilterSection: React.FC<DeviceFilterSectionProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="p-6 border-b border-border rounded-t-xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Management</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-navbarBg text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <Dropdown
          value={statusFilter}
          options={['All Status', 'ONLINE', 'OFFLINE', 'PAIRED']}
          onChange={setStatusFilter}
        />
      </div>
    </div>
  );
};

export default DeviceFilterSection;
