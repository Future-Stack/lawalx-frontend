"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useUploadFileMutation } from "@/redux/api/users/content/content.api";

export type OnboardingStep = "add-device" | "upload" | "program" | "schedule" | null;

export function useNavbarActions() {
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);
    const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setOnboardingStep("program");
            setIsCreateProgramOpen(true);
        } else if (step === "program") {
            setOnboardingStep("schedule");
            setIsCreateScheduleOpen(true);
        } else if (step === "schedule") {
            setOnboardingStep(null);
            localStorage.removeItem("is_new_user");
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("file", files[i]);
        }

        try {
            const res = await uploadFile(formData).unwrap();
            toast.success(res?.message || "File(s) uploaded successfully");
            if (fileInputRef.current) fileInputRef.current.value = "";

            // If we are in the upload step of onboarding, complete it
            if (onboardingStep === "upload") {
                completeStep("upload");
            }
        } catch (err: any) {
            console.error("Upload failed:", err);
            toast.error(err?.data?.message || "Upload failed. Please try again.");
        }
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
        isUploading,
        fileInputRef,
        handleUploadClick,
        handleFileChange,
    };
}
