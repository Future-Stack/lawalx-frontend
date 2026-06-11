/**
 * Notification types — aligned with backend Prisma enums + API response.
 */

export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'ALERT'
  | 'MESSAGE'
  | 'TASK'
  | 'SYSTEM'
  | 'PROMOTION';

export type NotificationResourceType =
  | 'PROJECT'
  | 'TASK'
  | 'PROGRAM'
  | 'MESSAGE'
  | 'SYSTEM'
  | 'FILE'
  | 'SCHEDULE'
  | 'OTHER';

export type NotificationActorType = 'USER' | 'SYSTEM' | 'DEVICE';

export type UserNotificationStatus =
  | 'scheduler start'
  | 'total storage'
  | 'device connections'
  | 'payment successful'
  | 'payment warning'
  | 'impersonate user';

export type AdminNotificationStatus =
  | 'payment failed'
  | 'enterprise ticket created'
  | 'ticket delay'
  | 'system error'
  | 'storage warning';

export type NotificationStatus = UserNotificationStatus | AdminNotificationStatus;

export type PanelRole = 'USER' | 'ADMIN' | 'SUPPORTER';

export interface RealtimeNotificationPayload {
  notificationId: string;
  title: string;
  body: string;
  type: NotificationType | string;
  resourceId?: string | null;
  notificationStatus?: NotificationStatus | string | null;
  createdAt: string;
}

export interface NotificationDetail {
  id: string;
  actorType?: NotificationActorType | string;
  actorId?: string | null;
  title: string;
  body: string;
  type?: NotificationType | string;
  resourceType?: NotificationResourceType | string;
  resourceId?: string | null;
  notificationStatus?: NotificationStatus | string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationHistoryItem {
  userId?: string;
  notificationId: string;
  isRead: boolean;
  readAt?: string | null;
  isDelivered?: boolean;
  notificationStatus?: NotificationStatus | string | null;
  notification: NotificationDetail;
}
