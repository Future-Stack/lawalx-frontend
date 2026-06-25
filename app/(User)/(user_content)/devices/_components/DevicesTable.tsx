/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Eye, PencilLine, Trash2, MapPin, Loader2, MonitorSmartphone } from "lucide-react";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";
import { Progress } from "@/components/ui/progress";
import DeviceLocation from "@/components/common/DeviceLocation";
import { DeviceView } from "../page";
import { useDeviceSyncMutation } from "@/redux/api/users/devices/devices.api";
import { toast } from "sonner";
import CommonLoader from "@/common/CommonLoader";

interface DevicesTableProps {
  isLoading: boolean;
  devices: DeviceView[];
  onAction: (action: string, device: DeviceView) => void;
  onSelectLocation: (device: DeviceView) => void;
}

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
  } catch {
    return 0;
  }
  return 0;
};

export default function DevicesTable({
  isLoading,
  devices,
  onAction,
  onSelectLocation,
}: DevicesTableProps) {
  const [deviceSync] = useDeviceSyncMutation();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSync = async (deviceId: string) => {
    setSyncingId(deviceId);
    try {
      const res = await deviceSync({ deviceId }).unwrap();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error("Failed to sync device");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to sync device");
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="bg-navbarBg rounded-t-xl border border-border overflow-hidden">
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
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10">
                  <CommonLoader size={36} text="Loading devices..." />
                </td>
              </tr>
            ) : devices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-muted font-medium">
                  No devices found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              devices.map((device) => (
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
                      onClick={() => onSelectLocation(device)}
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
                    <DeviceStatusBadge status={device.status} />
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
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-3 px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('Preview', device);
                        }}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-bgBlue rounded-md transition-all cursor-pointer"
                        title="Preview"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('Rename', device);
                        }}
                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-bgBlue rounded-md transition-all cursor-pointer"
                        title="Rename"
                      >
                        <PencilLine className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSync(device.id);
                        }}
                        disabled={syncingId !== null}
                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                          syncingId === device.id
                            ? "bg-blue-50 dark:bg-blue-900/20 text-bgBlue"
                            : "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 hover:text-bgBlue"
                        } ${syncingId !== null ? "opacity-50 cursor-not-allowed" : ""}`}
                        title="Device Sync"
                      >
                        {syncingId === device.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <MonitorSmartphone className="w-5 h-5 md:w-6 md:h-6" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAction('Remove Device', device);
                        }}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-md transition-all cursor-pointer"
                        title="Remove Device"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
