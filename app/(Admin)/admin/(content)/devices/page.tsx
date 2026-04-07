"use client";

import React, { useState, useMemo } from 'react';
import { Monitor, Wifi, WifiOff, Clock, Search, Download, ChevronDown, MoreVertical, X, Trash2, Edit, UserCheck, ChevronRight, HomeIcon, ArrowUpRight } from 'lucide-react';
import GoogleMapModal from '@/components/shared/modals/GoogleMapModal';
import ReverseGeocode from '@/components/shared/ReverseGeocode';
import { useDeleteDeviceMutation, useGetGlobalDeviceDetailsQuery, useGetGlobalDevicesQuery, useLazyExportGlobalDevicesQuery } from '@/redux/api/admin/globalDevicesApi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Reusable Dropdown Component
type DropdownProps = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const Dropdown = ({ value, options, onChange, icon: Icon }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 text-black dark:text-white bg-navbarBg border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
      >
        {Icon && <Icon className="w-4 h-4" />}
        {value}
        <ChevronDown className="w-4 h-4" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-navbarBg border border-border rounded-lg shadow-lg z-20">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg text-gray-900 dark:text-white"
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
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
type StatCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, trend }) => (
  <div className="bg-navbarBg p-6 rounded-xl border border-border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
      <Icon className="w-5 h-5 text-gray-400" />
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
    <div className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
  </div>
);

