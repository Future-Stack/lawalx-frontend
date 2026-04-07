"use client";

import { useState, useMemo, useEffect } from "react";
import { WifiOff, Search, ChevronDown, MoreVertical, Trash2, Eye, PenLine, Plus, MapPin, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import PreviewDeviceModal from "@/components/devices/modals/PreviewDeviceModal";
import LeafletMapModal from "@/components/shared/modals/LeafletMapModal";
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
  resolution: string;
  location: string;
  type: string;
  programName: string;
  status: "ONLINE" | "OFFLINE" | "PAIRED" | "WAITING" | string;
  storage: string;
  lastSync: string;
  lat: number;
  lng: number;
  original: ApiDevice;
};

import DeviceLocation from "@/components/common/DeviceLocation";

const calculateTimeAgo = (dateString: string | null) => {
  if (!dateString) return "---";
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

const parseStorage = (storageStr: string) => {
  if (!storageStr || storageStr === "N/A") return 0;
  try {
    const parts = storageStr.split("/");
    if (parts.length === 2) {
      const used = parseFloat(parts[0].trim());
      const total = parseFloat(parts[1].trim().split(" ")[0]);
      if (!isNaN(used) && !isNaN(total) && total > 0) {
        return (used / total) * 100;
      }
    }
  } catch (e) {
    return 0;
  }
  return 0;
};

// Reusable Dropdown Component (matching admin style)
const Dropdown = ({ value, options, onChange, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center gap-2 p-3 text-black dark:text-white bg-[#F9FAFB] dark:bg-gray-800 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium w-full sm:w-auto justify-between sm:justify-start"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          {value}
        </div>
        <ChevronDown className="w-4 h-4 ml-2" />
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
    { label: 'Remove Device', icon: Trash2, color: 'text-red-600 dark:text-red-400 hover:text-white focus:text-white transition-colors' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer outline-none">
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
  const { data: devicesData, isLoading } = useGetMyDevicesDataQuery(undefined);
  const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();
  const [renameDeviceApi] = useRenameDeviceMutation();
  console.log("devicesData", devicesData);
  const allDevices: DeviceView[] = useMemo(() => {
    if (!devicesData?.data) return [];

    return devicesData.data.map((device) => {
      let status = device.status || "OFFLINE";

      // Format storage from bytes to GB
      const totalBytes = parseInt(device.storage) || 0;
      const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(1);
      const storageDisplay = `0 / ${totalGB} GB`; // Assuming 0 used as API doesn't provide used storage yet

      return {
        id: device.id,
        device: device.name || device.deviceSerial || "Unknown Device",
        model: device.model || "Unknown Model",
        resolution: device.program?.serene_size || "1920x1080",
        location: device.location ? `Location (${device.location.lat.toFixed(2)}, ${device.location.lng.toFixed(2)})` : "Unknown Location",
        type: device.deviceType || "Unknown Type",
        programName: device.program?.name || "No device assigned",
        status: status,
        storage: storageDisplay,
        lastSync: calculateTimeAgo(device.lastSeen),
        lat: device.location?.lat || 23.8103, // Default to Dhaka if null
        lng: device.location?.lng || 90.4125,
        original: device
      };
    });
  }, [devicesData]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const statusOptions = ['All Status', 'ONLINE', 'OFFLINE', 'WAITING', 'PAIRED'];
  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(allDevices.map(d => d.type).filter(Boolean)));
    return ['All Types', ...types];
  }, [allDevices]);
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

  const onlineCount = allDevices.filter(d => d.status === "ONLINE").length;
  const offlineCount = allDevices.filter(d => d.status === "OFFLINE").length;

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between border-b border-border pb-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-Heading dark:text-white">My Devices</h1>
          <p className="text-sm text-Heading dark:text-gray-400">Screencasts when and where your content should play</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-2 md:py-3 cursor-pointer bg-bgBlue text-white rounded-lg flex items-center justify-center gap-2 shadow-customShadow hover:bg-blue-600 transition-colors w-full sm:w-auto"
        >
          <span className="text-lg"><Plus /></span> Add Device
        </button>
      </div>

      <h2 className="text-xl font-semibold text-[#1A1A1A] dark:text-white mb-4">{allDevices.length} Devices</h2>

      {/* Management + Table */}
      <div className="space-y-4">
        {/* Filtering Section - Moved Outside Table */}
        <div className="p-2 md:p-4 gap-2 rounded-[16px] border border-border bg-navbarBg flex flex-col lg:flex-row items-center self-stretch">
          <div className="flex p-3 items-center gap-2 rounded-xl bg-input dark:bg-gray-800 flex-1 w-full">
            <Search className="w-6 h-6 text-[#A3A3A3]" />
            <input
              type="text"
              placeholder="Search devices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base font-normal text-[#171717] dark:text-white placeholder:text-[#A3A3A3] focus:outline-none"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Dropdown value={statusFilter} options={statusOptions} onChange={setStatusFilter} />
            <Dropdown value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-navbarBg rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-border bg-bgGray/50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-body dark:text-gray-300">Device Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-body dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-body dark:text-gray-300">Program Playing</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-body dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-body dark:text-gray-300">Last Synced</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-body dark:text-gray-300">Storage Usage</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-navbarBg">
                {paginatedDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-[15px] font-bold text-[#171717] dark:text-white leading-tight">
                        {device.device}
                      </div>
                      <div className="text-[13px] text-[#737373] dark:text-gray-400 mt-0.5">
                        {device.resolution}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div
                        className="flex items-center gap-2 text-[#404040] dark:text-gray-300 font-medium cursor-pointer hover:text-bgBlue transition-colors group"
                        onClick={() => {
                          setSelectedLocation({
                            lat: device.lat,
                            lng: device.lng,
                            label: device.location,
                            device: device
                          });
                          setMapModalOpen(true);
                        }}
                      >
                        <MapPin className="w-4 h-4 text-[#737373] group-hover:text-bgBlue" />
                        <DeviceLocation lat={device.lat} lng={device.lng} />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`text-sm font-bold ${device.programName === "No program assigned" ? "text-[#A3A3A3] font-normal" : "text-[#171717] dark:text-white"}`}>
                        {device.programName}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {device.status === "ONLINE" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                          Online
                        </div>
                      ) : device.status === "OFFLINE" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold">
                          <WifiOff className="w-3.5 h-3.5" />
                          Offline
                        </div>
                      ) : device.status === "PAIRED" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          Paired
                        </div>
                      ) : device.status === "WAITING" ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          Waiting
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373] text-xs font-semibold">
                          {device.status}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-sm text-[#737373] dark:text-gray-400 font-medium">
                      {device.lastSync}
                    </td>
                    <td className="px-6 py-5 min-w-[160px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="text-[13px] text-[#737373] dark:text-gray-400 font-medium">
                          {device.storage}
                        </div>
                        <div className="p-[1px] bg-[#EFF6FF] border border-[#D4D4D4] rounded-full overflow-hidden">
                          <Progress value={parseStorage(device.storage)} className="h-1.5 bg-transparent [&>div]:bg-bgBlue" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <ActionMenu device={device} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedDevices.length === 0 && !isLoading && (
              <div className="p-12 text-center text-gray-500 font-medium bg-navbarBg">
                No devices found. Try adjusting your search or filters.
              </div>
            )}
            {isLoading && (
              <div className="p-12 text-center text-gray-500 font-medium bg-navbarBg flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading your devices...
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 bg-bgGray/50 dark:bg-gray-800/50">
            <div className="text-sm text-[#737373] dark:text-gray-400 font-medium text-center sm:text-left">
              Showing {filteredDevices.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg text-sm font-semibold text-body cursor-pointer shadow-customShadow transition-colors"
              >
                Previous
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredDevices.length / itemsPerPage)))}
                disabled={currentPage === 0 || currentPage >= Math.ceil(filteredDevices.length / itemsPerPage)}
                className="flex-1 sm:flex-none px-4 py-2 border border-border rounded-lg text-sm font-semibold text-body cursor-pointer shadow-customShadow transition-colors"
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
        <LeafletMapModal
          isOpen={mapModalOpen}
          onClose={() => setMapModalOpen(false)}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          label={selectedLocation.label}
          device={selectedLocation.device}
        />
      </div>
    </div>
  );
}
