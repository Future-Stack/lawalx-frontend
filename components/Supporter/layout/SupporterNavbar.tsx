'use client';

import { Bell, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/components/Admin/layout/ThemeProvider';

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

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-navbarBg border-b border-border z-30">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between">

        {/* LEFT: brand + hamburger */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Brand — hidden on very small screens */}
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

          {/* Hamburger — visible on all screens */}
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
            />
          </button>
        </div>

        {/* RIGHT: notifications + theme + avatar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg relative transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden z-40">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                  </div>
                  <div className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No notifications yet
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-900 dark:text-gray-100" />
            )}
          </button>

          {/* Avatar */}
          <div className="flex items-center pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold select-none flex-shrink-0">
              AC
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
