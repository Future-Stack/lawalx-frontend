"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthInput from "./AuthInput";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

const resetEmailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

type ResetEmailFormData = z.infer<typeof resetEmailSchema>;

interface ResetEmailStepProps {
    onNext: (email: string) => void;
}

const ResetEmailStep: React.FC<ResetEmailStepProps> = ({ onNext }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetEmailFormData>({
        resolver: zodResolver(resetEmailSchema),
    });

    const onSubmit = (data: ResetEmailFormData) => {
        console.log("Reset email:", data);
        onNext(data.email);
    };

    return (
        <div className="w-full space-y-8">
            <div className="space-y-4 text-center">
                <h1 className="text-3xl font-bold text-headings">Reset Password</h1>
                <p className="text-body max-w-sm mx-auto">
                    Enter your email and we will send you a link
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <AuthInput
                    label="Email *"
                    placeholder="Enter your email"
                    type="email"
                    required
                    icon={HelpCircle}
                    {...register("email")}
                    error={errors.email?.message}
                />

                <button
                    type="submit"
                    className="w-full h-12 bg-bgBlue text-white rounded-xl font-medium hover:bg-[#0EA5E9] transition-colors shadow-customShadow cursor-pointer"
                >
                    Reset Password
                </button>
            </form>

            <div className="text-center">
                <span className="text-muted">Don&apos;t have an Account? </span>
                <Link href="/signup" className="text-bgBlue font-medium hover:underline cursor-pointer">
                    Create Account
                </Link>
            </div>
        </div>
    );
};

export default ResetEmailStep;
