'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentRole } from '@/redux/features/auth/authSlice';
import { useReadNotificationMutation } from '@/redux/api/users/notificationApi';
import {
  getNotificationRoute,
  normalizePanelRole,
} from '@/lib/notificationUtils';
import type { NotificationHistoryItem } from '@/types/notification';

/**
 * Shared click handler for notification items.
 * 1. Marks as read (if unread)
 * 2. Navigates to the relevant page (if a route exists)
 */
export function useNotificationClick(options?: { onAfterClick?: () => void }) {
  const router = useRouter();
  const role = useAppSelector(selectCurrentRole);
  const [readNotification] = useReadNotificationMutation();

  const handleNotificationClick = async (item: NotificationHistoryItem) => {
    if (!item.isRead) {
      try {
        await readNotification(item.notificationId).unwrap();
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    }

    const route = getNotificationRoute(item, normalizePanelRole(role));
    if (route) {
      options?.onAfterClick?.();
      router.push(route);
    }
  };

  return { handleNotificationClick };
}
