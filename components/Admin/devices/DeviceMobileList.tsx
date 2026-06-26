import React from 'react';
import { useRouter } from 'next/navigation';
import { Device } from './types';
import DeviceLocation from "@/components/common/DeviceLocation";
import ActionMenu from './ActionMenu';

interface DeviceMobileListProps {
  paginatedDevices: Device[];
  onSelectLocation: (device: Device) => void;
  getStatusBadge: (status: string) => string;
  handleAction: (action: string, device: Device) => void;
}

export const DeviceMobileList: React.FC<DeviceMobileListProps> = ({
  paginatedDevices,
  onSelectLocation,
  getStatusBadge,
  handleAction,
}) => {
  const router = useRouter();

  return (
    <div className="lg:hidden space-y-4 p-4">
      {paginatedDevices.length > 0 ? (
        paginatedDevices.map((device) => {
          return (
            <div
              key={device.id}
              onClick={() => router.push(`/admin/devices/${device.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{device.device}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{device.model}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap ${getStatusBadge(device.status)}`}>
                    {device.status}
                  </span>
                  <ActionMenu device={device} onAction={handleAction} />
                </div>
              </div>

              {/* Customer Info */}
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
                <div className="min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                  <span className="ml-2 text-gray-900 dark:text-white break-words">{device.customer}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="ml-2 text-gray-900 dark:text-white break-all">{device.type}</span>
                </div>
              </div>

              {/* Location */}
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                {device.location && device.location !== 'N/A' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLocation(device);
                    }}
                    className="ml-2 text-bgBlue hover:underline cursor-pointer transition-all"
                  >
                    <DeviceLocation lat={device.lat} lng={device.lng} />
                  </button>
                ) : (
                  <span className="ml-2 text-gray-900 dark:text-white">N/A</span>
                )}
              </div>

              {/* Storage and Last Sync */}
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
                <div className="min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">Storage:</span>
                  <span className="ml-2 text-gray-900 dark:text-white break-words">{device.storage}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-gray-500 dark:text-gray-400">Last Sync:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400 break-words">{device.lastSync}</span>
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
  );
};

export default DeviceMobileList;
