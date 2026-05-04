'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, UserCog } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/redux/store/hook';
import { logout } from '@/redux/features/auth/authSlice';

interface SupporterSidebarProps {
  isCollapsed: boolean;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/supporter/overview' },
  { id: 'settings', label: 'Profile Setting', icon: UserCog, href: '/supporter/settings' },
];

export default function SupporterSidebar({ isCollapsed }: SupporterSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.push('/supporter/login');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className={cn(
        'fixed top-16 left-0 bottom-0 bg-navbarBg border-r border-border transition-all duration-300 z-20',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-full py-4 flex flex-col justify-between">
        {/* Nav items */}
        <div className="px-3 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {isCollapsed ? (
            /* Collapsed: icon-only with hover tooltip */
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'flex justify-center p-3 rounded-lg transition-all group relative',
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            /* Expanded: full layout */
            <div>
              <div className="px-3 mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Main Menu
                </span>
              </div>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                      isActive(item.href)
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all',
              isCollapsed && 'justify-center'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
