import type { LucideIcon } from 'lucide-react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  HardDrive,
  Monitor,
  Server,
  Settings,
  Tag,
  User,
  UserCog,
  XCircle,
} from 'lucide-react';
import type {
  NotificationHistoryItem,
  NotificationType,
  PanelRole,
} from '@/types/notification';

// ─── Icon by notificationStatus ────────────────────────────────────────────────

const STATUS_ICON_MAP: Record<string, LucideIcon> = {
  'scheduler start': Calendar,
  'total storage': HardDrive,
  'device connections': Monitor,
  'payment successful': CheckCircle,
  'payment warning': AlertTriangle,
  'impersonate user': UserCog,
  'payment failed': XCircle,
  'enterprise ticket created': Briefcase,
  'ticket delay': Clock,
  'system error': AlertOctagon,
  'storage warning': Server,
  'video upload': CheckCircle,
  'schedule updated': Calendar,
  'schedule created': Calendar,
};

const ACTOR_ICON_MAP: Record<string, LucideIcon> = {
  USER: User,
  DEVICE: Monitor,
  SYSTEM: Settings,
};

/** Read status from top-level or nested notification object */
export function resolveNotificationStatus(item: NotificationHistoryItem): string | null {
  const status =
    item.notificationStatus ?? item.notification?.notificationStatus ?? null;
  if (status) return status;

  const tagKey = item.notification?.metadata?.tagKey;
  if (tagKey) return 'ticket tagged';

  return null;
}

/** Pick the right Lucide icon for a notification */
export function getNotificationIcon(item: NotificationHistoryItem): LucideIcon {
  const status = resolveNotificationStatus(item);
  if (status && STATUS_ICON_MAP[status]) return STATUS_ICON_MAP[status];
  if (status === 'ticket tagged') return Tag;

  const actor = item.notification?.actorType ?? 'SYSTEM';
  return ACTOR_ICON_MAP[actor] ?? Bell;
}

// ─── Color / style by NotificationType ─────────────────────────────────────────

export interface NotificationStyleClasses {
  icon: string;
  iconBg: string;
  iconBorder: string;
  unreadBg: string;
}

export function getNotificationStyleClasses(
  type?: NotificationType | string | null
): NotificationStyleClasses {
  const t = (type ?? 'INFO').toUpperCase();

  if (t === 'WARNING' || t === 'ALERT') {
    return {
      icon: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-50 dark:bg-orange-900/20',
      iconBorder: 'border-orange-200 dark:border-orange-800',
      unreadBg: 'bg-orange-50/50 dark:bg-orange-900/10',
    };
  }
  if (t === 'ERROR') {
    return {
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconBorder: 'border-red-200 dark:border-red-800',
      unreadBg: 'bg-red-50/50 dark:bg-red-900/10',
    };
  }
  if (t === 'PROMOTION') {
    return {
      icon: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBorder: 'border-purple-200 dark:border-purple-800',
      unreadBg: 'bg-purple-50/50 dark:bg-purple-900/10',
    };
  }
  if (t === 'TASK' || t === 'MESSAGE') {
    return {
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBorder: 'border-blue-200 dark:border-blue-800',
      unreadBg: 'bg-blue-50/50 dark:bg-blue-900/10',
    };
  }
  // INFO, SYSTEM, default
  return {
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconBorder: 'border-blue-200 dark:border-blue-800',
    unreadBg: 'bg-blue-50/50 dark:bg-blue-900/10',
  };
}

// ─── Role helper ───────────────────────────────────────────────────────────────

export function normalizePanelRole(role: string | null | undefined): PanelRole {
  const r = (role ?? '').toUpperCase();
  if (r === 'ADMIN' || r === 'SUPERADMIN' || r === 'SUPER_ADMIN') return 'ADMIN';
  if (r === 'SUPPORTER') return 'SUPPORTER';
  return 'USER';
}

// ─── Navigation ────────────────────────────────────────────────────────────────

const TICKET_RESOURCE_TYPES = ['OTHER', 'MESSAGE', 'TASK'];

function getUserSupportRoute(ticketId?: string | null): string {
  return ticketId ? `/support?openTicket=${ticketId}` : '/support';
}

/**
 * Extract the support TICKET uuid from a notification.
 * Primary source: notification.resourceId (same contract as admin panel).
 * Never use notification.id / notificationId — those are notification record IDs.
 */
function getTicketId(item: NotificationHistoryItem): string | null {
  const n = item.notification;
  const meta = n?.metadata as Record<string, unknown> | null | undefined;
  const resourceId = n?.resourceId;
  const resourceType = n?.resourceType;
  const type = (n?.type ?? '').toUpperCase();
  const status = resolveNotificationStatus(item);

  // Primary: resourceId is the ticket uuid (admin uses this for ?openTicket=)
  if (resourceId && typeof resourceId === 'string') {
    if (resourceType && TICKET_RESOURCE_TYPES.includes(resourceType)) {
      return resourceId;
    }
    if (type === 'MESSAGE' || type === 'TASK') {
      return resourceId;
    }
    if (status?.includes('ticket')) {
      return resourceId;
    }
  }

  if (meta?.ticketId && typeof meta.ticketId === 'string') {
    return meta.ticketId;
  }
  if (meta?.supportTicketId && typeof meta.supportTicketId === 'string') {
    return meta.supportTicketId;
  }

  return null;
}