// Action Menu Component
type Device = {
  id: string;
  device: string;
  model: string;
  customer: string;
  location: string;
  type: string;
  status: 'Online' | 'Offline' | 'Syncing' | string;
  storage: string;
  uptime: string;
  daysAgo: number;
  lastSyncDate?: Date;
  lastSync?: string;
  last_Sync?: string | null;
  lat: number;
  lng: number;
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
    { label: 'View Details', icon: ArrowUpRight, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Delete Device', icon: Trash2, color: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
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
                onClick={(e) => {
                  e.stopPropagation();
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

export default function GlobalDevices() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [modalContent, setModalContent] = useState<{ title: string; device: Device | null; action: string }>({ title: '', device: null, action: '' });
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; label: string; device: Device | null }>({ lat: 0, lng: 0, label: '', device: null });
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const periodMap: Record<string, string> = {
    'Last 1 day': '1day',
    'Last 7 days': '7days',
    'Last 30 days': '30days',
    'Last 1 year': '1year',
  };

  const [exportGlobalDevices] = useLazyExportGlobalDevicesQuery();
  const [deleteDevice] = useDeleteDeviceMutation();

  const downloadPDF = async (data: any[]) => {
    const doc = new jsPDF();
    const tableColumn = ['Name', 'Serial', 'Customer', 'Owner', 'Type', 'Status', 'Active Program', 'Storage Used', 'Last Seen', 'Uptime', 'Created At'];
    const tableRows = data.map(device => [
      device.name || 'N/A',
      device.serial || 'N/A',
      device.customer || 'N/A',
      device.owner || 'N/A',
      device.type || 'N/A',
      device.status || 'N/A',
      device.activeProgram || 'N/A',
      device.storageUsed || 'N/A',
      device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'N/A',
      device.uptime || 'N/A',
      device.createdAt ? new Date(device.createdAt).toLocaleString() : 'N/A',
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.text('Global Devices Report', 14, 15);
    doc.save('devices_report.pdf');
  };

  const downloadExcel = (data: any[]) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(device => ({
      Name: device.name || 'N/A',
      Serial: device.serial || 'N/A',
      Customer: device.customer || 'N/A',
      Owner: device.owner || 'N/A',
      Type: device.type || 'N/A',
      Status: device.status || 'N/A',
      'Active Program': device.activeProgram || 'N/A',
      'Storage Used': device.storageUsed || 'N/A',
      'Last Seen': device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'N/A',
      Uptime: device.uptime || 'N/A',
      'Created At': device.createdAt ? new Date(device.createdAt).toLocaleString() : 'N/A',
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');
    XLSX.writeFile(workbook, 'devices_report.xlsx');
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const result = await exportGlobalDevices({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        status: statusFilter !== 'All Status' ? statusFilter : undefined,
        type: typeFilter !== 'All Types' ? typeFilter : undefined,
        period: periodMap[timeRange] ?? 'all',
      }).unwrap();
      if (format === 'pdf') {
        downloadPDF(result.data);
      } else {
        downloadExcel(result.data);
      }
      setExportDropdownOpen(false);
    } catch (error) {
      console.error('Failed to export devices:', error);
    }
  };

  // Removed useGetGlobalDeviceDetailsQuery from here as we navigate to a new page

  const { data, isLoading, isError, refetch } = useGetGlobalDevicesQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery || undefined,
    status: statusFilter !== 'All Status' ? statusFilter : undefined,
    type: typeFilter !== 'All Types' ? typeFilter : undefined,
    period: periodMap[timeRange] ?? 'all',
  });

  const allDevices: Device[] = useMemo(() => {
    const apiDevices = data?.data?.devices ?? [];
    return apiDevices.map((device: any, index: number) => {
      const daysAgo = device.lastSeen ? Math.max(0, Math.round((Date.now() - new Date(device.lastSeen).getTime()) / (1000 * 60 * 60 * 24))) : 365;
      const uptime = data?.data?.stats?.avgUptime ?? 'N/A';
      
      // Improved Location Parsing
      let lat = 0;
      let lng = 0;
      let locationLabel = 'N/A';

      if (device.location) {
        if (typeof device.location === 'object') {
          lat = device.location.lat || 0;
          lng = device.location.lng || 0;
          locationLabel = `${lat}, ${lng}`;
        } else if (typeof device.location === 'string') {
          locationLabel = device.location;
          const coordRegex = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/;
          if (coordRegex.test(device.location.trim())) {
            const [latStr, lngStr] = device.location.split(',');
            lat = parseFloat(latStr.trim()) || 0;
            lng = parseFloat(lngStr.trim()) || 0;
          }
        }
      }

      return {
        id: device.id,
        device: device.name ?? 'N/A',
        model: device.model ?? 'N/A',
        customer: device.user?.full_name ?? 'N/A',
        location: locationLabel,
        type: device.deviceType ?? 'N/A',
        status: device.status ?? 'Offline',
        storage: device.storage ? String(device.storage) : 'N/A',
        uptime,
        daysAgo,
        lastSync: device.last_Sync ? new Date(device.last_Sync).toLocaleString() : 'N/A',
        last_Sync: device.last_Sync,
        lat,
        lng,
      } as Device;
    });
  }, [data]);

  // Get days from time range
  type TimeRange = 'Last 1 day' | 'Last 7 days' | 'Last 30 days' | 'Last 1 year';

  interface RangeMap {
    'Last 1 day': number;
    'Last 7 days': number;
    'Last 30 days': number;
    'Last 1 year': number;
  }

  const getDaysFromRange = (range: TimeRange | string): number => {
    const rangeMap: RangeMap = {
      'Last 1 day': 1,
      'Last 7 days': 7,
      'Last 30 days': 30,
      'Last 1 year': 365,
    };
    return rangeMap[(range as TimeRange)] ?? 30;
  };

  // Filter devices by time range
  const devicesInRange = useMemo(() => {
    const days = getDaysFromRange(timeRange);
    return allDevices.filter((device: Device) => device.daysAgo <= days);
  }, [allDevices, timeRange]);

  // Calculate stats based on filtered devices
  const stats = useMemo(() => {
    if (data?.data?.stats) {
      const s = data.data.stats;
      return {
        total: s.totalDevices,
        online: s.onlineDevices,
        offline: s.offlineDevices,
        avgUptime: s.avgUptime,
        trendText: `${s.onlinePercentage}% Online`
      };
    }
    const total = devicesInRange.length;
    const online = devicesInRange.filter((d: Device) => d.status === 'Online' || d.status === 'ONLINE').length;
    const offline = devicesInRange.filter((d: Device) => d.status === 'Offline' || d.status === 'OFFLINE').length;
    const uptimes = devicesInRange.map((d: Device) => parseFloat(String(d.uptime).replace('%', '')) || 0);
    const avgUptime = uptimes.length > 0 ? (uptimes.reduce((a: number, b: number) => a + b, 0) / uptimes.length).toFixed(1) + '%' : '0%';
    const previousDays = getDaysFromRange(timeRange);
    const previousDevices = allDevices.filter((d: Device) => d.daysAgo > previousDays && d.daysAgo <= previousDays * 2);
    const trend = total - previousDevices.length;
    const trendText = trend > 0 ? `+${trend} from last period` : trend < 0 ? `${trend} from last period` : 'No change';
    return { total, online, offline, avgUptime, trendText };
  }, [devicesInRange, allDevices, timeRange, data]);

  // Filter devices by search and filters
  const filteredDevices = useMemo(() => {
    return devicesInRange.filter((device: Device) => {
      const matchesSearch =
        device.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All Status' || device.status === statusFilter;
      const matchesType = typeFilter === 'All Types' || device.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devicesInRange, searchQuery, statusFilter, typeFilter]);

  // Pagination logic
  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDevices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDevices, currentPage]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilter, timeRange]);

  interface ModalContent {
    title: string;
    device: Device | null;
    action: string;
  }

  const handleAction = (action: string, device: Device): void => {
    if (action === 'View Details') {
      router.push(`/admin/devices/${device.id}`);
      return;
    }
    const content: ModalContent = { title: action, device, action };
    setModalContent(content);
    setModalOpen(true);
  };

  type StatusBadgeMap = {
    Online: string;
    Offline: string;
    Syncing: string;
    [key: string]: string;
  };

  const getStatusBadge = (status: Device['status']): string => {
    const styles: StatusBadgeMap = {
      Online: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      ONLINE: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      Offline: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      OFFLINE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      Syncing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      PAIRED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      WAITING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    };
    return styles[status] ?? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
  };

  const renderModalContent = () => {
    if (!modalContent.device) return null;

    switch (modalContent.action) {

      case 'Delete Client':
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete {modalContent.device.device}? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (modalContent.device) {
                    try {
                      await deleteDevice({ id: modalContent.device.id }).unwrap();
                      refetch(); // Refetch the data after deletion
                      setModalOpen(false);
                    } catch (error) {
                      console.error('Failed to delete device:', error);
                      // Optionally show an error message
                    }
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
    <div className="min-h-screen">
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Devices</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitor and manage all connected devices across customers</p>
          </div>
          <div className="flex flex-nowrap gap-2">
            <Dropdown
              value={timeRange}
              options={['Last 1 day', 'Last 7 days', 'Last 30 days', 'Last 1 year']}
              onChange={setTimeRange}
            />
            <div className="relative w-44">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="w-full text-nowrap px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-navbarBg border border-border shadow-customShadow rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden lg:block">Export Devices</span>
              </button>
              {exportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setExportDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1 bg-navbarBg border border-border rounded-lg shadow-lg z-20 w-full overflow-hidden">
                    <button
                      onClick={() => {
                        handleExport('pdf');
                        setExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      📄 PDF
                    </button>
                    <button
                      onClick={() => {
                        handleExport('excel');
                        setExportDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      📊 Excel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Devices"
            value={stats.total.toLocaleString()}
            subtitle={stats.trendText}
            icon={Monitor}
          />
          <StatCard
            title="Online Devices"
            value={stats.online.toLocaleString()}
            subtitle={`${((stats.online / stats.total) * 100).toFixed(1)}% Online`}
            icon={Wifi}
          />
          <StatCard
            title="Offline Devices"
            value={stats.offline}
            subtitle="Requires attention"
            icon={WifiOff}
          />
          <StatCard
            title="Average Uptime"
            value={stats.avgUptime}
            subtitle={timeRange}
            icon={Clock}
          />
        </div>

        {/* Device Management */}
        <div className="bg-navbarBg rounded-xl border border-border">
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
                options={['All Status', 'WAITING', 'ONLINE', 'OFFLINE', 'PAIRED']}
                onChange={setStatusFilter}
              />
              {/* <Dropdown
                value={typeFilter}
                options={['All Types', 'Android TV', 'Fire TV', 'Samsung Tizen', 'LG webOS']}
                onChange={setTypeFilter}
              /> */}
            </div>
          </div>

          {/* Responsive Table/Card View */}
          <div className="overflow-x-auto scrollbar-hide">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Storage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Last Sync</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Uptime</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedDevices.length > 0 ? (
                    paginatedDevices.map((device, index) => {
                      const isLastRows = index >= paginatedDevices.length - 2;
                      const isFirstRows = index < 2;
                      return (
                        <tr 
                          key={device.id} 
                          onClick={() => router.push(`/admin/devices/${device.id}`)}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{device.device}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{device.model}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.customer}</td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLocation({ lat: device.lat, lng: device.lng, label: device.location, device: device });
                                setMapModalOpen(true);
                              }}
                              className="text-bgBlue hover:underline cursor-pointer transition-all"
                            >
                              <ReverseGeocode lat={device.lat} lng={device.lng} fallback={device.location} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.type}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(device.status)}`}>
                              {device.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.storage}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.lastSync}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm text-gray-900 dark:text-white">{device.uptime}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <ActionMenu device={device} onAction={handleAction} isLastRows={isLastRows} isFirstRows={isFirstRows} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No devices found for the selected time range and filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {paginatedDevices.length > 0 ? (
                paginatedDevices.map((device, index) => {
                  const isLastRows = index >= paginatedDevices.length - 2;
                  const isFirstRows = index < 2;
                  return (
                    <div 
                      key={device.id} 
                      onClick={() => router.push(`/admin/devices/${device.id}`)}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{device.device}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{device.model}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(device.status)}`}>
                            {device.status}
                          </span>
                          <ActionMenu device={device} onAction={handleAction} isLastRows={isLastRows} isFirstRows={isFirstRows} />
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{device.customer}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Type:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{device.type}</span>
                        </div>
                      </div>

                      {/* Location */}
                      {device.location && device.location !== 'N/A' && (
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Location:</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLocation({ lat: device.lat, lng: device.lng, label: device.location, device: device });
                              setMapModalOpen(true);
                            }}
                            className="ml-2 text-bgBlue hover:underline cursor-pointer transition-all"
                          >
                            <ReverseGeocode lat={device.lat} lng={device.lng} fallback={device.location} />
                          </button>
                        </div>
                      )}

                      {/* Storage and Last Sync */}
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Storage:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{device.storage}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Last Sync:</span>
                          <span className="ml-2 text-gray-600 dark:text-gray-400">{device.lastSync}</span>
                        </div>
                      </div>

                      {/* Uptime */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Uptime:</span>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-gray-900 dark:text-white">{device.uptime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No devices found for the selected time range and filters.
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg rounded-b-xl">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredDevices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
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
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDevices.length / itemsPerPage)))}
                disabled={currentPage >= Math.ceil(filteredDevices.length / itemsPerPage)}
                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalContent.title}
      >
        {renderModalContent()}
      </Modal>

      <GoogleMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        lat={selectedLocation.lat}
        lng={selectedLocation.lng}
        label={selectedLocation.label}
        device={selectedLocation.device}
      />
    </div >
  );
}