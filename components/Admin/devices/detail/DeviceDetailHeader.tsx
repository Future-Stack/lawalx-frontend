import React from "react";
import Link from "next/link";
import { Home, ChevronRight, RefreshCw } from "lucide-react";

interface DeviceDetailHeaderProps {
  deviceName: string;
  deviceSerial: string;
  isSyncing: boolean;
  onSync: () => void;
}

export const DeviceDetailHeader: React.FC<DeviceDetailHeaderProps> = ({
  deviceName,
  deviceSerial,
  isSyncing,
  onSync,
}) => {
  return (
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
            {deviceName || "Unknown Device"}
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-0.5 uppercase tracking-wide">
            #{deviceSerial || "N/A"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="group cursor-pointer flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 transition-transform duration-500 group-hover:rotate-180 ${
              isSyncing ? "animate-spin" : ""
            }`}
          />
          {isSyncing ? "Syncing..." : "Force Sync"}
        </button>
      </div>
    </div>
  );
};

export default DeviceDetailHeader;
