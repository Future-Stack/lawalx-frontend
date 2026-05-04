'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/Admin/layout/ThemeProvider';
import SupporterSidebar from '@/components/Supporter/layout/SupporterSidebar';
import SupporterNavbar from '@/components/Supporter/layout/SupporterNavbar';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getSocket, disconnectSocket } from '@/lib/socket';
import { useAppSelector } from '@/redux/store/hook';
import { selectCurrentToken } from '@/redux/features/auth/authSlice';

export default function SupporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const token = useAppSelector(selectCurrentToken);

  const isLoginPage = pathname === '/supporter/login';

  // Global socket connection for presence tracking
  useEffect(() => {
    if (token && !isLoginPage) {
      console.log('[SupporterLayout] Initializing global socket for presence');
      getSocket(token);
    }

    return () => {
      console.log('[SupporterLayout] Disconnecting socket on unmount/logout');
      disconnectSocket();
    };
  }, [token, isLoginPage]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For the login page, just render the content without sidebar/navbar
  if (isLoginPage) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <ProtectedRoute allowedRoles={['SUPPORTER']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <SupporterNavbar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <SupporterSidebar isCollapsed={isCollapsed} />

          {/* Mobile backdrop — visible only on < lg when sidebar is expanded */}
          {!isCollapsed && (
            <div
              className="fixed inset-0 bg-black/40 z-10 lg:hidden"
              onClick={() => setIsCollapsed(true)}
            />
          )}

          <main
            className={`pt-16 transition-all duration-300 ${
              isCollapsed ? 'ml-16' : 'ml-16 lg:ml-64'
            }`}
          >
            <div className="p-4 sm:p-5 lg:p-6">{children}</div>
          </main>
        </div>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
