import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BaseSelect from "@/common/BaseSelect";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface ScheduleTimeSectionProps {
    data: {
        repeat: string;
        playTime: string;
        endTime: string;
        startDate: string;
        endDate?: string;
    };
    onChange: (data: any) => void;
    daysOfWeek: string[];
    dayOfMonth: number[];
}

const ScheduleTimeSection: React.FC<ScheduleTimeSectionProps> = ({ data, onChange, daysOfWeek, dayOfMonth }) => {
    const startTimeRef = useRef<HTMLInputElement>(null);
    const endTimeRef = useRef<HTMLInputElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);

    const handleIconClick = (ref: React.RefObject<HTMLInputElement | null>) => {
        if (ref.current && 'showPicker' in ref.current) {
            (ref.current as any).showPicker();
        }
    };

    const weekDays = [
        { short: "Mon", full: "Monday" },
        { short: "Tue", full: "Tuesday" },
        { short: "Wed", full: "Wednesday" },
        { short: "Thu", full: "Thursday" },
        { short: "Fri", full: "Friday" },
        { short: "Sat", full: "Saturday" },
        { short: "Sun", full: "Sunday" }
    ];

    const toggleDay = (day: string) => {
        const updatedDays = daysOfWeek.includes(day)
            ? daysOfWeek.filter(d => d !== day)
            : [...daysOfWeek, day];
        onChange({ daysOfWeek: updatedDays });
    };

    const toggleDate = (date: number) => {
        const updatedDates = dayOfMonth.includes(date)
            ? dayOfMonth.filter(d => d !== date)
            : [...dayOfMonth, date];
        onChange({ dayOfMonth: updatedDates });
    };

    const isRunOnce = data.repeat.toLowerCase() === "once";

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
                            { label: "Run Once", value: "once" },
                            { label: "Daily", value: "daily" },
                            { label: "Weekly", value: "weekly" },
                            { label: "Monthly", value: "monthly" },
                        ]}
                    />
                </div>

                {/* Weekly Day Selector */}
                {data.repeat.toLowerCase() === "weekly" && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-headings">Select Days</Label>
                        <div className="flex flex-wrap gap-2">
                            {weekDays.map((day) => (
                                <button
                                    key={day.short}
                                    type="button"
                                    onClick={() => toggleDay(day.short)}
                                    className={cn(
                                        "px-3 py-1 rounded-md border transition-all font-medium text-xs cursor-pointer",
                                        daysOfWeek.includes(day.short)
                                            ? "bg-bgBlue text-white border-bgBlue"
                                            : "bg-input text-headings border-borderGray hover:border-bgBlue"
                                    )}
                                >
                                    {day.short}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monthly Date Selector */}
                {data.repeat.toLowerCase() === "monthly" && (
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-headings">Select Days</Label>
                        <div className="grid grid-cols-7 sm:grid-cols-10 lg:grid-cols-11 gap-1.5">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                                <button
                                    key={date}
                                    type="button"
                                    onClick={() => toggleDate(date)}
                                    className={cn(
                                        "aspect-square rounded-md border transition-all font-bold text-[10px] sm:text-xs flex items-center justify-center cursor-pointer",
                                        dayOfMonth.includes(date)
                                            ? "bg-bgBlue text-white border-bgBlue"
                                            : "bg-input text-headings border-borderGray hover:border-bgBlue"
                                    )}
                                >
                                    {date}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                            {isRunOnce ? "Select Date" : "Start Date"} <span className="text-red-500">*</span>
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

                    {!isRunOnce && (
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
