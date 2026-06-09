/**
 * Notification Types
 * All possible notification statuses from the backend docs.
 */

// ─── Status string constants ───────────────────────────────────────────────────

/** Statuses that a regular USER can receive */
export type UserNotificationStatus =
  | 'scheduler start'
  | 'total storage'
  | 'device connections'
  | 'payment successful'
  | 'payment warning'
  | 'impersonate user';

/** Statuses that an ADMIN / SUPERADMIN can receive */
export type AdminNotificationStatus =
  | 'payment failed'
  | 'enterprise ticket created'
  | 'ticket delay'
  | 'system error'
  | 'storage warning';

/** All possible notification statuses (union) */
export type NotificationStatus = UserNotificationStatus | AdminNotificationStatus;

// ─── Notification type / severity ────────────────────────────────────────────

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

// ─── Real-time socket payload (sent by the 'notification' event) ──────────────

export interface RealtimeNotificationPayload {
  notificationId: string;
  title: string;
  body: string;
  type: NotificationType;
  resourceId?: string;
  notificationStatus: NotificationStatus;
  createdAt: string;
}

// ─── REST history item (from GET /notification/my-notification) ──────────────

export interface NotificationHistoryItem {
  notificationId: string;
  isRead: boolean;
  notificationStatus: NotificationStatus;
  notification: {
    title: string;
    body: string;
    createdAt: string;
    actorType?: string; // e.g. "USER", "DEVICE", "SYSTEM"
  };
}
