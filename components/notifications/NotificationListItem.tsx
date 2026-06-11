"use client";

import { formatDistanceToNow } from "date-fns";
import {
  getNotificationIcon,
  getNotificationStyleClasses,
} from "@/lib/notificationUtils";
import type { NotificationHistoryItem } from "@/types/notification";

interface NotificationListItemProps {
  item: NotificationHistoryItem;
  onClick: (item: NotificationHistoryItem) => void;
  /** 'sm' for navbar dropdown, 'md' for default */
  size?: "sm" | "md";
}

/**
 * Single notification row — used inside navbar dropdowns.
 */
export default function NotificationListItem({
  item,
  onClick,
  size = "sm",
}: NotificationListItemProps) {
  const Icon = getNotificationIcon(item);
  const style = getNotificationStyleClasses(item.notification?.type);
  const iconSize = size === "sm" ? "w-9 h-9" : "w-10 h-10";

  return (
    <div
      onClick={() => onClick(item)}
      className={`px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
        !item.isRead ? style.unreadBg : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <div
            className={`${iconSize} flex items-center justify-center rounded-full border ${style.icon} ${style.iconBg} ${style.iconBorder}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className={`text-sm font-semibold mb-1 ${
              !item.isRead
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {item.notification.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
            {item.notification.body}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatDistanceToNow(new Date(item.notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        {!item.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
