"use client";

import { useState, useMemo, useEffect } from "react";
import { TvMinimal, Radio, WifiOff, Search, ChevronDown, MoreVertical, Trash2, Eye, PenLine, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import PreviewDeviceModal from "@/components/devices/modals/PreviewDeviceModal";
import GoogleMapModal from "@/components/shared/modals/GoogleMapModal";
import RenameDeviceModal from "@/components/devices/modals/RenameDeviceModal";
import RemoveDeviceModal from "@/components/devices/modals/RemoveDeviceModal";
import ReportDeviceModal from "@/components/devices/modals/ReportDeviceModal";
import { useGetMyDevicesDataQuery, useDeleteDeviceMutation, useRenameDeviceMutation } from "@/redux/api/users/devices/devices.api";
import { Device as ApiDevice } from "@/redux/api/users/devices/devices.type";
import { toast } from "sonner";

// Local types to match admin page logic, adapting to API data
type DeviceView = {
  id: string;
  device: string;
  model: string;
  location: string;
  type: string;
  status: string;
  storage: string;
  lastSync: string;
  lat: number;
  lng: number;
  original: ApiDevice; // Keep original for actions
};

const calculateTimeAgo = (dateString: string | null) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

// Reusable Dropdown Component (matching admin style)
const Dropdown = ({ value, options, onChange, icon: Icon }: any) => {
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
            {options.map((option: string) => (
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

// Action Menu Component (matching admin style)
const ActionMenu = ({ device, onAction }: any) => {
  const actions = [
    { label: 'Preview', icon: Eye, color: 'text-gray-900 dark:text-white hover:text-white focus:text-white transition-colors' },
    { label: 'Rename', icon: PenLine, color: 'text-gray-900 dark:text-white hover:text-white focus:text-white transition-colors' },
    // { label: 'Report Issue', icon: CircleQuestionMark, color: 'text-gray-900 dark:text-white hover:text-white focus:text-white transition-colors' },
    { label: 'Remove Device', icon: Trash2, color: 'text-red-600 dark:text-red-400 hover:text-white focus:text-white transition-colors' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer outline-none">
          <MoreVertical className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            onClick={() => onAction(action.label, device)}
            className={`flex items-center gap-2 cursor-pointer group outline-none ${action.color}`}
          >
            <action.icon className="w-4 h-4 transition-colors group-hover:text-white" />
            <span className="transition-colors group-hover:text-white">
              {action.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DevicesPage() {
  const { data: devicesData, isLoading, isError } = useGetMyDevicesDataQuery();
  const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();
  const [renameDeviceApi, { isLoading: isRenaming }] = useRenameDeviceMutation();

  const allDevices: DeviceView[] = useMemo(() => {
    if (!devicesData?.data) return [];

    return devicesData.data.map((device) => ({
      id: device.id,
      device: device.name || device.deviceSerial || "Unknown Device",
      model: device.model || "Unknown Model",
      location: device.location || "Unknown Location",
      type: device.deviceType || "Unknown Type",
      status: device.status === "PAIRED" ? "Online" : (device.status === "OFFLINE" ? "Offline" : device.status),
      storage: device.storage ? (typeof device.storage === 'string' ? device.storage : "N/A") : "N/A",
      lastSync: calculateTimeAgo(device.lastSeen),
      lat: 0,
      lng: 0,
      original: device
    }));
  }, [devicesData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<DeviceView | null>(null);
  const [renameDevice, setRenameDevice] = useState<DeviceView | null>(null);
  const [removeDevice, setRemoveDevice] = useState<DeviceView | null>(null);
  const [reportDevice, setReportDevice] = useState<DeviceView | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; label: string; device: DeviceView | null }>({ lat: 0, lng: 0, label: '', device: null });

  // Filtering
  const filteredDevices = useMemo(() => {
    return allDevices.filter(d => {
      const matchesSearch = d.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || d.status === statusFilter;
      const matchesType = typeFilter === 'All Types' || d.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allDevices, searchQuery, statusFilter, typeFilter]);

  // Pagination
  const paginatedDevices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDevices.slice(start, start + itemsPerPage);
  }, [filteredDevices, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, typeFilter]);

  const online = allDevices.filter(d => d.status === "Online").length;
  const offline = allDevices.filter(d => d.status === "Offline").length;

  const handleAction = (action: string, device: DeviceView) => {
    if (action === 'Preview') setPreviewDevice(device);
    if (action === 'Rename') setRenameDevice(device);
    if (action === 'Remove Device') setRemoveDevice(device);
    if (action === 'Report Issue') setReportDevice(device);
  };

  const handleDelete = async () => {
    if (!removeDevice) return;
    try {
      await deleteDevice({ id: removeDevice.id }).unwrap();
      toast.success("Device removed successfully");
      setRemoveDevice(null);
    } catch (error) {
      toast.error("Failed to remove device");
      console.error("Delete error:", error);
    }
  };

  const handleRename = async (newName: string) => {
    if (!renameDevice) return;
    try {
      await renameDeviceApi({ id: renameDevice.id, name: newName }).unwrap();
      toast.success("Device renamed successfully");
      setRenameDevice(null);
    } catch (error) {
      toast.error("Failed to rename device");
      console.error("Rename error:", error);
    }
  };

  const statusStyles: any = {
    Online: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Offline: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    Syncing: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2 justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-Heading dark:text-white mb-1">My Devices</h1>
          <p className="text-sm text-Heading dark:text-gray-400">Screencasts when and where your content should play</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-2 md:py-3 cursor-pointer bg-bgBlue text-white rounded-lg flex items-center gap-2 shadow-customShadow hover:bg-blue-500 transition"
        >
          <span className="text-lg"><Plus /></span> Add Device
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-navbarBg rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full border border-borderGray dark:border-gray-600 flex items-center justify-center">
              <TvMinimal className="w-5 h-5 text-navGray dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allDevices.length}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">You can add 16 more devices</p>
            <Link href="/choose-plan">
              <button className="py-2 px-4 bg-gray-900 hover:scale-[1.02] transition-transform shadow-customShadow text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer">
                Upgrade Plan
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-navbarBg rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
              <Radio className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{online}</p>
            </div>
          </div>
        </div>

        <div className="bg-navbarBg rounded-xl shadow-sm p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Offline</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{offline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Title + Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-Heading dark:text-white">{filteredDevices.length} Devices</h2>
        {isLoading && <span className="text-sm text-gray-500">Loading devices...</span>}
      </div>

      {/* Main Container (Management + Table) */}
      <div className="bg-navbarBg rounded-xl border border-border">
        {/* Filtering section matching admin */}
        <div className="p-6 border-b border-border rounded-t-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-navbarBg text-gray-900 dark:text-white"
              />
            </div>
            <Dropdown value={statusFilter} options={['All Status', 'Online', 'Offline', 'Syncing']} onChange={setStatusFilter} />
            <Dropdown value={typeFilter} options={['All Types', 'Android TV', 'Fire TV', 'Samsung Tizen', 'LG webOS']} onChange={setTypeFilter} />
          </div>
        </div>

        {/* Table styled like admin but with requested columns */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Device</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Storage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Sync</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedDevices.map((device, index) => (
                <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{device.device}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{device.model}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setSelectedLocation({ lat: device.lat, lng: device.lng, label: device.location, device: device });
                        setMapModalOpen(true);
                      }}
                      className="text-bgBlue hover:underline cursor-pointer transition-all"
                    >
                      {device.location}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[device.status] || ''}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.storage}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.lastSync}</td>
                  <td className="px-6 py-4 text-right">
                    <ActionMenu device={device} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedDevices.length === 0 && (
            <div className="p-8 text-center text-gray-500">No devices found.</div>
          )}
        </div>

        {/* Pagination matching admin */}
        <div className="p-4 border-t border-border flex justify-between items-center bg-navbarBg rounded-b-xl">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredDevices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDevices.length / itemsPerPage)))}
              disabled={currentPage >= Math.ceil(filteredDevices.length / itemsPerPage)}
              className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDeviceModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <PreviewDeviceModal isOpen={!!previewDevice} onClose={() => setPreviewDevice(null)} device={previewDevice as any} />
      <RenameDeviceModal
        isOpen={!!renameDevice}
        onClose={() => setRenameDevice(null)}
        deviceId={renameDevice?.id}
        initialName={renameDevice?.device || ""}
      />
      <RemoveDeviceModal
        isOpen={!!removeDevice}
        onClose={() => setRemoveDevice(null)}
        deviceName={removeDevice?.device || ''}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
      <ReportDeviceModal
        isOpen={!!reportDevice}
        onClose={() => setReportDevice(null)}
        deviceName={reportDevice?.device || ''}
        onSubmit={(data) => {
          console.log('Report submitted:', data);
          alert('Issue reported successfully!');
        }}
      />
      <GoogleMapModal
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        lat={selectedLocation.lat}
        lng={selectedLocation.lng}
        label={selectedLocation.label}
        device={selectedLocation.device}
      />
    </div>
  );
}