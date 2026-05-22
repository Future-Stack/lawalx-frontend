import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface DetailHeaderProps {
    isNew: boolean;
    name: string;
    onSave: () => void;
    isSaving?: boolean;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ isNew, name, onSave, isSaving }) => {
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
                {/* <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 border border-bgBlue text-bgBlue rounded-lg font-semibold hover:bg-blue-50 transition cursor-pointer shadow-customShadow">
                    <Pause className="w-4 h-4" />
                    Pause Schedule
                </button> */}
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none min-w-[120px] flex items-center justify-center gap-2 px-8 py-2.5 bg-bgBlue disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer shadow-customShadow"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        "Save"
                    )}
                </button>
            </div>
        </div>
    );
};

export default DetailHeader;
