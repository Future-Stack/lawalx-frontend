"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthInput from "./AuthInput";
import Image from "next/image";
import Link from "next/link";
import { User, Mail } from "lucide-react";
import { useRegisterInitiateMutation } from "@/redux/features/auth/authApi";
import { toast } from "sonner";

const signupSchema = z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
    onNext: (data: SignupFormData) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onNext }) => {
    const [registerInitiate, { isLoading }] = useRegisterInitiateMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        try {
            const res = await registerInitiate(data).unwrap();
            if (res.success) {
                toast.success(res.message || "Verification code sent to email");
                onNext(data);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Something went wrong. Please try again.");
            console.log(error);
        }
    };

    const handleGoogleLogin = () => {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
        window.location.href = `${baseUrl}/otp/google`;
    };

    return (
        <div className="w-full space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-headings">Create Account</h1>
                <p className="text-body">Let&apos;s Create account for enter into tape Website.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AuthInput
                    label="Full Name"
                    placeholder="Enter your name"
                    required
                    icon={User}
                    {...register("fullName")}
                    error={errors.fullName?.message}
                    disabled={isLoading}
                />

                <AuthInput
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    required
                    icon={Mail}
                    {...register("email")}
                    error={errors.email?.message}
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-bgBlue text-white rounded-xl font-medium hover:bg-[#0EA5E9] transition-colors shadow-customShadow mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                </button>

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
                Already have an account?{" "}
                <Link href="/signin" className="text-bgBlue font-medium hover:underline cursor-pointer">
                    Sign In
                </Link>
            </p>
        </div>
    );
};

export default SignupForm;
