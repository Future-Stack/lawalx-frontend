"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import CreateScheduleDialog from "./CreateScheduleDialog";

interface SchedulesHeaderProps {
    title: string;
    subtitle: string;
}

const SchedulesHeader: React.FC<SchedulesHeaderProps> = ({ title, subtitle }) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-headings dark:text-white">{title}</h1>
                    <p className="text-muted text-sm mt-1">{subtitle}</p>
                </div>
                <button
                    onClick={() => setDialogOpen(true)}
                    className="bg-bgBlue hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow-customShadow transition flex items-center gap-2 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Schedule
                </button>
            </div>

            {/* Create Schedule Dialog */}
            <CreateScheduleDialog open={dialogOpen} setOpen={setDialogOpen} />
        </>
    );
};

export default SchedulesHeader;
