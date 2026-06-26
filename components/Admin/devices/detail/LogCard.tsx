import React from "react";
import { RefreshCw, Wifi, WifiOff, Database, AlertTriangle, Activity } from "lucide-react";

interface LogCardProps {
  action: string;
  details?: string;
  timestamp: string;
}

const getLogStyle = (action: string) => {
  const normalized = action.toLowerCase();
  if (normalized.includes("sync") || normalized.includes("synchronized")) {
    return {
      icon: RefreshCw,
      color: "text-blue-500",
      bg: "bg-blue-50/40 dark:bg-blue-950/20",
      border: "border-blue-100/50 dark:border-blue-900/30",
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
      bg: "bg-green-50/40 dark:bg-green-950/20",
      border: "border-green-100/50 dark:border-green-900/30",
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
      bg: "bg-gray-50/40 dark:bg-gray-900/20",
      border: "border-gray-100/50 dark:border-gray-800/30",
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
      bg: "bg-purple-50/40 dark:bg-purple-950/20",
      border: "border-purple-100/50 dark:border-purple-900/30",
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
      bg: "bg-red-50/40 dark:bg-red-950/20",
      border: "border-red-100/50 dark:border-red-900/30",
    };
  }
  return {
    icon: Activity,
    color: "text-blue-500",
    bg: "bg-blue-50/40 dark:bg-blue-950/20",
    border: "border-blue-100/50 dark:border-blue-900/30",
  };
};

export const LogCard: React.FC<LogCardProps> = ({
  action,
  details,
  timestamp,
}) => {
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
    </div>
  );
};

export default LogCard;
