import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BaseSelect from "@/common/BaseSelect";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRef } from "react";

interface ScheduleTimeSectionProps {
    data: {
        repeat: string;
        playTime: string;
        endTime: string;
        startDate: string;
        endDate?: string;
    };
    onChange: (data: any) => void;
}

const ScheduleTimeSection: React.FC<ScheduleTimeSectionProps> = ({ data, onChange }) => {
    const startTimeRef = useRef<HTMLInputElement>(null);
    const endTimeRef = useRef<HTMLInputElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const handleIconClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current && 'showPicker' in ref.current) {
            (ref.current as any).showPicker();
        }
    };

    return (
        <section className="bg-navbarBg border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-headings dark:text-white">Schedule Time</h2>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold text-headings dark:text-white">Repeat *</Label>
                    <BaseSelect
                        value={data.repeat}
                        onChange={(val) => onChange({ ...data, repeat: val })}
                        options={[
                            { label: "Run Once", value: "Run Once" },
                            { label: "Daily", value: "Daily" },
                            { label: "Weekly", value: "Weekly" },
                            { label: "Monthly", value: "Monthly" },
                        ]}
                    />
                </div>

                {/* Play Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-headings">
                            Start Time <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative cursor-pointer" onClick={() => handleIconClick(startTimeRef)}>
                            <Input
                                ref={startTimeRef}
                                type="time"
                                value={data.playTime}
                                onChange={(e) => onChange({ ...data, playTime: e.target.value })}
                                className="bg-input border-borderGray text-headings cursor-pointer pr-10"
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-headings">
                            End Time <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative cursor-pointer" onClick={() => handleIconClick(endTimeRef)}>
                            <Input
                                ref={endTimeRef}
                                type="time"
                                value={data.endTime}
                                onChange={(e) => onChange({ ...data, endTime: e.target.value })}
                                className="bg-input border-borderGray text-headings cursor-pointer pr-10"
                            />
                            <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Start Date Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-headings">
                            {data.repeat === "Run Once" ? "Select Date" : "Start Date"} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative cursor-pointer" onClick={() => handleIconClick(startDateRef)}>
                            <Input
                                ref={startDateRef}
                                type="date"
                                value={data.startDate}
                                onChange={(e) => onChange({ ...data, startDate: e.target.value })}
                                className="bg-input border-borderGray text-headings cursor-pointer pr-10"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        </div>
                    </div>

                    {data.repeat !== "Run Once" && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-headings">
                                End Date <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative cursor-pointer" onClick={() => handleIconClick(endDateRef)}>
                                <Input
                                    ref={endDateRef}
                                    type="date"
                                    value={data.endDate || ""}
                                    onChange={(e) => onChange({ ...data, endDate: e.target.value })}
                                    className="bg-input border-borderGray text-headings cursor-pointer pr-10"
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ScheduleTimeSection;
