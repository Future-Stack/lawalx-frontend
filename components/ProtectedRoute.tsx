"use client";

import { useAppSelector } from "@/redux/store/hook";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { selectCurrentToken, selectIsHydrated, selectCurrentUser } from "@/redux/features/auth/authSlice";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const [mounted, setMounted] = useState(false);
    const token = useAppSelector(selectCurrentToken);
    const isHydrated = useAppSelector(selectIsHydrated);
    const user = useAppSelector(selectCurrentUser);
    const router = useRouter();

    const isAuthorized = !allowedRoles || (user && allowedRoles.includes(user.role));

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isHydrated) {
            if (!token) {
                const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
                router.push(isAdminPath ? "/admin/login" : "/signin");
            } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // If the user's role is not in the allowed list, redirect them to their respective dashboard
                const role = user.role.toUpperCase();
                if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'SUPER_ADMIN') {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/dashboard");
                }
            }
        }
    }, [token, router, isHydrated, allowedRoles, user]);

    if (!mounted || !isHydrated || !token || !isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
