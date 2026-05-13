"use client";

import { useEffect, useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";

interface ScreenSizeDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    mode: "add" | "edit";
    data: any;
}

const ScreenSizeDialog = ({ open, setOpen, mode, data }: ScreenSizeDialogProps) => {
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (mode === "edit" && data) {
            setSize(data.size);
            setPrice(data.price.replace("$", ""));
        } else {
            setSize("");
            setPrice("");
        }
    }, [mode, data, open]);

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title="" // Custom title inside content to match design precisely
            description=""
            maxWidth="lg"
        >
            <div className="space-y-6 -mt-6">
                {/* Header with Icon */}
                <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#7F56D91A] border border-[#7F56D933] flex items-center justify-center">
                        <Layout className="w-6 h-6 text-[#7F56D9]" />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-bold text-headings">
                            {mode === "add" ? "Add New Screen Size" : "Edit New Screen Size"}
                        </h2>
                        <p className="text-muted text-[14px]">
                            Configure the plan details, limits, and features.
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[14px] font-bold text-headings">Screen Size</Label>
                        <input
                            type="text"
                            placeholder="42"
                            value={size}
                            onChange={(e) => setSize(e.target.value)}
                            className="w-full bg-white dark:bg-gray-950 border border-borderGray rounded-xl px-4 py-3 text-[16px] text-body focus:outline-none focus:ring-1 focus:ring-primary-action transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[14px] font-bold text-headings">Price</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body font-medium">$</span>
                            <input
                                type="text"
                                placeholder="256.25"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-white dark:bg-gray-950 border border-borderGray rounded-xl pl-8 pr-4 py-3 text-[16px] text-body focus:outline-none focus:ring-1 focus:ring-primary-action transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-border mt-8 -mx-6 px-6">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-6 py-2.5 rounded-lg border border-borderGray font-bold text-headings hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="px-10 py-2.5 rounded-lg bg-[#0EA5E9] text-white font-bold hover:bg-[#0EA5E9]/90 transition-all cursor-pointer shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default ScreenSizeDialog;
