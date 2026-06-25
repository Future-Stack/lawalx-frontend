"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/redux/store/hook";
import { setUser } from "@/redux/features/auth/authSlice";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SocialLoginHandler = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");
        const firstTimeLogin = searchParams.get("firstTimeLogin");

        if (accessToken && refreshToken) {
            try {
                // If firstTimeLogin is "false", it means this is a new user (onboarding required)
                if (firstTimeLogin === "false") {
                    localStorage.setItem("is_new_user", "true");
                } else {
                    localStorage.removeItem("is_new_user");
                }

                dispatch(setUser({
                    token: accessToken,
                    refreshToken: refreshToken
                }));
                toast.success("Login successful!");
                router.push("/dashboard");
            } catch (error) {
                console.error("Social login processing failed:", error);
                toast.error("Failed to process social login. Please try again.");
                router.push("/signin");
            }
        } else {
            const error = searchParams.get("error");
            if (error) {
                toast.error(error);
                router.push("/signin");
            }
        }
    }, [searchParams, dispatch, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-bgBlue" />
            <p className="text-headings font-medium text-lg">Processing social login...</p>
            <p className="text-body text-sm">Please wait while we set up your session</p>
        </div>
    );
};

export default function SocialLoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-bgBlue" />
            </div>
        }>
            <SocialLoginHandler />
        </Suspense>
    );
}
