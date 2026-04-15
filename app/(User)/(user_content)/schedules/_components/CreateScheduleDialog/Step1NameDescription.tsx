"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Step1Props {
    data: {
        name: string;
        description: string;
    };
    onChange: (data: { name: string; description: string }) => void;
}

const Step1NameDescription: React.FC<Step1Props> = ({ data, onChange }) => {
    return (
        <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-headings">
                    Schedule name <span className="text-red-500">*</span>
                </Label>
                <Input
                    type="text"
                    placeholder="Enter a descriptive schedule name"
                    value={data.name}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    className="w-full h-14 px-6 bg-input border-borderGray text-headings text-lg rounded-xl focus:ring-2 focus:ring-bgBlue transition-all shadow-sm"
                />
            </div>

            {/* Description Field */}
            <div className="space-y-4">
                <Label className="text-base font-semibold text-headings">
                   Schedule description (Optional)
                </Label>
                <Textarea
                    placeholder="Provide additional context or notes about this schedule..."
                    value={data.description}
                    onChange={(e) => onChange({ ...data, description: e.target.value })}
                    className="w-full min-h-[150px] p-6 bg-input border-borderGray text-headings text-base rounded-xl focus:ring-2 focus:ring-bgBlue transition-all shadow-sm resize-none"
                />
            </div>
        </div>
    );
};

export default Step1NameDescription;
