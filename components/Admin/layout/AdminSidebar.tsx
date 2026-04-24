'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/redux/store/hook';
import { logout } from '@/redux/features/auth/authSlice';
import {
  LayoutDashboard, Users, CreditCard, Globe, Monitor,
  MessageCircle, BarChart3, Activity, FileText, LogOut, ChevronDown,
  Ticket,
  UserRoundCogIcon,
  TvMinimal,
  TvMinimalPlay,
  CircleHelp,
  LineChart,
  ClipboardList,
  HomeIcon,
  BanIcon,
  Scaling
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Auto-expand parent if child is active (only when not collapsed)
  useEffect(() => {
    if (!isCollapsed) {
      const newExpanded: Record<string, boolean> = {};
      if (pathname.startsWith('/admin/support')) newExpanded.support = true;
      if (pathname.startsWith('/admin/reports')) newExpanded.reports = true;
      setExpandedItems(prev => ({ ...prev, ...newExpanded }));
    }
  }, [pathname, isCollapsed]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (href: string) => pathname === href;

  // Full nested menu items (only used when expanded)
  const clientItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, href: '/admin/dashboard' },
    { id: 'user-management', label: 'User Management', icon: UserRoundCogIcon, href: '/admin/user-management' },
    { id: 'subscription', label: 'Subscription & Billing', icon: CreditCard, href: '/admin/subscription' },
    { id: 'devices', label: 'Devices (Global)', icon: TvMinimal, href: '/admin/devices' },
    // { id: 'screen', label: 'Screen & Content', icon: TvMinimalPlay, href: '/admin/screen&content' },
    {
      id: 'support',
      label: 'Customer Supports',
      icon: CircleHelp,
      children: [
        { id: 'support-tickets', label: 'Support Tickets', href: '/admin/support/support-tickets', icon: Ticket },
        { id: 'enterprise-requests', label: 'Enterprise Requests', href: '/admin/support/enterprise-requests', icon: MessageCircle },
        { id: 'knowledge-base', label: 'Knowledge Base', href: '/admin/support/knowledge-base', icon: MessageCircle },
        { id: 'Banner', label: 'Banner', href: '/admin/support/banner', icon: Scaling },
      ],
    },
  ];

  const systemItems = [
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: LineChart,
      children: [
        { id: 'financial-reports', label: 'Financial Reports', href: '/admin/reports/financial-reports', icon: BarChart3 },
        { id: 'subscription-&-billing-report', label: 'Subscription & Billing Report', href: '/admin/reports/subscription-&-billing-report', icon: BarChart3 },
        { id: 'device-report', label: 'Device Report', href: '/admin/reports/device-report', icon: BarChart3 },
        { id: 'user-&-activity-reports', label: 'User & Activity Reports', href: '/admin/reports/user-&-activity-reports', icon: BarChart3 },
        { id: 'customer-service-&-support-reports', label: 'Customer Service & Support Reports', href: '/admin/reports/customer-service-&-support-reports', icon: ClipboardList },
        { id: 'content-and-programs', label: 'Content And Programs', href: '/admin/reports/content-and-programs', icon: ClipboardList },
        { id: 'report-hub', label: 'Report Hub', href: '/admin/reports/report-hub', icon: ClipboardList },

      ],
    },
    { id: 'system-health', label: 'System Health', icon: Activity, href: '/admin/system-health' },
    // { id: 'activity-log', label: 'Activity Log', icon: ClipboardList, href: '/admin/activity-log' },
  ];

  // ONLY the items that should appear when collapsed (parents removed)
  const collapsedItems = [
    { icon: LayoutDashboard, href: '/admin/dashboard', label: 'Dashboard' },
    { icon: Users, href: '/admin/user-management', label: 'User Management' },
    { icon: CreditCard, href: '/admin/subscription', label: 'Subscription & Billing' },
    { icon: Globe, href: '/admin/devices', label: 'Devices (Global)' },
    // { icon: Monitor, href: '/admin/screen&content', label: 'Screen & Content' },
    { icon: Ticket, href: '/admin/support/support-tickets', label: 'Support Tickets' },
    { icon: MessageCircle, href: '/admin/support/enterprise-requests', label: 'Enterprise Requests' },
    { icon: MessageCircle, href: '/admin/support/knowledge-base', label: 'Knowledge Base' },
    { icon: Scaling, href: '/admin/support/banner', label: 'Banner' },
    { icon: BarChart3, href: '/admin/reports/financial-reports', label: 'Financial Reports' },
    { icon: BarChart3, href: '/admin/reports/subscription-&-billing-report', label: 'Subscription & Billing Report' },
    { icon: BarChart3, href: '/admin/reports/device-report', label: 'Device Report' },
    { icon: BarChart3, href: '/admin/reports/user-&-activity-reports', label: 'User & Activity Reports' },
    { icon: ClipboardList, href: '/admin/reports/customer-service-&-support-reports', label: 'Customer Service & Support Reports' },
    { icon: ClipboardList, href: '/admin/reports/content-and-programs', label: 'Content And Programs' },
    { icon: ClipboardList, href: '/admin/reports/report-hub', label: 'Report Hub' },
    { icon: Activity, href: '/admin/system-health', label: 'System Health' },
    // { icon: FileText, href: '/admin/activity-log', label: 'Activity Log' },
  ];

  interface MenuChildItem {
    id: string;
    label: string;
    href: string;
    icon: React.ElementType;
  }

  interface MenuItemType {
    id: string;
    label: string;
    icon: React.ElementType;
    href?: string;
    children?: MenuChildItem[];
  }

  const MenuItem = ({ item }: { item: MenuItemType }) => {
    const isExpanded = !!expandedItems[item.id];
    const hasChildren = item.children && item.children.length > 0;
    const isParentActive = hasChildren && item.children!.some((c) => isActive(c.href));

    return (
      <div>
        {item.href ? (
          <Link
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${isActive(item.href)
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ) : (
          <button
            onClick={() => toggleExpand(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${isParentActive || isExpanded
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </div>
            {!isCollapsed && hasChildren && (
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            )}
          </button>
        )}

        {hasChildren && !isCollapsed && isExpanded && item.children && (
          <div className="ml-10 mt-1 space-y-1">
            {item.children.map((child: MenuChildItem) => (
              <Link
                key={child.id}
                href={child.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${isActive(child.href)
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                <child.icon className="w-4 h-4" />
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`fixed top-16 left-0 bottom-0 bg-navbarBg border-r border-border transition-all duration-300 z-20 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="h-full py-4 flex flex-col justify-between">
        <div className="px-3 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {isCollapsed ? (
            // Collapsed: Only child icons + tooltips
            <div className="space-y-1">
              {collapsedItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex justify-center p-3 rounded-lg transition-all group relative ${isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5" />
                  {/* Optional: Show tooltip on hover */}
                  <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            // Expanded: Full original layout
            <>
              <div>
                <div className="px-3 mb-3">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</span>
                </div>
                <div className="space-y-1">
                  {clientItems.map(item => <MenuItem key={item.id} item={item} />)}
                </div>
              </div>

              <div>
                <div className="px-3 mb-3">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">System</span>
                </div>
                <div className="space-y-1">
                  {systemItems.map(item => <MenuItem key={item.id} item={item} />)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="px-3 pb-4">
          <button
            onClick={() => {
              dispatch(logout());
              router.push('/admin/login');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all ${isCollapsed ? 'justify-center' : ''}`}
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}