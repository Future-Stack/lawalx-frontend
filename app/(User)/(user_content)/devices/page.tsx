/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";

import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import PreviewDeviceModal from "@/components/devices/modals/PreviewDeviceModal";
import LeafletMapModal from "@/components/shared/modals/LeafletMapModal";
import RenameDeviceModal from "@/components/devices/modals/RenameDeviceModal";
import RemoveDeviceModal from "@/components/devices/modals/RemoveDeviceModal";
import ReportDeviceModal from "@/components/devices/modals/ReportDeviceModal";
import { useDeleteDeviceMutation, useGetMyAllDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { Device as ApiDevice } from "@/redux/api/users/devices/devices.type";
import { toast } from "sonner";

import DevicesFilter from "./_components/DevicesFilter";
import DevicesTable from "./_components/DevicesTable";
import DevicesPagination from "./_components/DevicesPagination";

// Local types to match admin page logic, adapting to API data
export type DeviceView = {
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

export default function DevicesPage() {
  const { data: devicesData, isLoading } = useGetMyAllDevicesDataQuery(undefined);
  const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();

  const allDevices: DeviceView[] = useMemo(() => {
    if (!devicesData?.data) return [];

    return devicesData.data.map((device) => {
      const status = device.status || "OFFLINE";

      const usedStorage = device.user?.usedStorage || 0;
      const totalStorage = device.user?.totalStorage || 0;
      const storageDisplay = `${usedStorage.toFixed(2)} GB / ${totalStorage.toFixed(0)} GB`;

      return {
        id: device.id || (device as any)._id || (device as any).deviceId || "",
        device: device.name || device.deviceSerial || "Unknown Device",
        model: device.model || "Unknown Model",
        resolution: device.program?.serene_size || "1920x1080",
        location: device.location ?
          (device.location.lat === 0 && device.location.lng === 0 ? "N/A" : `Location (${device.location.lat.toFixed(2)}, ${device.location.lng.toFixed(2)})`)
          : "N/A",
        type: device.deviceType || "Unknown Type",
        programName: device.program?.name || "No program assigned",
        status: status,
        storage: storageDisplay,
        lastSync: calculateTimeAgo(device.lastSeen),
        lat: device.location?.lat ?? 23.8103, // Default to Dhaka if null/undefined
        lng: device.location?.lng ?? 90.4125,
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
        {/* Filtering Section */}
        <DevicesFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={statusOptions}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          typeOptions={typeOptions}
        />

        {/* Table Container */}
        <div className="bg-navbarBg rounded-xl border border-border overflow-hidden">
          <DevicesTable
            isLoading={isLoading}
            devices={paginatedDevices}
            onAction={handleAction}
            onSelectLocation={(device) => {
              if (device.lat === 0 && device.lng === 0) return;
              setSelectedLocation({
                lat: device.lat,
                lng: device.lng,
                label: device.location,
                device: device
              });
              setMapModalOpen(true);
            }}
          />

          {/* Pagination */}
          <DevicesPagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filteredCount={filteredDevices.length}
            itemsPerPage={itemsPerPage}
          />
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
