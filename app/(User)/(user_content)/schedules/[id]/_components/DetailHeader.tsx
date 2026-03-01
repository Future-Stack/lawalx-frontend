import React from "react";
import { ArrowLeft, Pause } from "lucide-react";
import Link from "next/link";

interface DetailHeaderProps {
    isNew: boolean;
    name: string;
    onSave: () => void;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ isNew, name, onSave }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
            <div className="flex items-center gap-4">
                <Link href="/schedules" className="p-2 border border-border hover:border-bgBlue rounded-lg shadow-customShadow transition-colors cursor-pointer">
                    <ArrowLeft className="w-6 h-6 text-muted" />
                </Link>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-headings leading-tight">
                        {isNew ? "Create Schedule" : name || "Morning Content"}
                    </h1>
                    <p className="text-sm text-muted">
                        {isNew ? "Set up your new content schedule" : "Play welcome content during morning hours"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-bgBlue text-bgBlue rounded-lg font-semibold hover:bg-blue-50 transition cursor-pointer shadow-customShadow">
                    <Pause className="w-4 h-4" />
                    Pause Schedule
                </button>
                <button
                    onClick={onSave}
                    className="flex-1 sm:flex-none px-8 py-2.5 bg-bgBlue text-white rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer shadow-customShadow"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default DetailHeader;
