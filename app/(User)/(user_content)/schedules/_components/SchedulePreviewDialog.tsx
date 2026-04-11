"use client";

import React from "react";
import { Clock, FileText, Calendar, Trash2, PencilLine } from "lucide-react";
import BaseDialog from "@/common/BaseDialog";
import { Schedule } from "@/redux/api/users/schedules/schedules.type";
import Image from "next/image";
import { getUrl } from "@/lib/content-utils";
import { useDeleteScheduleMutation, useUpdateScheduleMutation, useGetSingleScheduleDataQuery } from "@/redux/api/users/schedules/schedules.api";
import { toast } from "sonner";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";
import Marquee from "react-fast-marquee";


interface SchedulePreviewDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    schedule: Schedule | null;
    onEdit?: (id: string) => void;
}

const SchedulePreviewDialog: React.FC<SchedulePreviewDialogProps> = ({
    open,
    setOpen,
    schedule,
    onEdit,
}) => {
    const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
    const [deleteSchedule] = useDeleteScheduleMutation();
    const [openDelete, setOpenDelete] = React.useState(false);
    const [scheduleToDelete, setScheduleToDelete] = React.useState<Schedule | null>(null);

    const { data: fullScheduleData } = useGetSingleScheduleDataQuery(
        schedule?.id ? { id: schedule.id } : { id: "" },
        { skip: !open || !schedule?.id }
    );

    const activeSchedule = fullScheduleData?.data || schedule;

    // Automation States for Professional Looping Preview
    const [playingIndex, setPlayingIndex] = React.useState(0);
    const [isFading, setIsFading] = React.useState(false);

    // Reset index when schedule changes or dialog opens
    React.useEffect(() => {
        if (open) {
            setPlayingIndex(0);
            setIsFading(false);
        }
    }, [open, schedule?.id]);

    const allItems = React.useMemo(() => {
        if (!activeSchedule) return [];
        const files = (activeSchedule.files || []).map(f => ({ ...f, isFile: true }));
        const programs = (activeSchedule.programs || []).map(p => ({ ...p, isProgram: true }));
        return [...files, ...programs];
    }, [activeSchedule]);

    const advance = React.useCallback(() => {
        if (allItems.length <= 1) return;
        setIsFading(true);
        setTimeout(() => {
            setPlayingIndex((prev) => (prev + 1) % allItems.length);
            setIsFading(false);
        }, 500); // Synchronized with globals.css animation duration
    }, [allItems.length]);

    React.useEffect(() => {
        if (allItems.length <= 1 || !open) return;
        const currentItem = allItems[playingIndex];
        if (!currentItem) return;

        // Videos and Programs rely on player's onEnded callback
        const item = currentItem as any;
        if (item.isProgram || item.type === "VIDEO") return;

        // Default to 7s for non-video items
        const duration = (currentItem as any).duration ? (currentItem as any).duration * 1000 : 7000;
        const timer = setTimeout(advance, Math.max(0, duration - 500));
        return () => clearTimeout(timer);
    }, [playingIndex, allItems, advance, open]);

    const currentItem = allItems[playingIndex];

    const getPreviewContent = () => {
        if (!currentItem) return null;

        // Handling Program Preview
        if ((currentItem as any).isProgram) {
            return (
                <BaseVideoPlayer
                    key={(currentItem as any).id}
                    src={getUrl((currentItem as any).videoUrl || "") || ""}
                    autoPlay={true}
                    rounded="rounded-none"
                    onEnded={advance}
                />
            );
        }

        // Handling File Preview (Video, Audio, Image)
        const file = currentItem as any;
        if (file.type === "VIDEO") {
            return (
                <BaseVideoPlayer
                    key={file.id}
                    src={getUrl(file.url) || ""}
                    autoPlay={true}
                    rounded="rounded-none"
                    onEnded={advance}
                />
            );
        }

        if (file.type === "AUDIO") {
            return (
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-8 gap-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <audio
                        autoPlay
                        controls
                        src={getUrl(file.url) || ""}
                        onEnded={advance}
                        className="w-full max-w-md"
                    />
                </div>
            );
        }

        return (
            <div className="relative aspect-video">
                <Image
                    src={getUrl(file.url) || "/placeholder.png"}
                    alt={file.originalName || "Preview"}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
        );
    };

    if (!schedule) return null;

    const formatTime = (isoTime: string): string => {
        try {
            const date = new Date(isoTime);
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: date.getUTCMinutes() === 0 ? undefined : "2-digit",
                hour12: true,
                timeZone: "UTC"
            });
        } catch {
            return isoTime;
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    const getRecurrenceLabel = () => {
        if (schedule.recurrenceType === "daily") return "Daily";
        if (schedule.recurrenceType === "weekly") {
            return schedule.daysOfWeek && schedule.daysOfWeek.length > 0
                ? schedule.daysOfWeek.join(", ")
                : "Weekly";
        }
        if (schedule.recurrenceType === "monthly") {
            return schedule.dayOfMonth && schedule.dayOfMonth.length > 0
                ? `Monthly (Day ${schedule.dayOfMonth.join(", ")})`
                : "Monthly";
        }
        return formatDate(schedule.startDate);
    };

    const handleDeleteSchedule = (schedule: Schedule) => {
        setScheduleToDelete(schedule);
        setOpenDelete(true);
    };

    const handleDelete = async () => {
        if (!scheduleToDelete) return;

        try {
            const res = await deleteSchedule(scheduleToDelete.id).unwrap();
            if (res.success) {
                toast.success(res.message || "Schedule deleted successfully");
                setOpen(false);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete schedule");
        } finally {
            setOpenDelete(false);
            setScheduleToDelete(null);
        }
    };

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title={schedule.name}
            description={schedule.description || "View and manage this schedule's live playback settings."}
            maxWidth="xl"
            maxHeight="xl"

            className="bg-navbarBg"
        >
            <div className="flex flex-col gap-6 py-2">
                {/* Professional Media Preview Section wrapper */}
                <div className="w-full rounded-2xl bg-bgGray dark:bg-gray-800 border border-border flex flex-col shadow-sm aspect-video bg-black overflow-hidden relative">
                    <div className="w-full h-full flex flex-col overflow-hidden">
                        {/* TOP TICKER */}
                        {activeSchedule?.lowerThird && activeSchedule.lowerThird.text && activeSchedule.lowerThird.position === "Top" && (
                            <div
                                className="py-2.5 overflow-hidden shrink-0"
                                style={{
                                    backgroundColor: `${activeSchedule.lowerThird.backgroundColor}${Math.round(
                                        parseInt(activeSchedule.lowerThird.backgroundOpacity || "80") * 2.55
                                    ).toString(16).padStart(2, '0')}`
                                }}
                            >
                                <Marquee
                                    speed={activeSchedule.lowerThird.speed || 40}
                                    direction={activeSchedule.lowerThird.animation === "Left_to_Light" ? "left" : "right"}
                                    gradient={false}
                                    loop={activeSchedule.lowerThird.loop ? 0 : 1}
                                >
                                    <p
                                        className="font-semibold px-4"
                                        style={{
                                            color: activeSchedule.lowerThird.textColor,
                                            fontSize: activeSchedule.lowerThird.fontSize === "Small" ? "14px" :
                                                activeSchedule.lowerThird.fontSize === "Medium" ? "16px" : "20px",
                                            fontFamily: activeSchedule.lowerThird.font || "inherit",
                                        }}
                                    >
                                        {activeSchedule.lowerThird.text}
                                    </p>
                                </Marquee>
                            </div>
                        )}

                        {/* MEDIA CONTAINER (Fills available space) */}
                        <div className={`relative flex-1 overflow-hidden ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>
                            {getPreviewContent() || (
                                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                    <span className="text-gray-500">No preview available</span>
                                </div>
                            )}
                        </div>

                        {/* BOTTOM / MIDDLE TICKER */}
                        {activeSchedule?.lowerThird && activeSchedule.lowerThird.text && activeSchedule.lowerThird.position !== "Top" && (
                            <div
                                className="py-2.5 overflow-hidden shrink-0"
                                style={{
                                    backgroundColor: `${activeSchedule.lowerThird.backgroundColor}${Math.round(
                                        parseInt(activeSchedule.lowerThird.backgroundOpacity || "80") * 2.55
                                    ).toString(16).padStart(2, '0')}`
                                }}
                            >
                                <Marquee
                                    speed={activeSchedule.lowerThird.speed || 40}
                                    direction={activeSchedule.lowerThird.animation === "Left_to_Light" ? "left" : "right"}
                                    gradient={false}
                                    loop={activeSchedule.lowerThird.loop ? 0 : 1}
                                >
                                    <p
                                        className="font-semibold px-4"
                                        style={{
                                            color: activeSchedule.lowerThird.textColor,
                                            fontSize: activeSchedule.lowerThird.fontSize === "Small" ? "14px" :
                                                activeSchedule.lowerThird.fontSize === "Medium" ? "16px" : "20px",
                                            fontFamily: activeSchedule.lowerThird.font || "inherit",
                                        }}
                                    >
                                        {activeSchedule.lowerThird.text}
                                    </p>
                                </Marquee>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Row 1: Content and Time Range */}
                <div className="flex items-center justify-between gap-4 text-sm text-muted">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted" />
                        <span className="font-medium truncate max-w-[200px] sm:max-w-xs capitalize text-headings">
                            {currentItem ? (
                                (currentItem as any).isFile
                                    ? `file: ${(currentItem as any).originalName}`
                                    : `program: ${(currentItem as any).name}`
                            ) : "No content assigned"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted" />
                        <span className="font-medium">
                            {getRecurrenceLabel()} • {formatTime(activeSchedule?.startTime || "")} – {formatTime(activeSchedule?.endTime || "")}
                        </span>
                    </div>
                </div>

                {/* Metadata Row 2: Date Range */}
                <div className="flex items-center justify-between gap-4 text-sm text-muted pt-2 border-t border-border/50 mt-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted" />
                        <span className="font-medium">
                            Duration: {formatDate(activeSchedule?.startDate || "")} – {formatDate(activeSchedule?.endDate || "")}
                        </span>
                    </div>
                </div>

                {/* Footer Logic: Horizontal Split with Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-2">
                    <button
                        className="flex items-center gap-2 py-3 px-8 bg-bgBlue hover:bg-blue-600 text-white font-bold transition-all shadow-customShadow rounded-lg cursor-pointer text-sm sm:text-base"
                        onClick={() => {
                            if (activeSchedule) onEdit?.(activeSchedule.id);
                            setOpen(false);
                        }}
                    >
                        <PencilLine className="w-4 h-4" />
                        Update
                    </button>
                    <button
                        onClick={() => activeSchedule && handleDeleteSchedule(activeSchedule)}
                        className="flex items-center gap-2 py-3 px-8 bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-customShadow rounded-lg cursor-pointer text-sm sm:text-base"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={openDelete}
                onClose={() => {
                    setOpenDelete(false);
                    setScheduleToDelete(null);
                }}
                onConfirm={handleDelete}
                title="Delete Schedule"
                description="Are you sure you want to delete this schedule? This action cannot be undone."
                itemName={activeSchedule?.name}
            />
        </BaseDialog>
    );
};

export default SchedulePreviewDialog;
