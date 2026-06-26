/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { formatDistanceToNow, format } from "date-fns";
import { Activity, Clock, Hash, Info, FileText } from "lucide-react";

interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
}

export default function ActivityDetailsModal({ isOpen, onClose, activity }: ActivityDetailsModalProps) {
  if (!activity) return null;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "PPP pp"); // e.g. "June 26th, 2026 at 9:48 AM"
    } catch {
      return dateStr || "N/A";
    }
  };

  const formatRelative = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md w-full p-6 bg-navbarBg rounded-2xl border border-border shadow-2xl flex flex-col gap-6">
        <DialogHeader className="border-b border-border pb-4 flex flex-row items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <DialogTitle className="text-lg font-bold text-headings truncate">
              Activity Details
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Full log information for this event
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-left">
          {/* Action Type */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Action Type
            </span>
            <span className="text-sm font-semibold text-headings bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-border">
              {activity.actionType || "N/A"}
            </span>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Description
            </span>
            <p className="text-sm text-body bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-border whitespace-pre-wrap leading-relaxed">
              {activity.description || "No description provided."}
            </p>
          </div>

          {/* Timestamp & ID Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Event Date
              </span>
              <span className="text-xs text-body bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-border">
                {formatDate(activity.createdAt)}
                {activity.createdAt && (
                  <span className="block text-[10px] text-muted mt-1">
                    {formatRelative(activity.createdAt)}
                  </span>
                )}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> Activity ID
              </span>
              <span className="text-[11px] text-body bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-border break-all font-mono">
                {activity.id || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-bgBlue hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg shadow-customShadow transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
