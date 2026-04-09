import { Monitor, MapPin } from "lucide-react";
import { Device } from "@/types/device";
import DeviceActionsMenu from "./DeviceActionsMenu";
import DeviceLocation from "@/components/common/DeviceLocation";
import { useState } from "react";
import Dropdown from "@/components/shared/Dropdown";

interface Props {
  device: Device;
  isSelected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  onRename: () => void;
  onReport: () => void;
  onRemove: () => void;
}

export default function DeviceRow({
  device,
  isSelected,
  onToggle,
  onPreview,
  onRename,
  onReport,
  onRemove,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 relative transition-colors">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-bgBlue focus:ring-bgBlue"
        />
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {device.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{device.mac}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {device.lat && device.lng ? (
            <DeviceLocation lat={device.lat} lng={device.lng} fallbackLabel={device.location} />
          ) : (
            device.location
          )}
        </div>
      </td>

      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
        {device.screen && device.screen !== "No device assigned" ? (
          device.screen
        ) : (
          <span className="text-gray-400 italic">No program assigned</span>
        )}
      </td>

      <td className="px-4 py-4">
        {device.status === "ONLINE" ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
          </span>
        ) : device.status === "OFFLINE" ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Offline
          </span>
        ) : device.status === "PAIRED" ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Paired
          </span>
        ) : device.status === "WAITING" ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full border border-orange-200 dark:border-orange-800">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span> Waiting
          </span>
        ) : (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-lg border border-gray-300 dark:border-gray-600">
            {device.status}
          </span>
        )}
      </td>

      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
        {device.lastSynced}
      </td>

      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
        {device.storage}
      </td>

      {/* Actions Menu Cell */}
      <td className="px-4 py-4 relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
        >
          <svg
            className="w-5 h-5 text-gray-400 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Menu - anchored to the left of the button */}
            <div className="absolute right-16 top-[-60] mt-1 z-50">
              <DeviceActionsMenu
                device={device}
                onPreview={onPreview}
                onRename={onRename}
                onReport={onReport}
                onRemove={onRemove}
                onClose={() => setMenuOpen(false)}
              />
            </div>
          </>
        )}
      </td>
    </tr>
  );
}