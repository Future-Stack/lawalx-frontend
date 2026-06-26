import React from 'react';
import { useRouter } from 'next/navigation';
import { Device } from './types';
import DeviceLocation from "@/components/common/DeviceLocation";
import ActionMenu from './ActionMenu';

interface DeviceTableProps {
  paginatedDevices: Device[];
  onSelectLocation: (device: Device) => void;
  getStatusBadge: (status: string) => string;
  handleAction: (action: string, device: Device) => void;
}

export const DeviceTable: React.FC<DeviceTableProps> = ({
  paginatedDevices,
  onSelectLocation,
  getStatusBadge,
  handleAction,
}) => {
  const router = useRouter();

  return (
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedDevices.length > 0 ? (
            paginatedDevices.map((device) => {
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
                        onSelectLocation(device);
                      }}
                      className="text-bgBlue hover:underline cursor-pointer transition-all"
                    >
                      <DeviceLocation lat={device.lat} lng={device.lng} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{device.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(device.status)}`}>
                      {device.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col space-y-1">
                      <span className="text-gray-900 dark:text-white">{device.storage}</span>
                      <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full ${device.storagePercent >= 80 ? 'bg-red-500' : device.storagePercent >= 50 ? 'bg-orange-500' : 'bg-blue-500'}`} style={{ width: `${device.storagePercent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{device.lastSync}</td>
                  <td className="px-6 py-4">
                    <ActionMenu device={device} onAction={handleAction} />
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                No devices found for the selected time range and filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceTable;
