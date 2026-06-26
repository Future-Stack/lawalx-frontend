import React from "react";
import { Trash2, Monitor } from "lucide-react";

interface DeviceDetailRightPanelProps {
  device: any;
  onClearDataClick: () => void;
  onPreviewProgramClick: () => void;
}

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

export const DeviceDetailRightPanel: React.FC<DeviceDetailRightPanelProps> = ({
  device,
  onClearDataClick,
  onPreviewProgramClick,
}) => {
  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-navbarBg rounded-2xl border border-border overflow-hidden h-fit">
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Status</h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            Current device status
          </p>
        </div>

        <div className="p-6 pt-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-50 dark:border-gray-800/50">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Connection
            </span>
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${getStatusBadgeStyle(
                device?.status || "OFFLINE"
              )}`}
            >
              <div className="w-1.5 h-1.5 bg-current rounded-full" />
              {device?.status || "OFFLINE"}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Last Seen
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {device?.lastSeen ? new Date(device.lastSeen).toLocaleString() : "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Last Sync
            </p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {device?.last_Sync ? new Date(device.last_Sync).toLocaleString() : "Never"}
            </p>
          </div>
        </div>
      </div>

      {/* Storage Card */}
      <div className="bg-navbarBg rounded-2xl border border-border overflow-hidden h-fit">
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Storage</h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            Device storage usage
          </p>
        </div>

        <div className="p-6 pt-6 space-y-8">
          <div>
            <div className="flex justify-between items-end mb-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Storage Usage</span>
              <span className="text-[11px] font-black text-gray-900 dark:text-white">
                {device?.user?.usedStorage?.toFixed(2) || "0"} GB /{" "}
                {device?.user?.totalStorage?.toFixed(0) || "0"} GB
              </span>
            </div>
            <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-bgBlue shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                style={{
                  width: `${
                    ((device?.user?.usedStorage || 0) / (device?.user?.totalStorage || 1)) * 100 ||
                    0
                  }%`,
                }}
              />
            </div>
            <p className="text-[9px] text-gray-400 font-black mt-3 tracking-[0.15em] uppercase">
              {device?.user?.totalStorage
                ? (
                    100 -
                    ((device?.user?.usedStorage || 0) / device.user.totalStorage) * 100
                  ).toFixed(1)
                : "0"}
              % Free Space
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button
              onClick={onClearDataClick}
              className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md shadow-red-200 dark:shadow-none active:scale-[0.98]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Program Card */}
      <div className="bg-navbarBg rounded-2xl border border-border overflow-hidden h-fit">
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Active Program</h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            Currently assigned content
          </p>
        </div>

        <div className="p-6 pt-6 space-y-4">
          {device?.program ? (
            <div
              className="group p-4 rounded-xl border bg-blue-50/40 dark:bg-blue-900/10 border-blue-100/50 dark:border-blue-800/30 flex items-center justify-between transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer"
              onClick={onPreviewProgramClick}
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
  );
};

export default DeviceDetailRightPanel;
