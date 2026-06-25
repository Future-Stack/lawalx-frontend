/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import Step2LowerThird from "../../_components/CreateScheduleDialog/Step2LowerThird";
import { useUpdateLowerThirdMutation } from "@/redux/api/users/schedules/schedules.api";
import { LowerThirdPayload } from "@/redux/api/users/schedules/schedules.type";
import { toast } from "sonner";

interface AddLowerThirdDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLowerThirdCreated: (id: string, config?: any) => void;
    existingLowerThird?: any;
}

const AddLowerThirdDialog: React.FC<AddLowerThirdDialogProps> = ({
    isOpen,
    onClose,
    onLowerThirdCreated,
    existingLowerThird,
}) => {
    const [updateLowerThird, { isLoading: isUpdatingLowerThird }] = useUpdateLowerThirdMutation();

    const [data, setData] = useState({
        selectedContent: null as any,
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
            message: "",
            duration: 0,
        },
    });

    const existingLowerThirdId = existingLowerThird?.id;

    useEffect(() => {
        if (isOpen) {
            setData({
                selectedContent: null as any,
                lowerThirdConfig: {
                    backgroundColor: existingLowerThird?.backgroundColor || "#3D3D3D",
                    backgroundOpacity: existingLowerThird ? parseInt(existingLowerThird.backgroundOpacity || "80") : 80,
                    enableAnimation: existingLowerThird ? existingLowerThird.animation !== "None" : true,
                    animationDirection: existingLowerThird?.animation === "Right_to_Left" ? "right-to-left" : existingLowerThird?.animation === "Left_to_Light" ? "left-to-right" : "left-to-right",
                    speed: existingLowerThird?.speed ? (existingLowerThird.speed <= 20 ? "slow" : existingLowerThird.speed <= 40 ? "medium" : "fast") : "medium",
                    enableLogo: true,
                    position: existingLowerThird?.position?.toLowerCase() || "bottom",
                    textColor: existingLowerThird?.textColor || "#FFFFFF",
                    fontSize: existingLowerThird?.fontSize === "Small" ? "14" : existingLowerThird?.fontSize === "Medium" ? "16" : existingLowerThird?.fontSize === "Large" ? "24" : "24",
                    fontFamily: existingLowerThird?.font || "Inter",
                    loop: existingLowerThird?.loop ?? true,
                    message: existingLowerThird?.text || "",
                    duration: existingLowerThird?.duration || 0,
                },
            });
        }
    }, [isOpen, existingLowerThird]);

    const handleUpdateLowerThird = async (payload: LowerThirdPayload) => {
        if (!existingLowerThirdId) return;

        try {
            const response = await updateLowerThird({
                id: existingLowerThirdId,
                data: payload,
            }).unwrap();

            toast.success(response.message || "Text Section updated successfully");
            onLowerThirdCreated(existingLowerThirdId, data.lowerThirdConfig);
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update Text Section");
        }
    };

    return (
        <BaseDialog
            open={isOpen}
            setOpen={onClose}
            title={existingLowerThird ? "Edit Text Section" : "Add Text Section"}
            description="Configure scrolling text overlay for your schedule"
            maxWidth="4xl"
        >
            <div className="p-2">
                <Step2LowerThird
                    data={data as any}
                    onChange={(newData) => setData(newData as any)}
                    onSubmitLowerThird={existingLowerThirdId ? handleUpdateLowerThird : undefined}
                    isSubmitting={isUpdatingLowerThird}
                    submitLabel={existingLowerThirdId ? "Update Text Section" : "Add Text Section"}
                    loadingLabel={existingLowerThirdId ? "Updating..." : "Creating..."}
                    onLowerThirdCreated={(id) => {
                        onLowerThirdCreated(id, data.lowerThirdConfig);
                        onClose();
                    }}
                />
            </div>
        </BaseDialog>
    );
};

export default AddLowerThirdDialog;
