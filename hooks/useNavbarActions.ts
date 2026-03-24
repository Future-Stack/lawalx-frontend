"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { useUploadFileMutation } from "@/redux/api/users/content/content.api";

export function useNavbarActions() {
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);

    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        isUploading,
        fileInputRef,
        handleUploadClick,
        handleFileChange,
    };
}
