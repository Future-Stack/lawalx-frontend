"use client";

import { useState } from "react";
import SignInEmailStep from "./SignInEmailStep";
import SignInPasswordStep from "./SignInPasswordStep";
import SignInCodeStep from "./SignInCodeStep";
import { useLoginMutation } from "@/redux/api/users/authApi";
import { useAppDispatch } from "@/redux/store/hook";
import { setUser } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

type Step = "EMAIL" | "PASSWORD" | "CODE";

const SignInForm = () => {
    const [step, setStep] = useState<Step>("EMAIL");
    const [email, setEmail] = useState("");

    const handleEmailSubmit = (emailData: string) => {
        setEmail(emailData);
        setStep("PASSWORD");
    };

    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleLogin = async (data: any) => {
        try {
            const res = await login({ email, password: data.password }).unwrap();
            console.log("User Login Response:", res);
            if (res.success) {
                const { accessToken, refreshToken } = res.data;

                // Decode role to verify if this is actually a USER
                const decoded: any = jwtDecode(accessToken);
                const role = (decoded.role || "USER").toUpperCase();
                toast.success(res.message);

                if (role !== "USER") {
                    toast.error("not valid email or pass");
                    return;
                }

                dispatch(setUser({
                    token: accessToken,
                    refreshToken,
                    email,
                }));

                if (res.data.firstTimeLogin === false) {
                    localStorage.setItem("is_new_user", "true");
                } else {
                    localStorage.removeItem("is_new_user");
                }
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("User login API call failed:", error);
            toast.error("not valid email or pass");
        }
    };

    const steps = {
        EMAIL: <SignInEmailStep onNext={handleEmailSubmit} />,
        PASSWORD: (
            <SignInPasswordStep
                email={email}
                onLogin={handleLogin}
                onSwitchToCode={() => setStep("CODE")}
            />
        ),
        CODE: (
            <SignInCodeStep
                email={email}
                onLogin={handleLogin}
                onResend={() => console.log("Resend code")}
            />
        ),
    };

    return (
        <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
            {steps[step]}
        </div>
    );
};

export default SignInForm;
