"use client";

import { useState, useCallback } from "react";
import { useUserDataUpdateMutation } from "@/redux/api/users/userProfileApi";

export type OnboardingStep = "add-device" | "upload" | "program" | "schedule" | null;

export function useNavbarActions() {
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
    const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const [userDataUpdate] = useUserDataUpdateMutation();

    const startOnboarding = useCallback(() => {
        localStorage.setItem("onboarding_step", "add-device");
        setOnboardingStep("add-device");
        setIsAddDeviceOpen(true);
    }, []);

    const finishOnboarding = useCallback(async () => {
        setOnboardingStep(null);
        setIsAddDeviceOpen(false);
        setIsUploadModalOpen(false);
        setIsCreateProgramOpen(false);
        localStorage.removeItem("is_new_user");
        localStorage.removeItem("onboarding_step");
        try {
            await userDataUpdate({ firstTimeLogin: true }).unwrap();
        } catch (error) {
            console.error("Failed to finish onboarding:", error);
        }
    }, [userDataUpdate]);

    const completeStep = useCallback((step: OnboardingStep) => {
        if (onboardingStep !== step) return;

        if (step === "add-device") {
            localStorage.setItem("onboarding_step", "program");
            setOnboardingStep("program");
            setIsAddDeviceOpen(false);
            // Delay to allow first modal to close
            setTimeout(() => setIsCreateProgramOpen(true), 150);
        } else if (step === "program") {
            finishOnboarding();
        } else if (step === "upload") {
            // Support legacy upload step if needed, but not part of automatic flow now
            setOnboardingStep(null);
            setIsUploadModalOpen(false);
        }
    }, [onboardingStep, finishOnboarding]);

    const handleUploadClick = useCallback(() => {
        setIsUploadModalOpen(true);
    }, []);

    return {
        isAddDeviceOpen,
        setIsAddDeviceOpen,
        isCreateFolderOpen,
        setIsCreateFolderOpen,
        isCreateScheduleOpen,
        setIsCreateScheduleOpen,
        isCreateProgramOpen,
        setIsCreateProgramOpen,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isPageLoading,
        setIsPageLoading,
        onboardingStep,
        setOnboardingStep,
        startOnboarding,
        completeStep,
        finishOnboarding,
        handleUploadClick,
    };
}
