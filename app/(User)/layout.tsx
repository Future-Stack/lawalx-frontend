import ProtectedRoute from "@/components/ProtectedRoute";
import ImpersonationBanner from "@/components/common/ImpersonationBanner";
import ImpersonationRequestModal from "@/components/common/ImpersonationRequestModal";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
      <ProtectedRoute allowedRoles={['USER']}>
        <ImpersonationBanner />
        <ImpersonationRequestModal />
        {children}
      </ProtectedRoute>
    );
}
