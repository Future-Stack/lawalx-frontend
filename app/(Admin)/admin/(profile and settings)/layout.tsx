'use client';

import { ThemeProvider } from '@/components/Admin/layout/ThemeProvider';
import Navbar from '@/components/Admin/layout/AdminNavbar';
import Sidebar from '@/components/Admin/layout/AdminSidebar';
import { useState, useEffect } from 'react';
import AdminWrapper from '@/components/layout/AdminWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';
import SettingsTabs from './_components/SettingsTabs';

export default function ProfileSettingsLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ThemeProvider>
      <ProtectedRoute allowedRoles={['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN']}>
        <div className="min-h-screen bg-White">
          <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          <Sidebar isCollapsed={isCollapsed} />

          <main className={`pt-16 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
            <AdminWrapper fullWidth={isCollapsed}>
              <div className="w-full">
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage your account settings and system preferences</p>
                </div>
                <SettingsTabs />
                {children}
              </div>
            </AdminWrapper>
          </main>
        </div>
      </ProtectedRoute>
    </ThemeProvider>
  );
}
