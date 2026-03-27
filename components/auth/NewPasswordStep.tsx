"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AuthInput from "./AuthInput";
import { HelpCircle } from "lucide-react";

const newPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

interface NewPasswordStepProps {
    email: string;
    onReset: (data: NewPasswordFormData) => void;
}

const NewPasswordStep: React.FC<NewPasswordStepProps> = ({ email, onReset }) => {
    const [strength, setStrength] = useState(0);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<NewPasswordFormData>({
        resolver: zodResolver(newPasswordSchema),
    });

    const password = watch("password", "");

    React.useEffect(() => {
        let score = 0;
        if (password.length >= 6) score++;
        if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (password.length >= 12) score++;
        setStrength(Math.min(score, 4));
    }, [password]);

    const getStrengthText = () => {
        if (strength === 0) return "Too Short";
        if (strength <= 2) return "Weak";
        if (strength === 3) return "Strong";
        return "Very Strong";
    };

    const getStrengthColor = (index: number) => {
        // Mockup shows solid green bars for strength
        if (index < strength) {
            return "bg-[#22C55E]";
        }
        return "bg-[#E5E7EB]";
    };

    const onSubmit = (data: NewPasswordFormData) => {
        onReset(data);
        router.push("/dashboard");
    };

    return (
        <div className="w-full space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-headings">Reset Password</h1>
                <p className="text-muted">Create a new password</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <AuthInput
                        label="Password"
                        placeholder="Enter your password"
                        type="password" 
                        required
                        icon={HelpCircle}
                        {...register("password")}
                        error={errors.password?.message}
                    />

                    {/* Strength Indicator */}
                    <div className="space-y-2">
                        <div className="flex gap-2 h-1.5 w-full">
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className={`flex-1 rounded-full ${getStrengthColor(i)}`} />
                            ))}
                        </div>
                        <p className="text-sm text-muted">
                            Password strength: <span className="font-medium">{getStrengthText()}</span>
                        </p>
                    </div>
                </div>

                <AuthInput
                    label="Confirm Password"
                    placeholder="Enter your confirm password"
                    type="password"
                    required
                    icon={HelpCircle}
                    {...register("confirmPassword")}
                    error={errors.confirmPassword?.message}
                />

                <button
                    type="submit"
                    className="w-full h-12 bg-bgBlue text-white rounded-xl font-medium hover:bg-[#0EA5E9] transition-colors shadow-customShadow cursor-pointer"
                >
                    Reset Password
                </button>
            </form>
        </div>
    );
};

export default NewPasswordStep;
