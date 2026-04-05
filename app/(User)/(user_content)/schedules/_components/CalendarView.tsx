import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAllSchedulesDataQuery } from "@/redux/api/users/schedules/schedules.api";
import { Schedule } from "@/redux/api/users/schedules/schedules.type";
import { useRouter } from "next/navigation";
import SchedulePreviewDialog from "./SchedulePreviewDialog";

const CalendarView: React.FC = () => {
    const router = useRouter();
    const { data: schedulesData } = useGetAllSchedulesDataQuery(undefined);
    const [activeDate, setActiveDate] = useState(new Date());
    const [viewType, setViewType] = useState<"Day" | "Week" | "Month">("Month");
    const [selectedInstance, setSelectedInstance] = useState<{ id: string, date: string } | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const allSchedules = useMemo(() => schedulesData?.data || [], [schedulesData]);

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Helper to check if a schedule is active on a specific date
    const isScheduleActiveOnDate = (schedule: Schedule, date: Date) => {
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const start = new Date(schedule.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(schedule.endDate);
        end.setHours(23, 59, 59, 999);

        // Basic range check
        if (checkDate < start || checkDate > end) return false;

        if (schedule.recurrenceType === "once") {
            return checkDate.getTime() === start.getTime();
        }

        if (schedule.recurrenceType === "daily") {
            return true;
        }

        if (schedule.recurrenceType === "weekly") {
            const dayName = shortDays[checkDate.getDay()];
            return (schedule.daysOfWeek as any[]).includes(dayName);
        }

        if (schedule.recurrenceType === "monthly") {
            return (schedule.dayOfMonth as number[]).includes(checkDate.getDate());
        }

        return false;
    };

    const getSchedulesForDate = (date: Date) => {
        return allSchedules.filter(s => isScheduleActiveOnDate(s, date));
    };

    const formatTimeRange = (startStr: string, endStr: string) => {
        const format = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: date.getMinutes() === 0 ? undefined : "2-digit",
                hour12: true,
            }).toLowerCase();
        };
        return `${format(startStr)} – ${format(endStr)}`;
    };

    const handleScheduleClick = (schedule: Schedule, date: Date) => {
        setSelectedInstance({ id: schedule.id, date: date.toDateString() });
        setSelectedSchedule(schedule);
        setIsPreviewOpen(true);
    };

    // Navigation logic
    const navigatePrev = () => {
        const next = new Date(activeDate);
        if (viewType === "Month") next.setMonth(next.getMonth() - 1);
        else if (viewType === "Week") next.setDate(next.getDate() - 7);
        else next.setDate(next.getDate() - 1);
        setActiveDate(next);
    };

    const navigateNext = () => {
        const next = new Date(activeDate);
        if (viewType === "Month") next.setMonth(next.getMonth() + 1);
        else if (viewType === "Week") next.setDate(next.getDate() + 7);
        else next.setDate(next.getDate() + 1);
        setActiveDate(next);
    };

    const setToday = () => setActiveDate(new Date());

    const getHeaderLabel = () => {
        if (viewType === "Month") {
            return activeDate.toLocaleString("default", { month: "long", year: "numeric" });
        } else if (viewType === "Week") {
            const start = new Date(activeDate);
            start.setDate(activeDate.getDate() - activeDate.getDay());
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleString("default", { month: "short" })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
            }
            return `${start.toLocaleString("default", { month: "short", day: "numeric" })} – ${end.toLocaleString("default", { month: "short", day: "numeric" })}, ${end.getFullYear()}`;
        } else {
            // Day view format: Apr 5, 2026
            return activeDate.toLocaleString("default", { month: "short", day: "numeric", year: "numeric" });
        }
    };

    // Month Logic
    const firstDayOfMonth = new Date(activeDate.getFullYear(), activeDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 0).getDate();

    const renderMonth = () => {
        const days = [];
        const prevMonthLastDay = new Date(activeDate.getFullYear(), activeDate.getMonth(), 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const d = new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, prevMonthLastDay - i);
            days.push({ day: prevMonthLastDay - i, date: d, current: false });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(activeDate.getFullYear(), activeDate.getMonth(), i);
            days.push({ day: i, date: d, current: true });
        }
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, i);
            days.push({ day: i, date: d, current: false });
        }

        return (
            <div className="grid grid-cols-7 border-b border-border">
                {days.map((item, i) => {
                    const isToday = item.current && item.date.toDateString() === new Date().toDateString();
                    const daySchedules = getSchedulesForDate(item.date);
                    
                    return (
                        <div key={i} className={cn(
                            "min-h-[120px] p-2 border-r border-b border-border last:border-r-0 relative hover:bg-bgGray/20 transition-colors",
                            !item.current && "bg-bgGray/10"
                        )}>
                            <span className={cn(
                                "text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full cursor-pointer",
                                isToday ? "bg-bgBlue text-white" : "text-muted",
                                !item.current && "text-gray-300"
                            )}>{item.day}</span>
                            
                            <div className="mt-2 space-y-1">
                                {daySchedules.map(schedule => {
                                    const isActive = selectedInstance?.id === schedule.id && 
                                                   selectedInstance?.date === item.date.toDateString();
                                    return (
                                        <button
                                            key={schedule.id}
                                            onClick={() => handleScheduleClick(schedule, item.date)}
                                            className={cn(
                                                "w-full text-left px-2 py-1.5 rounded text-[10px] font-bold truncate cursor-pointer transition-all block border-l-2",
                                                isActive 
                                                    ? "bg-bgBlue text-white border-blue-600 shadow-md transform scale-[1.02] z-10" 
                                                    : "bg-blue-50 text-bgBlue border-bgBlue hover:bg-bgBlue/20"
                                            )}
                                        >
                                            <div className="flex flex-col">
                                                <span className="truncate">{schedule.name}</span>
                                                <span className="text-[9px] opacity-70">
                                                    {formatTimeRange(schedule.startTime, schedule.endTime)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeek = () => {
        const start = new Date(activeDate);
        start.setDate(activeDate.getDate() - activeDate.getDay());
        return (
            <div className="grid grid-cols-7 border-b border-border">
                {Array.from({ length: 7 }).map((_, i) => {
                    const day = new Date(start);
                    day.setDate(start.getDate() + i);
                    const isToday = day.toDateString() === new Date().toDateString();
                    const daySchedules = getSchedulesForDate(day);

                    return (
                        <div key={i} className={cn("min-h-[400px] p-2 border-r border-border last:border-r-0 transition-colors", isToday && "bg-blue-50/30")}>
                            <div className="text-center mb-4">
                                <div className={cn("text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full mx-auto mt-1 cursor-pointer", isToday ? "bg-bgBlue text-white" : "text-headings dark:text-white")}>{day.getDate()}</div>
                            </div>
                            
                            <div className="space-y-2">
                                {daySchedules.map(schedule => {
                                    const isActive = selectedInstance?.id === schedule.id && 
                                                   selectedInstance?.date === day.toDateString();
                                    return (
                                        <button
                                            key={schedule.id}
                                            onClick={() => handleScheduleClick(schedule, day)}
                                            className={cn(
                                                "w-full text-left p-2 rounded text-xs font-bold transition-all cursor-pointer block border-l-2",
                                                isActive 
                                                    ? "bg-bgBlue text-white border-blue-600 shadow-lg transform scale-[1.02] z-10" 
                                                    : "bg-blue-50 text-bgBlue border-bgBlue hover:bg-bgBlue/20"
                                            )}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="truncate">{schedule.name}</span>
                                                <span className="text-[10px] opacity-70 shrink-0">
                                                    {formatTimeRange(schedule.startTime, schedule.endTime)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDay = () => {
        const hours = Array.from({ length: 24 }).map((_, i) => i);
        const daySchedules = getSchedulesForDate(activeDate);

        return (
            <div className="divide-y divide-border">
                {hours.map((hour) => {
                    const schedulesInHour = daySchedules.filter(s => {
                        const date = new Date(s.startTime);
                        return date.getUTCHours() === hour;
                    });

                    return (
                        <div key={hour} className="flex min-h-[60px] hover:bg-bgGray/20 transition-colors">
                            <div className="w-16 p-4 text-right text-[10px] font-bold text-muted border-r border-border cursor-pointer">
                                {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                            </div>
                            <div className="flex-1 p-2 relative flex flex-col gap-2">
                                {schedulesInHour.map(schedule => {
                                    const isActive = selectedInstance?.id === schedule.id && 
                                                   selectedInstance?.date === activeDate.toDateString();
                                    return (
                                        <button
                                            key={schedule.id}
                                            onClick={() => handleScheduleClick(schedule, activeDate)}
                                            className={cn(
                                                "w-full max-w-md text-left p-3 rounded-lg text-xs font-bold transition-all cursor-pointer border-l-4",
                                                isActive 
                                                    ? "bg-bgBlue text-white border-blue-600 shadow-xl transform translate-x-1" 
                                                    : "bg-blue-50 text-bgBlue border-bgBlue hover:bg-bgBlue/20"
                                            )}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold">{schedule.name}</span>
                                                <span className="text-[10px] opacity-70">
                                                    {formatTimeRange(schedule.startTime, schedule.endTime)}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-headings dark:text-white">Schedule Calendar</h2>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={setToday} 
                            className="px-6 py-2 text-sm font-medium border border-border rounded-full hover:bg-gray-50 transition shadow-customShadow cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                            Today
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={navigatePrev} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-full transition-colors">
                                <ChevronLeft className="w-5 h-5 text-headings dark:text-white" />
                            </button>
                            <span className="text-lg font-medium text-headings dark:text-white min-w-[120px] text-center">
                                {getHeaderLabel()}
                            </span>
                            <button onClick={navigateNext} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-full transition-colors">
                                <ChevronRight className="w-5 h-5 text-headings dark:text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-bgGray dark:bg-gray-800">
                    {["Day", "Week", "Month"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setViewType(type as any)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer",
                                viewType === type ? "bg-white dark:bg-gray-700 text-bgBlue shadow-customShadow" : "text-gray-500"
                            )}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-navbarBg border border-border rounded-xl shadow-sm overflow-hidden overflow-y-auto max-h-[calc(100vh-300px)] scrollbar-hide">
                {viewType === "Day" ? (
                    <div className="flex border-b border-border bg-bgGray/30 dark:bg-gray-800/30 items-center">
                        <div className="w-16 px-4 py-4 text-center text-[10px] font-bold text-muted uppercase tracking-wider border-r border-border">Time</div>
                        <div className="flex-1 px-6 py-4 flex items-center justify-center gap-2">
                            <span className="text-sm font-semibold text-muted uppercase tracking-widest">
                                {daysOfWeek[activeDate.getDay()]}
                            </span>
                            <span className={cn(
                                "w-9 h-9 flex items-center justify-center rounded-full text-lg font-bold transition-all",
                                activeDate.toDateString() === new Date().toDateString()
                                    ? "bg-bgBlue text-white shadow-md"
                                    : "text-headings dark:text-white"
                            )}>
                                {activeDate.getDate()}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 border-b border-border bg-bgGray/30 dark:bg-gray-800/30">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="px-4 py-3 text-center text-sm font-semibold text-muted border-r border-border last:border-r-0 cursor-pointer">
                                {day}
                            </div>
                        ))}
                    </div>
                )}
                {viewType === "Month" && renderMonth()}
                {viewType === "Week" && renderWeek()}
                {viewType === "Day" && renderDay()}
            </div>

            <SchedulePreviewDialog
                open={isPreviewOpen}
                setOpen={setIsPreviewOpen}
                schedule={selectedSchedule}
                onEdit={(id) => router.push(`/schedules/${id}`)}
            />
        </div>
    );
};

export default CalendarView;
