/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import StepIndicator from "./StepIndicator";
import Step1NameDescription from "./Step1NameDescription";
import Step2ContentSelection from "./Step2ContentSelection";
import Step2LowerThird from "./Step2LowerThird";
import Step3ScreenSelection from "./Step3ScreenSelection";
import Step4ScheduleSettings from "./Step4ScheduleSettings";
import { ContentItem } from "@/types/content";
import { FileText, Settings, TvMinimal, Video, X } from "lucide-react";
import { useCreateScheduleMutation } from "@/redux/api/users/schedules/schedules.api";
import { StoreMorningPromo, ContentType, RecurrenceType, DayOfWeek } from "@/redux/api/users/schedules/schedules.type";
import dayjs from "dayjs";

interface CreateScheduleDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const STEPS = [
    { number: 1, icon: <FileText />, label: "Name and Description", sublabel: "" },
    { number: 2, icon: <Video />, label: "Content Selection", sublabel: "" },
    { number: 3, icon: <TvMinimal />, label: "Device Selection", sublabel: "" },
    { number: 4, icon: <Settings />, label: "Schedule Settings", sublabel: "" }
];

// Helper: Validate UUID format
const isUUID = (id: any): id is string => {
    if (typeof id !== "string") return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const CreateScheduleDialog: React.FC<CreateScheduleDialogProps> = ({ open, setOpen }) => {
    const [createSchedule] = useCreateScheduleMutation();
    const [currentStep, setCurrentStep] = useState(1);
    const [showLowerThird, setShowLowerThird] = useState(false);

    const [createdLowerThirdId, setCreatedLowerThirdId] = useState<string | null>(null);

    // Form Data State
    const [step1Data, setStep1Data] = useState({ name: "", description: "" });
    const [step2Data, setStep2Data] = useState<{
        contentType: string;
        selectedContent: ContentItem[];
    }>({ contentType: "all", selectedContent: [] });

    const [lowerThirdData, setLowerThirdData] = useState({
        selectedContent: null as ContentItem | null,
        lowerThirdConfig: {
            backgroundColor: "#3D3D3D",
            backgroundOpacity: 80,
            enableAnimation: true,
            animationDirection: "left-to-right",
            speed: "medium",
            enableLogo: true,
            position: "bottom",
            textColor: "#FFFFFF",
            fontSize: "24",
            fontFamily: "Inter",
            loop: true,
            message: "This is a demo text",
            duration: 10
        }
    });

    const [step3Data, setStep3Data] = useState({ selectedScreens: [] as string[] });
    const [step4Data, setStep4Data] = useState({
        repeat: "run-once",
        selectedDays: [] as string[],
        selectedDates: [] as number[],
        playTime: "03:00",
        endTime: "05:00",
        startDate: "",
        endDate: ""
    });

    const handleContentSelect = (content: ContentItem) => {
        const isSelected = step2Data.selectedContent.some(c => c.id === content.id);
        const newSelection = isSelected
            ? step2Data.selectedContent.filter(c => c.id !== content.id)
            : [...step2Data.selectedContent, content];

        setStep2Data({ ...step2Data, selectedContent: newSelection });

        // Lower third selection still works on single item for config
        setLowerThirdData({ ...lowerThirdData, selectedContent: content });

        if (step2Data.contentType === "lower-third") {
            setShowLowerThird(true);
        }
        // Note: We no longer auto-jump to step 3 to allow multiple selection
    };

    const handleNext = () => {
        if (showLowerThird) {
            // Move from Lower Third to Step 3
            setShowLowerThird(false);
            setCurrentStep(3);
        } else if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            // Submit form
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (showLowerThird) {
            setShowLowerThird(false);
            setStep2Data({ contentType: "all", selectedContent: [] });
        } else if (currentStep > 1) {
            // If going back to Step 2, reset contentType to 'all' and clear selectedContent
            if (currentStep - 1 === 2) {
                setStep2Data({ contentType: "all", selectedContent: [] });
            }
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCancel = () => {
        // Reset all data
        setCurrentStep(1);
        setShowLowerThird(false);
        setStep1Data({ name: "", description: "" });
        setStep2Data({ contentType: "all", selectedContent: [] });
        setStep3Data({ selectedScreens: [] });
        setLowerThirdData({ ...lowerThirdData, selectedContent: null });
        setStep4Data({ repeat: "run-once", selectedDays: [], selectedDates: [], playTime: "03:00", endTime: "05:00", startDate: "", endDate: "" });
        setOpen(false);
    };

    const handleSubmit = async () => {
        // Determine active content (files/programs selected)
        const activeContent = showLowerThird
            ? (lowerThirdData.selectedContent ? [lowerThirdData.selectedContent] : [])
            : step2Data.selectedContent;

        // Map contentType to API enum
        let contentType: ContentType = "IMAGE_VIDEO";
        if (activeContent[0]?.type === "audio") {
            contentType = "AUDIO";
        } else if (showLowerThird) {
            contentType = "LOWERTHIRD";
        }

        // Format startTime / endTime as epoch-based ISO (1970-01-01T...Z)
        const startTime = `1970-01-01T${step4Data.playTime}:00Z`;
        const endTime = `1970-01-01T${step4Data.endTime || step4Data.playTime}:00Z`;

        // Segregate programs and files while validating UUIDs
        const selectedPrograms = activeContent.filter(c => (c as any).isProgram).map(c => c.id).filter(isUUID);
        const selectedFiles = activeContent.filter(c => !(c as any).isProgram).map(c => c.id).filter(isUUID);
        
        // Construct the API payload
        const payload: StoreMorningPromo = {
            name: step1Data.name,
            description: step1Data.description,
            contentType,
            recurrenceType: (step4Data.repeat === "run-once" ? "once" : step4Data.repeat) as "once" | "daily" | "weekly" | "monthly",
            startDate: step4Data.startDate ? dayjs(step4Data.startDate).startOf('day').toISOString() : dayjs().startOf('day').toISOString(),
            endDate: step4Data.endDate ? dayjs(step4Data.endDate).endOf('day').toISOString() : (step4Data.startDate ? dayjs(step4Data.startDate).endOf('day').toISOString() : dayjs().endOf('day').toISOString()),
            startTime,
            endTime,
            daysOfWeek: step4Data.selectedDays as DayOfWeek[],
            dayOfMonth: step4Data.selectedDates,
            programIds: selectedPrograms.length > 0 ? selectedPrograms : undefined,
            deviceIds: step3Data.selectedScreens.filter(isUUID),
            fileIds: selectedFiles.length > 0 ? selectedFiles : undefined,
            status: "playing",
            lowerThirdId: (createdLowerThirdId || lowerThirdData.selectedContent?.id) && isUUID(createdLowerThirdId || lowerThirdData.selectedContent?.id) ? (createdLowerThirdId || lowerThirdData.selectedContent!.id) : undefined,
        };

        console.log("=== SUBMITTING SCHEDULE PAYLOAD ===");
        console.log(payload);

        try {
            const res = await createSchedule(payload).unwrap();
            console.log("Schedule created successfully:", res);
            toast.success(res?.message || "Schedule created successfully!");
            handleCancel();
        } catch (error: any) {
            console.error("Error creating schedule:", error);
            const errorMessage = error?.data?.message || error?.message || "Failed to create schedule. Please try again.";
            toast.error(errorMessage);
        }
    };

    const isNextDisabled = () => {
        if (currentStep === 1) return !step1Data.name;
        if (currentStep === 2 && !showLowerThird) return step2Data.selectedContent.length === 0;
        if (currentStep === 3) return step3Data.selectedScreens.length === 0;
        if (currentStep === 4) {
            const isRunOnce = step4Data.repeat === "run-once";
            const commonFields = !step4Data.playTime || !step4Data.startDate;
            if (isRunOnce) return commonFields;
            return commonFields || !step4Data.endDate || !step4Data.endTime;
        }
        return false;
    };

    // Prevent background scrolling when dialog is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            document.documentElement.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            document.documentElement.style.overflow = "unset";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Darker full-screen backdrop - Click to close */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer" onClick={handleCancel} />

            {/* Modal Content container - Adjusted max-height and centering */}
            <div className="relative w-full max-w-4xl max-h-[85vh] bg-navbarBg border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-border flex items-center justify-between bg-navbarBg">
                    <div>
                        <h2 className="text-2xl font-bold text-headings">Create New Schedule</h2>
                        <p className="text-sm text-muted mt-1">
                            Schedule when and where your content should play
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all cursor-pointer text-muted hover:text-red-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Step Indicator */}
                        <StepIndicator currentStep={showLowerThird ? 2 : currentStep} steps={STEPS} />

                        {/* Step Content */}
                        <div className="min-h-[400px]">
                            {currentStep === 1 && (
                                <Step1NameDescription data={step1Data} onChange={setStep1Data} />
                            )}

                            {currentStep === 2 && !showLowerThird && (
                                <Step2ContentSelection
                                    data={step2Data}
                                    onChange={(newData) => {
                                        setStep2Data(newData);
                                        if (newData.contentType === "lower-third") {
                                            setShowLowerThird(true);
                                        }
                                    }}
                                    onContentSelect={handleContentSelect}
                                />
                            )}

                            {showLowerThird && (
                                <Step2LowerThird
                                    data={lowerThirdData as any}
                                    onChange={setLowerThirdData}
                                    onLowerThirdCreated={setCreatedLowerThirdId}
                                    onContentTypeChange={(type) => {
                                        setStep2Data(prev => ({ ...prev, contentType: type }));
                                        if (type !== "lower-third") {
                                            setShowLowerThird(false);
                                        }
                                    }}
                                />
                            )}

                            {currentStep === 3 && !showLowerThird && (
                                <Step3ScreenSelection data={step3Data} onChange={setStep3Data} />
                            )}

                            {currentStep === 4 && (
                                <Step4ScheduleSettings data={step4Data} onChange={setStep4Data} />
                            )}
                        </div>
                    </div>
                </div>
                {/* Footer - Sticky at bottom */}
                <div className="p-6 border-t border-border flex items-center justify-between bg-navbarBg/80 backdrop-blur-md">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2.5 rounded-xl border border-border text-headings font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-customShadow"
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Always show Back button except on step 1 and not in lower third */}
                        {(currentStep > 1 || showLowerThird) && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-2.5 rounded-xl border border-border text-headings font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-customShadow"
                            >
                                Back
                            </button>
                        )}

                        {/* Always show Next/Create button */}
                        <button
                            onClick={handleNext}
                            disabled={isNextDisabled()}
                            className="px-8 py-2.5 rounded-xl bg-bgBlue text-white font-semibold hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow transition-all cursor-pointer"
                        >
                            {currentStep === 4 ? "Create Schedule" : "Next"}
                        </button>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Ensure Select and other portals appear on top */
                    [data-radix-portal],
                    [data-slot="select-content"],
                    [data-radix-popper-content-wrapper] {
                        z-index: 9999 !important;
                    }
                ` }} />
            </div>
        </div>
    );
};

export default CreateScheduleDialog;
