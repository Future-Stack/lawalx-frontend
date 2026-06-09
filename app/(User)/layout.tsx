import ProtectedRoute from "@/components/ProtectedRoute";
import ImpersonationBanner from "@/components/common/ImpersonationBanner";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
      <ProtectedRoute allowedRoles={['USER']}>
        <ImpersonationBanner />
        {children}
      </ProtectedRoute>
    );
}
