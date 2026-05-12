"use client";

import UserDashboardNavbar from "@/components/layout/UserDashboardNavbar";
import SidebarComponent from "@/components/sidebar/SidebarComponent";
import { Bell, Palette, UserRoundCog, Crown } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';
import Wrapper from "@/components/layout/Wrapper";

const customItems = [
  {
    icon: <Palette className="w-5 h-5" />,
    label: 'General',
    href: '/profile-settings/general',
  },
  {
    icon: <UserRoundCog className="w-5 h-5" />,
    label: 'Account',
    href: '/profile-settings/account',
  },
  {
    icon: <Crown className="w-5 h-5" />,
    label: 'Subscriptions',
    href: '/profile-settings/subscriptions',
  },
  // {
  //   icon: <Lock className="w-5 h-5" />,
  //   label: 'Security',
  //   href: '/profile-settings/security',
  // },
  {
    icon: <Bell className="w-5 h-5" />,
    label: 'Notifications',
    href: '/profile-settings/notifications',
  },
  // {
  //   icon: <Webhook className="w-5 h-5" />,
  //   label: 'Integrations',
  //   href: '/profile-settings/integrations',
  //   comingSoon: true,
  // },
];

// app/dashboard/content/layout.tsx

export default function ContentGroupLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsMobile(true);
        setIsCollapsed(true);
      } else if (width < 1024) {
        setIsMobile(false);
        setIsCollapsed(true);
      } else {
        setIsMobile(false);
        if (width >= 1024) setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent hydration mismatch - don't render until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-White">
        <UserDashboardNavbar />

        <div className="flex">
          {!isMobile && (
            <SidebarComponent items={customItems} isCollapsed={isCollapsed} className="top-20 sm:top-24 bg-[#FAFAFA] dark:bg-cardBg" />
          )}

          <main
            className={`flex-1 min-h-screen transition-all duration-300 ${isMobile ? 'ml-0' : (isCollapsed ? 'ml-16' : 'ml-64')}`}
          >
            <Wrapper fullWidth={isCollapsed}> {children}</Wrapper>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-White">
      <UserDashboardNavbar />

      <div className="flex">
        {!isMobile && (
          <SidebarComponent items={customItems} isCollapsed={isCollapsed} className="top-20 sm:top-24 bg-[#FAFAFA] dark:bg-cardBg" />
        )}

        <main
          className={`flex-1 min-h-screen transition-all duration-300 ${isMobile ? 'ml-0' : (isCollapsed ? 'ml-16' : 'ml-64')}`}
        >
          <Wrapper fullWidth={isCollapsed}> {children}</Wrapper>
        </main>
      </div>
    </div>
  );
}


