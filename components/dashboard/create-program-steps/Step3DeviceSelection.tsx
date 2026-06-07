/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Loader2 } from "lucide-react";
import DeviceStatusBadge from "../../common/DeviceStatusBadge";

interface Step3DeviceSelectionProps {
  isDevicesLoading: boolean;
  devices: any[];
  programData: {
    device_ids: string[];
  };
  toggleDeviceSelection: (deviceId: string) => void;
}

export default function Step3DeviceSelection({
  isDevicesLoading,
  devices,
  programData,
  toggleDeviceSelection,
}: Step3DeviceSelectionProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Select Devices <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="border border-borderGray dark:border-gray-600 rounded-lg divide-y dark:divide-gray-700 max-h-64 overflow-y-auto scrollbar-hide">
          {isDevicesLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span>Loading devices...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No devices found.
            </div>
          ) : (
            devices.map((device: any) => (
              <div
                key={device.id}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                  programData.device_ids.includes(device.id)
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                onClick={() => toggleDeviceSelection(device.id)}
              >
                <input
                  type="checkbox"
                  checked={programData.device_ids.includes(device.id)}
                  onChange={() => toggleDeviceSelection(device.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {device.name}
                    </span>
                    <DeviceStatusBadge status={device.status} />
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {device.deviceSerial}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
