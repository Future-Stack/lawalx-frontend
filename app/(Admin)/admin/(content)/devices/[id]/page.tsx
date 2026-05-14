"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Monitor,
  Wifi,
  WifiOff,
  Clock,
  MapPin,
  HardDrive,
  User,
  Shield,
  Activity,
  ChevronRight,
  Home,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit2,
  Calendar,
  Globe,
  Settings,
  RefreshCw,
  Maximize2,
  Database,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useGetGlobalDeviceDetailsQuery, useDeleteDeviceMutation, useSyncDeviceMutation, useGetDeviceActivityLogsQuery } from "@/redux/api/admin/globalDevicesApi";
import AdminLeafletMap from "@/components/Admin/map/AdminLeafletMap";
import AdminPreviewDeviceModal from "@/components/Admin/modals/AdminPreviewDeviceModal";

const getStatusBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    Online: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    ONLINE: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    Offline: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    OFFLINE: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    Syncing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    PAIRED: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    WAITING: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  };
  return styles[status] ?? "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400";
};

// --- Custom Marker Icon (SVG Data URL) ---
const deviceMarkerIcon = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
  <path d="M12 24H28M14 14H26V21H14V14ZM20 21V24ZM18 24L17 26H23L22 24H18Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`);

// --- Modals ---
const PremiumModal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-50 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group">
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function DeviceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const { data: response, isLoading, isError, refetch } = useGetGlobalDeviceDetailsQuery(deviceId);
  const [deleteDevice, { isLoading: isDeleting }] = useDeleteDeviceMutation();
  const [syncDevice, { isLoading: isSyncing }] = useSyncDeviceMutation();
  const { data: activityLogsResponse } = useGetDeviceActivityLogsQuery(deviceId);
  const activityLogs = activityLogsResponse?.data || [];

  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);


  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgBlue"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading device details...</p>
        </div>
      </div>
    );
  }

  console.log("Device Response:", response);
  if (isError || !response?.success || !response?.data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full inline-block text-red-600">
            <WifiOff className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Failed to load device</h2>
          <button onClick={() => router.push("/admin/devices")} className="text-bgBlue hover:underline">
            Back to Devices
          </button>
        </div>
      </div>
    );
  }

  const device = response?.data;

  const handleDelete = async () => {
    try {
      await deleteDevice({ id: deviceId }).unwrap();
      setIsDeleteModalOpen(false);
      router.push("/admin/devices");
    } catch (err) {
      console.error("Failed to delete device:", err);
    }
  };


  return (
    <div className="min-h-screen space-y-6 pb-12">
      {/* Header Breadcrumbs & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Link href="/admin/dashboard">
              <Home className="w-3.5 h-3.5 cursor-pointer hover:text-bgBlue transition-colors" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <Link href="/admin/devices" className="hover:text-bgBlue transition-colors">
              Devices
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="text-bgBlue font-medium">Device Details</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {device?.name || "Unknown Device"}
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">#{device?.deviceSerial || "N/A"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              try {
                await syncDevice(deviceId).unwrap();
              } catch (err) {
                console.error("Failed to sync device:", err);
              }
            }}
            disabled={isSyncing}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Force Sync"}
          </button>

          {/* <div className="relative">
            <button
              onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:bg-gray-50 transition-all cursor-pointer shadow-sm"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {isActionMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsActionMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-border rounded-xl shadow-xl z-20 overflow-hidden py-1">
                  <button 
                    onClick={() => {
                      setIsDeleteModalOpen(true);
                      setIsActionMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Device
                  </button>
                </div>
              </>
            )}
          </div> */}
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Device Information Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Device Information</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Hardware and software specifications</p>
            </div>

            <div className="p-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-8">
                  <InfoItem label="Owner" icon={User} value={device?.user?.full_name || device?.user?.username || "N/A"} />
                  <InfoItem label="Email" value={device?.user?.account?.email || device?.user?.email || "N/A"} />
                </div>
                <div className="space-y-8">
                  <InfoItem label="Model" value={device?.model || "N/A"} />
                  <InfoItem label="Screen Size" icon={Maximize2} value={device?.metadata?.screenSize || "N/A"} />
                </div>
              </div>

              <div className="mt-8 h-px bg-gray-50 dark:bg-gray-800" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <InfoItem label="Device Type" value={device?.deviceType || "N/A"} />
                <InfoItem label="OS Version" value={device?.metadata?.osVersion || "N/A"} />
                <InfoItem label="Firmware" value={device?.metadata?.firmware || "N/A"} />
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Location</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Physical location and network information</p>
            </div>

            <div className="p-6 h-fit pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  <MapPin className="w-4 h-4 text-gray-300" />
                  <span>{typeof device?.location === 'string' ? device.location : "Active Coordinates"}</span>
                </div>
                <div className="text-[11px] font-bold text-gray-400">
                  Time Zone: <span className="text-gray-900 dark:text-white">{device?.user?.timeZone || "N/A"}</span>
                </div>
              </div>

              <AdminLeafletMap
                lat={typeof device?.location === 'object' ? (device.location?.lat ?? 0) : 0}
                lng={typeof device?.location === 'object' ? (device.location?.lng ?? 0) : 0}
                onMarkerClick={() => setIsMarkerModalOpen(true)}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 px-2 pb-4">
                <InfoItem label="Network Type" value="WiFi" />
                <InfoItem label="Signal Strength" value="Optimal" />
                <InfoItem label="IP Address" value={device?.ip || "N/A"} />
              </div>
            </div>
          </div>

          {/* Activity Logs Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Logs</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Recent device events and status changes</p>
            </div>

            <div className="p-6 space-y-3">
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    action={log.description || log.actionType}
                    details={JSON.stringify(log.metadata)}
                    timestamp={log.timestamp}
                  />
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 italic text-xs">
                  No system events recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">

          {/* Status Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-fit">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Status</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Current device status</p>
            </div>

            <div className="p-6 pt-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-800/50">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Connection</span>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusBadgeStyle(device?.status || "OFFLINE")}`}>
                  <div className="w-1.5 h-1.5 bg-current rounded-full" />
                  {device?.status || "OFFLINE"}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Seen</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {device?.lastSeen ? new Date(device.lastSeen).toLocaleString() : "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Sync</p>
                <p className="text-base font-bold text-gray-900 dark:text-white">
                  {device?.last_Sync ? new Date(device.last_Sync).toLocaleString() : "Never"}
                </p>
              </div>
            </div>
          </div>

          {/* Storage Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-fit">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Storage</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Device storage usage</p>
            </div>

            <div className="p-6 pt-6 space-y-8">
              <div>
                <div className="flex justify-between items-end mb-2.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Storage Usage</span>
                  <span className="text-[11px] font-black text-gray-900 dark:text-white">
                    {device?.user?.usedStorage?.toFixed(2) || "0"} GB / {device?.user?.totalStorage?.toFixed(0) || "0"} GB
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bgBlue shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    style={{ width: `${((device?.user?.usedStorage || 0) / (device?.user?.totalStorage || 1)) * 100 || 0}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-400 font-black mt-3 tracking-[0.15em] uppercase">
                  {device?.user?.totalStorage ? (100 - ((device?.user?.usedStorage || 0) / device.user.totalStorage) * 100).toFixed(1) : "0"}% Free Space
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md shadow-red-200 dark:shadow-none active:scale-[0.98]">
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Data
                </button>
              </div>
            </div>
          </div>

          {/* Program Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden h-fit">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-50 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Program</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Currently assigned content</p>
            </div>

            <div className="p-6 pt-6 space-y-4">
              {device?.program ? (
                <div 
                  className="group p-4 rounded-xl border bg-blue-50/40 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-800/30 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer"
                  onClick={() => setIsPreviewModalOpen(true)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0">
                      <Monitor className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {device.program.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span>{device.program.serene_size}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">
                        Updated: {new Date(device.program.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 italic text-xs">
                  No program assigned to this device.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- PREMIUM MODALS --- */}

      {/* Delete Confirmation Modal */}
      <PremiumModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-600">
            <AlertTriangle className="w-10 h-10 shrink-0" />
            <p className="text-sm font-semibold">This action cannot be undone. All data related to <span className="font-bold underline">{device?.name || "this device"}</span> will be permanently removed.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-3 px-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-[1.5] py-3 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Device"}
            </button>
          </div>
        </div>
      </PremiumModal>

      {/* Marker Details Modal */}
      <PremiumModal
        isOpen={isMarkerModalOpen}
        onClose={() => setIsMarkerModalOpen(false)}
        title="Device Summary"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-bgBlue/10 rounded-2xl flex items-center justify-center">
              <Monitor className="w-8 h-8 text-bgBlue" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{device?.name || "N/A"}</h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{device?.deviceSerial || "N/A"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadgeStyle(device?.status || "OFFLINE")}`}>
                {device?.status || "OFFLINE"}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Last Seen</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{device?.lastSeen ? new Date(device.lastSeen).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-300" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                {typeof device?.location === 'string' ? device.location : "Active Coordinates"}
              </span>
            </div>
            {device?.location && typeof device.location === 'object' && (
              <Link
                href={`https://www.google.com/maps/search/?api=1&query=${device.location.lat},${device.location.lng}`}
                target="_blank"
                className="text-[10px] font-bold text-bgBlue hover:underline uppercase"
              >
                Open Maps
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMarkerModalOpen(false)}
            className="w-full py-3 bg-bgBlue text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
          >
            Close Summary
          </button>
        </div>
      </PremiumModal>

      {/* Program Preview Modal */}
      <AdminPreviewDeviceModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        device={device}
      />

    </div>
  );
}

