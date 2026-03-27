"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthInput from "./AuthInput";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface SignInEmailStepProps {
    onNext: (email: string) => void;
}

const SignInEmailStep: React.FC<SignInEmailStepProps> = ({ onNext }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    const onSubmit = async (data: EmailFormData) => {
        // Simulate API check
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Step 1 Data:", data);
        onNext(data.email);
    };

    const handleGoogleLogin = () => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        window.location.href = `${baseUrl}/otp/google`;
    };

    return (
        <div className="w-full space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-headings">Welcome Back</h1>
                <p className="text-body">Let&apos;s Login to your tape account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AuthInput
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    required
                    {...register("email")}
                    error={errors.email?.message}
                    icon={isSubmitting ? Loader2 : undefined}
                // Note: Loader2 needs animation, let's add class via props if AuthInput allows or just standard icon
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-bgBlue text-white rounded-xl font-medium hover:bg-[#0EA5E9] transition-colors shadow-customShadow mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Sign In"}
                </button>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    </div>
                    <Link href="/forget-password" className="text-sm text-bgBlue font-medium hover:underline">
                        Forget Password
                    </Link>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full h-12 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors shadow-customShadow cursor-pointer"
                >
                    <Image
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        alt="Google"
                        width={20}
                        height={20}
                    />
                    Continue with Google
                </button>
            </form>

            <p className="text-center text-muted">
                Don&apos;t have an Account?{" "}
                <Link href="/signup" className="text-bgBlue font-medium hover:underline cursor-pointer">
                    Sign Up
                </Link>
            </p>
        </div>
    );
};

export default SignInEmailStep;
