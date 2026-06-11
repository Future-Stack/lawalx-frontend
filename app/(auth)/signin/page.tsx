"use client";

import SignInForm from "@/components/auth/SignInForm";
import AuthLayout from "@/components/auth/AuthLayout";
import { useGetAuthImageQuery } from "@/redux/api/admin/profile&settings/signImageApi";
import { getUrl } from "@/lib/content-utils";

export default function SignInPage() {
    const { data: authImage } = useGetAuthImageQuery('signin');
    const imageUrl = authImage?.data?.imageUrl ? getUrl(authImage.data.imageUrl) : undefined;

    return (
        <AuthLayout imageSrc={imageUrl || "/images/signIn.png"}>
            <SignInForm />
        </AuthLayout>
    );
}