function isTicketRelatedNotification(item: NotificationHistoryItem): boolean {
  const rt = item.notification?.resourceType;
  if (rt && TICKET_RESOURCE_TYPES.includes(rt)) return true;
  if (getTicketId(item)) return true;
  const status = resolveNotificationStatus(item);
  if (status?.includes('ticket')) return true;
  const type = (item.notification?.type ?? '').toUpperCase();
  if (type === 'MESSAGE' || type === 'TASK') return true;
  return false;
}

/** Returns the page URL to navigate to when a notification is clicked */
export function getNotificationRoute(
  item: NotificationHistoryItem,
  role: PanelRole
): string | null {
  const status = resolveNotificationStatus(item);
  const ticketId = getTicketId(item);
  const resourceId = item.notification?.resourceId;
  const resourceType = item.notification?.resourceType;

  // ── Status-based routes (role-aware) ──────────────────────────────────────
  if (status && role === 'USER') {
    const routes: Record<string, string> = {
      'scheduler start': resourceId ? `/schedules/${resourceId}` : '/schedules',
      'total storage': '/content',
      'device connections': '/devices',
      'payment successful': '/profile-settings/subscriptions',
      'payment warning': '/profile-settings/subscriptions',
      'ticket tagged': getUserSupportRoute(ticketId),
      'video upload': resourceId ? `/content/${resourceId}` : '/content',
      'schedule updated': resourceId ? `/schedules/${resourceId}` : '/schedules',
      'schedule created': resourceId ? `/schedules/${resourceId}` : '/schedules',
    };
    if (routes[status]) return routes[status];
  }

  // USER ticket deep-link via resourceId — same pattern as admin ?openTicket=
  if (role === 'USER' && ticketId) {
    const type = (item.notification?.type ?? '').toUpperCase();
    const isTicketLink =
      (resourceType && TICKET_RESOURCE_TYPES.includes(resourceType)) ||
      type === 'MESSAGE' ||
      type === 'TASK' ||
      Boolean(status?.includes('ticket'));

    if (isTicketLink) {
      return getUserSupportRoute(ticketId);
    }
  }

  if (status && role === 'ADMIN') {
    const routes: Record<string, string> = {
      'payment failed': '/admin/subscription',
      'enterprise ticket created': ticketId
        ? `/admin/support/support-tickets?openTicket=${ticketId}`
        : '/admin/support/enterprise-requests',
      'ticket delay': ticketId
        ? `/admin/support/support-tickets?openTicket=${ticketId}`
        : '/admin/support/support-tickets',
      'system error': '/admin/system-health',
      'storage warning': '/admin/system-health',
    };
    if (routes[status]) return routes[status];
    if (status === 'ticket tagged' && ticketId) {
      return `/admin/support/support-tickets?openTicket=${ticketId}`;
    }
  }

  if (status && role === 'SUPPORTER') {
    if (
      status === 'ticket delay' ||
      status === 'enterprise ticket created' ||
      status === 'ticket tagged'
    ) {
      return ticketId
        ? `/supporter/overview?openTicket=${ticketId}`
        : '/supporter/overview';
    }
  }

  // ── Resource-type fallback ──────────────────────────────────────────────────
  if (resourceId && resourceType) {
    if (resourceType === 'PROGRAM') return `/programs/${resourceId}`;
    if (resourceType === 'SCHEDULE') return `/schedules/${resourceId}`;
    if (resourceType === 'FILE') return `/content/${resourceId}`;
    if (resourceType === 'SYSTEM' && role === 'ADMIN') return '/admin/system-health';
    if (TICKET_RESOURCE_TYPES.includes(resourceType) && ticketId) {
      if (role === 'ADMIN') return `/admin/support/support-tickets?openTicket=${ticketId}`;
      if (role === 'SUPPORTER') return `/supporter/overview?openTicket=${ticketId}`;
      if (role === 'USER') return getUserSupportRoute(ticketId);
    }
  }

  // ── Metadata fallback (tagged tickets with null status) ─────────────────────
  if (ticketId) {
    if (role === 'ADMIN') return `/admin/support/support-tickets?openTicket=${ticketId}`;
    if (role === 'SUPPORTER') return `/supporter/overview?openTicket=${ticketId}`;
    if (role === 'USER') return getUserSupportRoute(ticketId);
  }

  // ── USER catch-all: any ticket-related notification → /support ────────────
  if (role === 'USER' && isTicketRelatedNotification(item)) {
    return getUserSupportRoute(ticketId);
  }

  return null;
}
