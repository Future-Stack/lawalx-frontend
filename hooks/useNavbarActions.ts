"use client";

import { useState } from "react";
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

    const startOnboarding = () => {
        setOnboardingStep("add-device");
        setIsAddDeviceOpen(true);
    };

    const completeStep = (step: OnboardingStep) => {
        if (onboardingStep !== step) return;

        if (step === "add-device") {
            setOnboardingStep("upload");
            setIsUploadModalOpen(true);
        } else if (step === "upload") {
            setOnboardingStep(null);
            localStorage.removeItem("is_new_user");
            userDataUpdate({});
        } else if (step === "schedule") {
            setOnboardingStep(null);
        }
    };

    const handleUploadClick = () => {
        setIsUploadModalOpen(true);
    };

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
        startOnboarding,
        completeStep,
        handleUploadClick,
    };
}
