"use client";

import React, { useState, useMemo } from 'react';
import { Monitor, Wifi, WifiOff, Clock, Search, Download, ChevronDown, MoreVertical, X, Trash2, Edit, UserCheck } from 'lucide-react';
import PreviewDeviceModal from '@/components/devices/modals/PreviewDeviceModal';
import Dropdown from '@/components/shared/Dropdown';
import TablePagination from '@/components/shared/TablePagination';

// --- Types & Helpers ---

// Generate demo data - removed daysAgo based filtering logic
const generateDevicesData = () => {
  const devices = [
    { device: 'Reception Display', model: 'TV-001-NYC', customer: 'TechCorp Inc.', location: 'New York, NY', type: 'Android TV', status: 'Online', storage: '8.5 GB / 16 GB', uptime: '99.8%', lastSync: '10 minutes ago' },
    { device: 'Menu Board', model: 'TV-002-LA', customer: 'Restaurant Group', location: 'Los Angeles, CA', type: 'Fire TV', status: 'Online', storage: '3.2 GB / 8 GB', uptime: '98.5%', lastSync: '2 hours ago' },
    { device: 'Lobby Screen', model: 'TV-003-CHI', customer: 'Healthcare Network', location: 'Chicago, IL', type: 'Samsung Tizen', status: 'Offline', storage: '12.8 GB / 16 GB', uptime: '95.2%', lastSync: '3 days ago' },
    { device: 'Store Display', model: 'TV-004-MIA', customer: 'RetailStore Chain', location: 'Miami, FL', type: 'LG webOS', status: 'Syncing', storage: '5.7 GB / 32 GB', uptime: '99.1%', lastSync: 'Syncing now' },
    { device: 'Conference Room', model: 'TV-005-BOS', customer: 'Tech Solutions', location: 'Boston, MA', type: 'Android TV', status: 'Online', storage: '4.2 GB / 16 GB', uptime: '97.8%', lastSync: '6 days ago' },
    { device: 'Lobby Display', model: 'TV-006-SEA', customer: 'Coffee Chain', location: 'Seattle, WA', type: 'Fire TV', status: 'Online', storage: '6.1 GB / 16 GB', uptime: '99.3%', lastSync: '2 weeks ago' },
    { device: 'Menu Board', model: 'TV-007-DEN', customer: 'FastFood Group', location: 'Denver, CO', type: 'Samsung Tizen', status: 'Online', storage: '7.8 GB / 16 GB', uptime: '98.9%', lastSync: '3 weeks ago' },
    { device: 'Waiting Room', model: 'TV-008-PHX', customer: 'Medical Center', location: 'Phoenix, AZ', type: 'LG webOS', status: 'Syncing', storage: '5.3 GB / 32 GB', uptime: '99.5%', lastSync: '4 weeks ago' },
    { device: 'Retail Display', model: 'TV-009-ATL', customer: 'Shopping Mall', location: 'Atlanta, GA', type: 'Android TV', status: 'Online', storage: '9.2 GB / 16 GB', uptime: '96.7%', lastSync: '1 month ago' },
    { device: 'Office Screen', model: 'TV-010-DAL', customer: 'Corporate HQ', location: 'Dallas, TX', type: 'Fire TV', status: 'Online', storage: '5.8 GB / 16 GB', uptime: '98.2%', lastSync: '3 months ago' },
    { device: 'Hotel Lobby', model: 'TV-011-LAS', customer: 'Hotel Chain', location: 'Las Vegas, NV', type: 'Samsung Tizen', status: 'Online', storage: '11.4 GB / 16 GB', uptime: '97.5%', lastSync: '6 months ago' },
    { device: 'Store Front', model: 'TV-012-POR', customer: 'Electronics Store', location: 'Portland, OR', type: 'LG webOS', status: 'Offline', storage: '6.9 GB / 32 GB', uptime: '94.8%', lastSync: '10 months ago' },
  ];

  return devices.map((device, index) => ({
    id: index + 1,
    ...device,
  }));
};


// Reusable Modal Component
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Stat Card Component
// type StatCardProps = {
//   title: string;
//   value: React.ReactNode;
//   subtitle?: string;
//   icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
// };

// const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon }) => (
//   <div className="bg-navbarBg p-6 rounded-xl border border-border">
//     <div className="flex items-center justify-between mb-2">
//       <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
//       <Icon className="w-5 h-5 text-gray-400" />
//     </div>
//     <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
//     <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
//   </div>
// );

// Action Menu Component
type Device = {
  id: number;
  device: string;
  model: string;
  customer: string;
  location: string;
  type: string;
  status: 'Online' | 'Offline' | 'Syncing' | string;
  storage: string;
  uptime: string;
  lastSync?: string;
};

type ActionMenuProps = {
  device: Device;
  onAction: (action: string, device: Device) => void;
  isLastRows: boolean;
  isFirstRows?: boolean;
};

