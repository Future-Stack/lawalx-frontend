import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute allowedRoles={['USER']}>{children}</ProtectedRoute>;
}
