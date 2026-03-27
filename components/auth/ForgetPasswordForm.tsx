"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthInput from "./AuthInput";
import Link from "next/link";
import { HelpCircle, Mail, Loader2 } from "lucide-react";
import { useForgotPasswordMutation } from "@/redux/api/users/authApi";
import { toast } from "sonner";

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgetPasswordForm = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const res = await forgotPassword({ email: data.email }).unwrap();
            if (res.success) {
                setSubmittedEmail(data.email);
                setIsSuccess(true);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to send reset link. Please try again.");
            // For development/demo purposes if API fails but we want to show success
            // setSubmittedEmail(data.email);
            // setIsSuccess(true);
        }
    };

    const maskEmail = (email: string) => {
        const [name, domain] = email.split("@");
        if (name.length <= 2) return `${name}***@${domain}`;
        return `${name[0]}${"*".repeat(3)}${name[name.length - 1]}@${domain}`;
    };

    if (isSuccess) {
        return (
            <div className="w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center justify-center space-y-6">
                    {/* Icon matching uploaded_media_0 */}
                    <div className="relative">
                        <div className="w-24 h-24 bg-[#E6F9F0] rounded-full flex items-center justify-center">
                            <Mail className="w-10 h-10 text-[#22C55E]" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E6F9F0]">
                            <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-headings">Reset Link Sent Successfully</h1>
                        <p className="text-body max-w-sm mx-auto">
                            We have sent you a password reset link to <span className="font-medium text-headings">{maskEmail(submittedEmail)}</span>. Click on the link and reset your password.
                        </p>
                    </div>

                    <button
                        onClick={() => window.open(`https://mail.google.com/`, "_blank")}
                        className="w-full h-12 bg-bgBlue text-white rounded-xl font-medium hover:bg-[#0EA5E9] transition-colors shadow-customShadow cursor-pointer flex items-center justify-center"
                    >
                        Go to Inbox
                    </button>

                    <p className="text-sm text-muted">
                        Back to{" "}
                        <Link href="/signin" className="text-bgBlue font-medium hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-headings">Forget Password</h1>
                <p className="text-body">Enter your email and we will send you a link</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AuthInput
                    label="Email"
                    placeholder="Enter your email"
                    type="email"
                    required
                    icon={HelpCircle}
                    {...register("email")}
                    error={errors.email?.message}
                    disabled={isLoading}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-bgBlue text-white rounded-xl font-medium hover:bg-[#0EA5E9] transition-colors shadow-customShadow cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Send Link"}
                </button>
            </form>

            <p className="text-center text-muted">
                Don&apos;t have an Account?{" "}
                <Link href="/signup" className="text-bgBlue font-medium hover:underline cursor-pointer">
                    Create Account
                </Link>
            </p>
        </div>
    );
};

export default ForgetPasswordForm;
