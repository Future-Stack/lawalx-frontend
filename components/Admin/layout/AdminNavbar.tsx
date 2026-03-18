'use client';

import { Moon, Bell, Sun, User, Monitor, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useGetAdminProfileQuery } from '@/redux/api/admin/profile&settings/adminSettingsApi';
import { useGetMyNotificationsQuery, useReadAllNotificationsMutation, useReadNotificationMutation } from "@/redux/api/users/notificationApi";
import { formatDistanceToNow } from "date-fns";

const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return '/images/profile-settings.png';
  if (path.startsWith('http')) return path;
  
  // Derive base domain from NEXT_PUBLIC_BASE_URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', ''); 
  return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "USER": return User;
    case "DEVICE": return Monitor;
    case "SYSTEM": return SettingsIcon;
    default: return Bell;
  }
};

interface AdminNavbarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export default function AdminNavbar({ isCollapsed, setIsCollapsed }: AdminNavbarProps) {
  const { isDark, setIsDark } = useTheme();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { data: profileData } = useGetAdminProfileQuery({});

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
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await readNotification(id).unwrap();
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };
  
  const profileImage = profileData?.data?.profileImage || profileData?.data?.image_url;
  const imageUrl = getFullImageUrl(profileImage);

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-navbarBg border-b border-border z-30">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 sm:gap-6">




          {/* Mobile-only minimal logo when logo text is hidden */}
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg items-center justify-center shadow-customShadow hidden sm:flex">
              <Image src="/admin/navbar/adminlogo.svg" alt="Logo" width={18} height={18} />
            </div>
            <div className="ml-3 flex flex-col">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-none">Tape Admin</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin Portal</p>
            </div>
          </Link>
          {/* Hamburger Menu – Always visible, moves left on tiny screens */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <Image src="/admin/navbar/navbarmenu.svg" alt="Menu" width={22} height={22} className="w-5 h-5 sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-navbarBg"></span>
              )}
            </button>

            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden z-40">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    <button
                      onClick={handleReadAll}
                      className="text-sm text-bgBlue dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer"
                    >
                      Mark All Read
                    </button>
                  </div>
                  <div className="overflow-y-auto max-h-96 text-left">
                    {sortedNotifications.length === 0 ? (
                      <div className="px-6 py-10 text-center text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      sortedNotifications.slice(0, 6).map((item: any) => {
                        const IconComponent = getNotificationIcon(item.notification.actorType || "SYSTEM");
                        return (
                          <div
                            key={item.notificationId}
                            onClick={() => {
                              handleNotificationClick(item.notificationId, item.isRead);
                              setNotificationOpen(false);
                            }}
                            className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${!item.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <IconComponent className="w-10 h-10 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full p-2" />
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-sm font-semibold mb-1 ${!item.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-600 dark:text-gray-400"}`}>
                                  {item.notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {item.notification.body}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {formatDistanceToNow(new Date(item.notification.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {!item.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="px-6 py-3 text-center border-t border-gray-200 dark:border-gray-700">
                    <Link href="/admin/notifications" onClick={() => setNotificationOpen(false)}>
                      <button className="text-sm text-bgBlue dark:text-blue-400 hover:text-blue-500 font-medium cursor-pointer">
                        View All
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-900" />
            )}
          </button>

          <div className="hidden xs:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <Link href="/admin/profile-settings/profile" className="rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 relative w-10 h-10 overflow-hidden">
              <Image src={imageUrl} alt="Profile" fill className="object-cover" />
            </Link>
          </div>

          {/* Mobile: Only avatar (no border on mobile) */}
          <div className="xs:hidden">
            <Link href="/admin/profile-settings/profile" className="rounded-full flex items-center justify-center text-white text-sm font-semibold relative w-10 h-10 overflow-hidden">
              <Image src={imageUrl} alt="Profile" fill className="object-cover" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}   