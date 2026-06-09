/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Bell, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/components/Admin/layout/ThemeProvider';
import { useGetUserProfileQuery } from '@/redux/api/users/userProfileApi';
import { useGetMyNotificationsQuery, useReadAllNotificationsMutation, useReadNotificationMutation } from '@/redux/api/users/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { User, Monitor, Settings as SettingsIcon } from 'lucide-react';

const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '');
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'USER': return User;
    case 'DEVICE': return Monitor;
    case 'SYSTEM': return SettingsIcon;
    default: return Bell;
  }
};

interface SupporterNavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function SupporterNavbar({
  isCollapsed,
  setIsCollapsed,
}: SupporterNavbarProps) {
  const { isDark, setIsDark } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: profileData } = useGetUserProfileQuery();

  // ── Notifications ────────────────────────────────────────────────────────────
  const { data: notificationData } = useGetMyNotificationsQuery();
  const [readAllNotifications] = useReadAllNotificationsMutation();
  const [readNotification] = useReadNotificationMutation();

  const allNotifications = notificationData?.data || [];
  const unreadCount = allNotifications.filter((n: any) => !n.isRead).length;

  const sortedNotifications = [...allNotifications].sort((a: any, b: any) => {
    if (a.isRead === b.isRead) {
      return new Date(b.notification.createdAt).getTime() - new Date(a.notification.createdAt).getTime();
    }
    return a.isRead ? 1 : -1;
  });

  const handleReadAll = async () => {
    try {
      await readAllNotifications().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await readNotification(id).unwrap();
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
    setNotifOpen(false);
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const profile = profileData?.data;
  const imageUrl = getFullImageUrl(profile?.image_url);
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : profile?.username?.substring(0, 2).toUpperCase() || 'AC';

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-navbarBg border-b border-border z-30">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between">

        {/* LEFT: brand + hamburger */}
        <div className="flex items-center gap-3 sm:gap-5">
          <Link href="/supporter/overview" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-customShadow flex-shrink-0">
              <span className="text-white text-sm font-bold leading-none">T</span>
            </div>
            <div className="hidden sm:flex flex-col ml-1">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-none">
                Tape Supporter
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supporter Portal
              </p>
            </div>
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Image
              src="/admin/navbar/navbarmenu.svg"
              alt="Menu"
              width={22}
              height={22}
              className="w-5 h-5"
              unoptimized
            />
          </button>
        </div>

        {/* RIGHT: notifications + theme + avatar */}
        <div className="flex items-center gap-1 sm:gap-2">

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-navbarBg" />
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden z-40">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleReadAll}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer"
                      >
                        Mark All Read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto max-h-96">
                    {sortedNotifications.length === 0 ? (
                      <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No notifications yet
                      </div>
                    ) : (
                      sortedNotifications.slice(0, 6).map((item: any) => {
                        const IconComponent = getNotificationIcon(item.notification.actorType || 'SYSTEM');
                        return (
                          <div
                            key={item.notificationId}
                            onClick={() => handleNotificationClick(item.notificationId, item.isRead)}
                            className={`px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <IconComponent className="w-9 h-9 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full p-2" />
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-sm font-semibold mb-1 ${!item.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {item.notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                  {item.notification.body}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {formatDistanceToNow(new Date(item.notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {!item.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 text-center border-t border-gray-200 dark:border-gray-700">
                    <Link href="/supporter/notifications" onClick={() => setNotifOpen(false)}>
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer">
                        View All
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={(e) => {
              const x = e.clientX;
              const y = e.clientY;
              document.documentElement.style.setProperty('--x', `${x}px`);
              document.documentElement.style.setProperty('--y', `${y}px`);

              if (!(document as any).startViewTransition) {
                setIsDark(!isDark);
                return;
              }
              (document as any).startViewTransition(() => {
                setIsDark(!isDark);
              });
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-300 relative h-9 w-9 flex items-center justify-center overflow-hidden cursor-pointer"
            aria-label="Toggle dark mode"
          >
            <Sun
              className={`w-5 h-5 text-yellow-500 absolute transition-all duration-500 ease-in-out ${isDark
                ? 'translate-y-0 opacity-100 rotate-0'
                : 'translate-y-10 opacity-0 -rotate-90'
                }`}
            />
            <Moon
              className={`w-5 h-5 text-gray-900 dark:text-gray-100 absolute transition-all duration-500 ease-in-out ${!isDark
                ? 'translate-y-0 opacity-100 rotate-0'
                : '-translate-y-10 opacity-0 rotate-90'
                }`}
            />
          </button>

          {/* Avatar */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700">
            <Link
              href="/supporter/settings"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold select-none flex-shrink-0 overflow-hidden relative border border-border"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
