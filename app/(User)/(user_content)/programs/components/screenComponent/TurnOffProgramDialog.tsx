"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

interface TurnOffProgramDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    deviceCount: number;
}

const TurnOffProgramDialog: React.FC<TurnOffProgramDialogProps> = ({
    open,
    onOpenChange,
    onConfirm,
    deviceCount,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="max-w-[400px] p-0 rounded-[24px] overflow-hidden border-none bg-white"
                showCloseButton={true}
            >
                <div className="p-8 pb-6 flex flex-col items-center">
                    {/* Red Circle Icon */}
                    <div className="w-[80px] h-[80px] rounded-full bg-[#FEF2F2] border-[1px] border-[#FEE2E2] flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-[#EF4444] stroke-[1.5]" />
                    </div>

                    <h3 className="text-[24px] font-bold text-[#171717] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        Are You Sure?
                    </h3>
                    <p className="text-[16px] text-[#404040] text-center leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                        If you Turn of the Program, {deviceCount} devices will stop playing
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-[#F5F5F5] w-full" />

                <div className="p-6 flex gap-4">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="flex-1 py-4 px-4 border border-[#E5E7EB] rounded-[12px] font-bold text-[#171717] hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-4 px-4 bg-[#EF4444] rounded-[12px] font-bold text-white hover:bg-red-600 transition-colors cursor-pointer shadow-sm"
                        style={{ fontFamily: "Inter, sans-serif" }}
                    >
                        Turn Off
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TurnOffProgramDialog;
