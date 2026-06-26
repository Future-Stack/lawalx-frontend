import React from "react";
import LogCard from "./LogCard";

interface DeviceDetailActivityLogsProps {
  activityLogs: any[];
}

export const DeviceDetailActivityLogs: React.FC<DeviceDetailActivityLogsProps> = ({
  activityLogs,
}) => {
  return (
    <div className="bg-navbarBg rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-border">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Activity Logs</h2>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
          Recent device events and status changes
        </p>
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
  );
};

export default DeviceDetailActivityLogs;
