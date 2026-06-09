'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';
import { getNotificationSocket, disconnectNotificationSocket } from '@/lib/notificationSocket';
import { toast } from 'sonner';
import type { RealtimeNotificationPayload, NotificationType } from '@/types/notification';
import { baseApi } from '@/redux/api/baseApi';
import { useAppDispatch } from '@/redux/store/hook';

// ─── Toast style based on notification type ────────────────────────────────────

function showNotificationToast(payload: RealtimeNotificationPayload) {
  const options = {
    description: payload.body,
    duration: 5000,
  };

  const type: NotificationType = payload.type;

  if (type === 'SUCCESS') {
    toast.success(payload.title, options);
  } else if (type === 'WARNING') {
    toast.warning(payload.title, options);
  } else if (type === 'ERROR') {
    toast.error(payload.title, options);
  } else {
    // INFO (default)
    toast.info(payload.title, options);
  }
}

/**
 * NotificationSocketProvider
 *
 * Connects to the /notification Socket.IO namespace after login.
 * Listens for real-time notification events and shows a toast.
 * Also invalidates the RTK Query Notification cache so the bell tray
 * updates automatically without a page refresh.
 *
 * This component renders NOTHING — it is purely a side-effect provider.
 * Place it inside ReduxProvider in app/layout.tsx.
 */
export default function NotificationSocketProvider() {
  const token = useAppSelector(selectCurrentToken);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Only connect when the user is authenticated
    if (!token) {
      disconnectNotificationSocket();
      return;
    }

    const socket = getNotificationSocket(token);

    // ── Event: Connection confirmed by server ──────────────────────────────
    const onConnectionSuccess = (data: { userId: string }) => {
      console.log('[NotificationSocket] Auth success for userId:', data.userId);
    };

    // ── Event: New real-time notification ─────────────────────────────────
    const onNotification = (payload: RealtimeNotificationPayload) => {
      console.log('[NotificationSocket] Received notification:', payload);

      // 1. Show toast to the user
      showNotificationToast(payload);

      // 2. Invalidate RTK Query cache so the notification tray refreshes
      dispatch(baseApi.util.invalidateTags(['Notification']));
    };

    // ── Event: Connection error ────────────────────────────────────────────
    const onConnectError = (err: Error) => {
      console.error('[NotificationSocket] Connection error:', err.message);
    };

    socket.on('connectionSuccess', onConnectionSuccess);
    socket.on('notification', onNotification);
    socket.on('connect_error', onConnectError);

    // Cleanup: remove listeners only (do NOT disconnect — keep socket alive
    // for the entire session, just like the chat socket pattern)
    return () => {
      socket.off('connectionSuccess', onConnectionSuccess);
      socket.off('notification', onNotification);
      socket.off('connect_error', onConnectError);
    };
  }, [token, dispatch]);

  // This provider renders nothing visible
  return null;
}
