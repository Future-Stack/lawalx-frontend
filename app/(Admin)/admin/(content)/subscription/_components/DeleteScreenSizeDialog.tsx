
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BaseDialog from "@/common/BaseDialog";
import { AlertTriangle } from "lucide-react";

interface DeleteScreenSizeDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: any;
}

const DeleteScreenSizeDialog = ({ open, setOpen, data }: DeleteScreenSizeDialogProps) => {
    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title=""
            description=""
            maxWidth="sm"
        >
            <div className="flex flex-col items-center text-center space-y-6 py-4">
                {/* Warning Icon */}
                <div className="w-16 h-16 rounded-lg bg-[#FEFCE8] flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-[#EAB308]" />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h2 className="text-[24px] font-bold text-headings">Warning</h2>
                    <p className="text-[#526077] text-[16px] max-w-[280px]">
                        Are you sure you want to delete this Screen Size
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex w-full gap-0 rounded-xl border border-borderGray overflow-hidden shadow-sm">
                    <button
                        onClick={() => setOpen(false)}
                        className="flex-1 py-4 bg-white hover:bg-gray-50 text-[18px] font-bold text-headings transition-all cursor-pointer border-r border-borderGray"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="flex-1 py-4 bg-bgRed hover:bg-bgRed/90 text-[18px] font-bold text-white transition-all cursor-pointer shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)]"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default DeleteScreenSizeDialog;