function LogCard({
  action,
  details,
  timestamp,
}: {
  action: string;
  details?: string;
  timestamp: string;
}) {
  const { icon: Icon, color, bg, border } = getLogStyle(action);
  return (
    <div
      className={`group p-4 rounded-xl border ${bg} ${border} flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-sm`}
    >
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 flex-shrink-0">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
            {action}
          </h4>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            {new Date(timestamp).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            at{" "}
            {new Date(timestamp).toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

const getLogStyle = (action: string) => {
  const normalized = action.toLowerCase();
  if (normalized.includes("sync") || normalized.includes("synchronized")) {
    return {
      icon: RefreshCw,
      color: "text-blue-500",
      bg: "bg-blue-50/40",
      border: "border-blue-100/50",
    };
  }
  if (
    normalized.includes("online") ||
    normalized.includes("came online") ||
    normalized.includes("connected")
  ) {
    return {
      icon: Wifi,
      color: "text-green-500",
      bg: "bg-green-50/40",
      border: "border-green-100/50",
    };
  }
  if (
    normalized.includes("offline") ||
    normalized.includes("went offline") ||
    normalized.includes("disconnected")
  ) {
    return {
      icon: WifiOff,
      color: "text-gray-500",
      bg: "bg-gray-50/40",
      border: "border-gray-100/50",
    };
  }
  if (
    normalized.includes("update") ||
    normalized.includes("software") ||
    normalized.includes("firmware") ||
    normalized.includes("version")
  ) {
    return {
      icon: Database,
      color: "text-purple-500",
      bg: "bg-purple-50/40",
      border: "border-purple-100/50",
    };
  }
  if (
    normalized.includes("fail") ||
    normalized.includes("error") ||
    normalized.includes("alert") ||
    normalized.includes("warning")
  ) {
    return {
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50/40",
      border: "border-red-100/50",
    };
  }
  return {
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-50/40",
    border: "border-blue-100/50",
  };
};

function InfoItem({
  label,
  icon: Icon,
  value,
}: {
  label: string;
  icon?: any;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 group">
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className="w-4 h-4 text-gray-300 group-hover:text-bgBlue transition-colors" />
          )}
          <span className="text-sm font-bold text-gray-900 dark:text-white break-all">
            {value || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function StorageStatCard({
  icon: Icon,
  label,
  subLabel,
}: {
  icon: any;
  label: string;
  subLabel: string;
}) {
  return (
    <div className="bg-gray-50/50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-center space-y-2 hover:border-bgBlue/30 transition-all active:scale-[0.98]">
      <Icon className="w-5 h-5 text-gray-300 mx-auto" />
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1.5">
          {label}
        </p>
        <p className="text-[9px] uppercase tracking-widest font-black text-gray-400">
          {subLabel}
        </p>
      </div>
    </div>
  );
}
