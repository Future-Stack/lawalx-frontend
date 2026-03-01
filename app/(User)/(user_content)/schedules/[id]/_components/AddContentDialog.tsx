"use client";

import React, { useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import Step2ContentSelection from "../../_components/CreateScheduleDialog/Step2ContentSelection";
import { ContentItem } from "@/types/content";

interface AddContentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (content: ContentItem) => void;
    initialContentType?: string;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({
    isOpen,
    onClose,
    onSelect,
    initialContentType = "all",
}) => {
    const [data, setData] = useState({
        contentType: initialContentType,
        selectedContent: null as ContentItem | null,
    });

    return (
        <BaseDialog
            open={isOpen}
            setOpen={onClose}
            title="Select Content"
            description="Choose a video, image, or audio file for this schedule"
            className="max-w-4xl"
        >
            <div className="p-2 overflow-y-auto max-h-[70vh]">
                <Step2ContentSelection
                    data={data as any}
                    onChange={(newData) => setData(newData as any)}
                    onContentSelect={(content) => {
                        onSelect(content as any);
                        onClose();
                    }}
                />
            </div>
        </BaseDialog>
    );
};

export default AddContentDialog;
