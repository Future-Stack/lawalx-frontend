"use client";

import { formatDistanceToNow } from "date-fns";
import { CheckCircle, CircleCheckBigIcon } from "lucide-react";
import {
  getNotificationIcon,
  getNotificationStyleClasses,
} from "@/lib/notificationUtils";
import type { NotificationHistoryItem } from "@/types/notification";

interface NotificationCardProps {
  item: NotificationHistoryItem;
  onClick: (item: NotificationHistoryItem) => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  /** Admin page uses slightly larger styling */
  variant?: "user" | "admin";
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
}

/**
 * Full notification card — used on /notifications pages.
 */
export default function NotificationCard({
  item,
  onClick,
  onMarkRead,
  onDelete,
  variant = "user",
  isSelected = false,
  onToggleSelect,
}: NotificationCardProps) {
  const Icon = getNotificationIcon(item);
  const style = getNotificationStyleClasses(item.notification?.type);
  const isAdmin = variant === "admin";

  return (
    <div
      onClick={() => onClick(item)}
      className={`flex items-center gap-4 transition-all duration-200 cursor-pointer group border hover:border-bgBlue ${
        isAdmin ? "p-5 rounded-2xl gap-5" : "p-4 rounded-xl gap-4"
      } ${
        !item.isRead
          ? `${style.unreadBg} ${isAdmin ? "border-blue-100 dark:border-blue-900/30" : "border-blue-100/50 dark:border-blue-900/20"}`
          : isAdmin
            ? "bg-transparent border-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
            : "border-border hover:bg-white dark:hover:bg-gray-700/40"
      }`}
    >
      {onToggleSelect ? (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.notificationId, e);
          }}
          className="h-10 w-10 flex items-center justify-center flex-shrink-0 cursor-pointer group/chk"
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
              isSelected
                ? "bg-bgBlue border-bgBlue text-white"
                : "border-gray-300 dark:border-gray-600 group-hover/chk:border-bgBlue"
            }`}
          >
            {isSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
          </div>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-full border flex-shrink-0 transition-transform group-hover:scale-110 ${
            isAdmin ? "h-12 w-12 shadow-sm" : "h-10 w-10"
          } ${!item.isRead ? `${style.iconBorder} ${style.icon} bg-white dark:bg-gray-800` : "border-gray-200 dark:border-gray-700 text-muted bg-navbarBg"}`}
        >
          <Icon className={isAdmin ? "w-6 h-6" : "w-5 h-5"} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3
              className={`font-semibold mb-1 ${isAdmin ? "text-md font-bold tracking-tight" : "text-sm"} ${
                !item.isRead
                  ? isAdmin
                    ? "text-headings"
                    : "text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {item.notification.title}
            </h3>
            <p
              className={`text-sm leading-relaxed mb-2 ${!item.isRead && isAdmin ? "text-body font-medium" : "text-gray-600 dark:text-gray-400"}`}
            >
              {item.notification.body}
            </p>
          </div>
          {!item.isRead && (
            <span
              className={`rounded-full flex-shrink-0 ${isAdmin ? "w-2.5 h-2.5 bg-bgBlue shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "w-2 h-2 bg-blue-500"} mt-2`}
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {formatDistanceToNow(new Date(item.notification.createdAt), {
              addSuffix: true,
            })}
          </span>

          {(onMarkRead || onDelete) && (
            <div className="flex items-center gap-2 opacity-100 transition-opacity">
              {!item.isRead && onMarkRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(item.notificationId);
                  }}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Mark as read"
                >
                  <CheckCircle className="w-5 h-5 cursor-pointer" />
                </button>
              )}
              {/* {onDelete && (
                <button
                  onClick={(e) => onDelete(item.notificationId, e)}
                  className="p-1.5 text-gray-500 hover:bg-red-500 hover:text-white rounded-md transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
