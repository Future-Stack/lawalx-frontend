
// import AdminNavbar from "@/components/layout/AdminNavbar";
// import Wrapper from "@/components/layout/Wrapper";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gray-100 text-gray-900">
//       <AdminNavbar />
//       <Wrapper>{children}</Wrapper>
//     </div>
//   );
// }

'use client';

import { ThemeProvider } from '@/components/Admin/layout/ThemeProvider';
import Navbar from '@/components/Admin/layout/AdminNavbar';
import Sidebar from '@/components/Admin/layout/AdminSidebar';
import { useState, useEffect } from 'react';
import AdminWrapper from '@/components/layout/AdminWrapper';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
            <AdminWrapper fullWidth={isCollapsed}>{children}</AdminWrapper>
          </main>
        </div>
      </ProtectedRoute>
    </ThemeProvider>
  );
}