const ActionMenu: React.FC<ActionMenuProps> = ({ device, onAction, isLastRows, isFirstRows }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { label: 'View Details', icon: Monitor, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Edit', icon: Edit, color: 'text-gray-600 dark:text-gray-400' },
    { label: 'Suspend Account', icon: UserCheck, color: 'text-orange-600 dark:text-orange-400' },
    { label: 'Delete Client', icon: Trash2, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`absolute right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 ${isFirstRows ? 'right-full mr-2' :
            isLastRows ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}>
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  onAction(action.label, device);
                  setIsOpen(false);
                }}
                className={`w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${action.color}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function DevicesTab({ devices: devicesProp }: { devices?: any[] }) {
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; device: Device | null; action: string }>({ title: '', device: null, action: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const allDevices = devicesProp && devicesProp.length > 0
    ? devicesProp.map((d: any, i: number) => ({
      id: i + 1,
      device: d.deviceName || "N/A",
      model: d.resolution || "N/A",
      customer: d.programName || "N/A",
      location: d.location || "N/A",
      type: "N/A",
      status: d.status === "PAIRED" ? "Online" : d.status === "OFFLINE" ? "Offline" : d.status === "UNPAIRED" ? "Offline" : (d.status || "N/A"),
      storage: d.storageUsage || "N/A",
      uptime: "N/A",
      lastSync: d.lastSynced ? new Date(d.lastSynced).toLocaleString() : "N/A",
    }))
    : [];

  // Calculate stats based on all devices
  const stats = useMemo(() => {
    const total = allDevices.length;
    const online = allDevices.filter(d => d.status === 'Online').length;
    const offline = allDevices.filter(d => d.status === 'Offline').length;
    const uptimes = allDevices.map(d => parseFloat(d.uptime.replace('%', '')));
    const avgUptime = uptimes.length > 0
      ? (uptimes.reduce((a, b) => a + b, 0) / uptimes.length).toFixed(1) + '%'
      : '0%';

    return { total, online, offline, avgUptime };
  }, [allDevices]);

  // Filter devices by search and status/type filters
  const filteredDevices = useMemo(() => {
    return allDevices.filter(device => {
      const matchesSearch =
        device.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || device.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allDevices, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredDevices.length / ITEMS_PER_PAGE);
  const currentDevices = filteredDevices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAction = (action: string, device: Device): void => {
    setModalContent({ title: action, device, action });
    setModalOpen(true);
  };

  const getStatusBadge = (status: Device['status']): string => {
    const styles: Record<string, string> = {
      Online: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      Offline: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      Syncing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    };
    return styles[status] ?? '';
  };

  const renderModalContent = () => {
    if (!modalContent.device) return null;

    switch (modalContent.action) {
      case 'View Details':
        return (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PreviewDeviceModal isOpen={modalOpen} device={modalContent.device as any} onClose={() => setModalOpen(false)} />
          </>
        );

      case 'Edit':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Device Name"
              defaultValue={modalContent.device.device}
              className="w-full px-4 py-2 border border-border rounded-lg bg-navbarBg text-gray-900 dark:text-white outline-none"
            />
            <input
              type="text"
              placeholder="Location"
              defaultValue={modalContent.device.location}
              className="w-full px-4 py-2 border border-border rounded-lg bg-navbarBg text-gray-900 dark:text-white outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 bg-bgBlue text-white rounded-lg hover:bg-blue-500 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'Suspend Account':
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to suspend {modalContent.device.device}? The device will be temporarily disabled.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer"
              >
                Suspend
              </button>
            </div>
          </div>
        );

      case 'Delete Client':
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete {modalContent.device.device}? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">

      <div className="p-4 border border-border rounded-xl bg-navbarBg">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-navbarBg text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <Dropdown
            value={statusFilter}
            options={['All Status', 'Online', 'Offline', "Paired"]}
            onChange={setStatusFilter}
          />
        </div>
      </div>
      {/* Device Management */}
      <div className="bg-navbarBg border border-border rounded-xl overflow-hidden">

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide rounded-t-xl">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Resolution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Sync</th>
                {/* <th className="px-6 py-3"></th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentDevices.length > 0 ? (
                currentDevices.map((device, index) => {
                  const isLastRows = index >= currentDevices.length - 2;
                  const isFirstRows = index < 2;
                  return (
                    <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{device.device}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{device.model}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.location}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(device.status)}`}>
                          {device.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.storage}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.lastSync}</td>
                      {/* <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-gray-900 dark:text-white">{device.uptime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ActionMenu device={device} onAction={handleAction} isLastRows={isLastRows} isFirstRows={isFirstRows} />
                      </td> */}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No device found for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredDevices.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal */}
      {/* <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
      >
        {renderModalContent()}
      </Modal> */}
    </div>
  );
}