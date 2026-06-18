'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';
import { getNotificationSocket, disconnectNotificationSocket } from '@/lib/notificationSocket';
import { toast } from 'sonner';
import type { RealtimeNotificationPayload } from '@/types/notification';
import { baseApi } from '@/redux/api/baseApi';
import { useAppDispatch } from '@/redux/store/hook';

// ─── Toast style based on notification type ────────────────────────────────────

function showNotificationToast(payload: RealtimeNotificationPayload) {
  const title = (payload.title || '').toLowerCase();
  const body = (payload.body || '').toLowerCase();
  const textToTest = `${title} ${body}`;

  // Suppress duplicate socket notification toasts for synchronous actions
  // as they already display immediate HTTP success toasts locally.
  const isSyncAction = 
    title.includes('program') || body.includes('program') ||
    title.includes('device') || body.includes('device') ||
    title.includes('schedule') || body.includes('schedule') ||
    title.includes('folder') || body.includes('folder');

  const isVideo = textToTest.includes('video') || textToTest.includes('upload');

  if (isSyncAction && !isVideo) {
    return;
  }

  const options = {
    description: payload.body,
    duration: 5000,
  };

  const type = (payload.type ?? 'INFO').toUpperCase();
  
  const hasSuccessKeywords = 
    textToTest.includes('success') || 
    textToTest.includes('complete') || 
    textToTest.includes('uploaded') ||
    textToTest.includes('created') ||
    textToTest.includes('added') ||
    textToTest.includes('deleted') ||
    textToTest.includes('removed') ||
    textToTest.includes('assigned');

  const hasErrorKeywords = 
    textToTest.includes('fail') || 
    textToTest.includes('error') || 
    textToTest.includes('invalid') || 
    textToTest.includes('reject');
  
  const isImplicitSuccess = hasSuccessKeywords && !hasErrorKeywords;

  if (isImplicitSuccess) {
    toast.success(payload.title, options);
  } else if (type === 'WARNING' || type === 'ALERT') {
    toast.warning(payload.title, options);
  } else if (type === 'ERROR' || type === 'SYSTEM') {
    toast.error(payload.title, options);
  } else if (type === 'PROMOTION' || type === 'MESSAGE') {
    toast.success(payload.title, options);
  } else {
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

    return () => {
      socket.off('connectionSuccess', onConnectionSuccess);
      socket.off('notification', onNotification);
      socket.off('connect_error', onConnectError);
    };
  }, [token, dispatch]);

  // This provider renders nothing visible
  return null;
}
