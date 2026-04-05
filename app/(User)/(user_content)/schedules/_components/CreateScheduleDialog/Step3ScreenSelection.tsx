"use client";

import React, { useState } from "react";
import { Search, Monitor, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetAllProgramsDataQuery } from "@/redux/api/users/programs/programs.api";
import { ProgramsResponse, Program } from "@/redux/api/users/programs/programs.type";

interface Step3Props {
    data: {
        selectedScreens: string[];
    };
    onChange: (data: { selectedScreens: string[] }) => void;
}

const Step3ScreenSelection: React.FC<Step3Props> = ({ data, onChange }) => {
    const { data: allPrograms, isLoading } = useGetAllProgramsDataQuery(undefined);
    const [searchQuery, setSearchQuery] = useState("");

    const programs = (allPrograms as ProgramsResponse)?.data || [];

    const filteredPrograms = programs.filter((program: Program) =>
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (program.description && program.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleProgram = (programId: string) => {
        const updatedPrograms = data.selectedScreens.includes(programId)
            ? data.selectedScreens.filter(id => id !== programId)
            : [...data.selectedScreens, programId];

        onChange({ selectedScreens: updatedPrograms });
    };

    return (
        <div className="space-y-6">
            {/* Select Program Field Label */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-headings">
                    Select Device
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                        type="text"
                        placeholder="Search Device"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input border-borderGray text-headings"
                    />
                </div>
            </div>

            {/* Program List */}
            <div className="max-h-[350px] overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span>Loading devices...</span>
                    </div>
                ) : filteredPrograms.length === 0 ? (
                    <div className="text-center py-8 text-muted border border-dashed border-border rounded-lg">
                        No devices found
                    </div>
                ) : (
                    filteredPrograms.map((program: Program) => (
                        <div
                            key={program.id}
                            onClick={() => toggleProgram(program.id)}
                            className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer group ${data.selectedScreens.includes(program.id)
                                ? "border-bgBlue bg-blue-50 dark:bg-blue-950/20"
                                : "border-borderGray bg-input hover:border-bgBlue"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${data.selectedScreens.includes(program.id) ? "bg-bgBlue text-white" : "bg-gray-100 dark:bg-gray-800 text-muted"
                                }`}>
                                <Monitor className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <Label htmlFor={program.id} className="font-medium text-headings cursor-pointer truncate block">
                                    {program.name}
                                </Label>
                                <p className="text-sm text-muted truncate">
                                    {program.devices && program.devices.length > 0 
                                        ? `${program.devices[0].name}${program.devices[0].location ? ` - ${program.devices[0].location}` : ""}`
                                        : program.serene_size || "Standard Resolution"}
                                </p>
                            </div>

                            {data.selectedScreens.includes(program.id) ? (
                                <CheckCircle2 className="w-5 h-5 text-bgBlue" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-borderGray group-hover:border-bgBlue" />
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Selected Count */}
            {data.selectedScreens.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-bgBlue font-medium animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{data.selectedScreens.length} device{data.selectedScreens.length > 1 ? "s" : ""} selected</span>
                </div>
            )}
        </div>
    );
};

export default Step3ScreenSelection;
