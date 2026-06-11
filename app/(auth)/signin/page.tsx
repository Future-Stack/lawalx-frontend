"use client";

import SignInForm from "@/components/auth/SignInForm";
import AuthLayout from "@/components/auth/AuthLayout";
import { useGetAuthImageQuery } from "@/redux/api/admin/profile&settings/signImageApi";
import { getUrl } from "@/lib/content-utils";

export default function SignInPage() {
    const { data: authImage, isLoading } = useGetAuthImageQuery('signin');
    const imageUrl = authImage?.data?.imageUrl ? getUrl(authImage.data.imageUrl) : "/images/signIn.png";

    return (
        <AuthLayout imageSrc={imageUrl} loading={isLoading}>
            <SignInForm />
        </AuthLayout>
    );
}
