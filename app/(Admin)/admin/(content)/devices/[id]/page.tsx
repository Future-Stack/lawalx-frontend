/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  WifiOff,
  AlertTriangle,
  Monitor,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import {
  useGetGlobalDeviceDetailsQuery,
  useSyncDeviceMutation,
  useGetDeviceActivityLogsQuery,
  useClearDeviceDataMutation,
} from "@/redux/api/admin/globalDevicesApi";
import { toast } from "sonner";
import AdminPreviewDeviceModal from "@/components/Admin/modals/AdminPreviewDeviceModal";
import DeviceLocation from "@/components/common/DeviceLocation";

// Import refactored detail page components
import PremiumModal from "@/components/Admin/devices/detail/PremiumModal";
import DeviceDetailHeader from "@/components/Admin/devices/detail/DeviceDetailHeader";
import DeviceDetailInfoCard from "@/components/Admin/devices/detail/DeviceDetailInfoCard";
import DeviceDetailLocationCard from "@/components/Admin/devices/detail/DeviceDetailLocationCard";
import DeviceDetailActivityLogs from "@/components/Admin/devices/detail/DeviceDetailActivityLogs";
import DeviceDetailRightPanel from "@/components/Admin/devices/detail/DeviceDetailRightPanel";

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

export default function DeviceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.id as string;

  const { data: response, isLoading, isError } = useGetGlobalDeviceDetailsQuery(deviceId);
  const [clearDeviceData, { isLoading: isClearing }] = useClearDeviceDataMutation();
  const [syncDevice, { isLoading: isSyncing }] = useSyncDeviceMutation();
  const { data: activityLogsResponse } = useGetDeviceActivityLogsQuery(deviceId);
  const activityLogs = activityLogsResponse?.data || [];

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
  const lat = typeof device?.location === "object" ? (device.location?.lat ?? 0) : 0;
  const lng = typeof device?.location === "object" ? (device.location?.lng ?? 0) : 0;
  const isNA = lat === 0 && lng === 0;

  const handleClearData = async () => {
    try {
      const result = await clearDeviceData(deviceId).unwrap();
      if (result.success) {
        toast.success(result.message || "Device data cleared successfully");
      } else {
        toast.error(result.message || "Failed to clear device data");
      }
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Failed to clear device data:", err);
      toast.error("Failed to clear device data");
    }
  };

  const handleSync = async () => {
    try {
      await syncDevice(deviceId).unwrap();
    } catch (err) {
      console.error("Failed to sync device:", err);
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-12">
      <DeviceDetailHeader
        deviceName={device?.name || "Unknown Device"}
        deviceSerial={device?.deviceSerial || "N/A"}
        isSyncing={isSyncing}
        onSync={handleSync}
      />

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <DeviceDetailInfoCard device={device} />

          <DeviceDetailLocationCard
            device={device}
            lat={lat}
            lng={lng}
            isNA={isNA}
            onMarkerClick={() => setIsMarkerModalOpen(true)}
          />

          <DeviceDetailActivityLogs activityLogs={activityLogs} />
        </div>

        {/* Right Column (1/3) */}
        <DeviceDetailRightPanel
          device={device}
          onClearDataClick={() => setIsDeleteModalOpen(true)}
          onPreviewProgramClick={() => setIsPreviewModalOpen(true)}
        />
      </div>

      {/* --- PREMIUM MODALS --- */}

      {/* Delete Confirmation Modal */}
      <PremiumModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Clear Data"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl text-red-600">
            <AlertTriangle className="w-10 h-10 shrink-0" />
            <p className="text-sm font-semibold">
              This action cannot be undone. All data related to{" "}
              <span className="font-bold underline">{device?.name || "this device"}</span> will be
              permanently removed.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 cursor-pointer py-3 px-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClearData}
              disabled={isClearing}
              className="flex-[1.5] cursor-pointer py-3 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
            >
              {isClearing ? "Clearing..." : "Yes, Clear Data"}
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
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {device?.name || "N/A"}
              </h4>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                {device?.deviceSerial || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Status</p>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadgeStyle(
                  device?.status || "OFFLINE"
                )}`}
              >
                {device?.status || "OFFLINE"}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Last Seen</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {device?.lastSeen ? new Date(device.lastSeen).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-300" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                {device?.location && typeof device.location === "object" ? (
                  <DeviceLocation lat={device.location.lat ?? 0} lng={device.location.lng ?? 0} />
                ) : (
                  (typeof device?.location === "string" ? device.location : null) || "N/A"
                )}
              </span>
            </div>
            {!isNA && device?.location && typeof device.location === "object" && (
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
