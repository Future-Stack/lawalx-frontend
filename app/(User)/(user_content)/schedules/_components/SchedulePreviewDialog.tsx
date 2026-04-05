"use client";

import React from "react";
import { Clock, FileText, Calendar, Trash2, PencilLine } from "lucide-react";
import BaseDialog from "@/common/BaseDialog";
import { Schedule } from "@/redux/api/users/schedules/schedules.type";
import Image from "next/image";
import { getUrl } from "@/lib/content-utils";
import { useDeleteScheduleMutation, useUpdateScheduleMutation } from "@/redux/api/users/schedules/schedules.api";
import { toast } from "sonner";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";


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
    if (!schedule) return null;

    const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
    const [deleteSchedule] = useDeleteScheduleMutation();

    const handlePause = async () => {
        try {
            const newStatus = schedule.status === "paused" ? "playing" : "paused";
            const res = await updateSchedule({
                id: schedule.id,
                data: { status: newStatus }
            }).unwrap();

            if (res.success) {
                toast.success(res.message || `Schedule ${newStatus} successfully`);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update schedule status");
        }
    };

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

    const [openDelete, setOpenDelete] = React.useState(false);
    const [scheduleToDelete, setScheduleToDelete] = React.useState<Schedule | null>(null);

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
            description={schedule.description || "Play welcome content during morning hours"}
            maxWidth="xl"
            className="bg-navbarBg"
        >
            <div className="flex flex-col gap-6 py-2">
                {/* Media Preview Section */}
                <div className="relative w-full rounded-2xl overflow-hidden bg-bgGray dark:bg-gray-800 border border-border group shadow-sm">
                    {schedule.file?.type === "VIDEO" ? (
                        <BaseVideoPlayer
                            src={getUrl(schedule.file.url) || ""}
                            autoPlay={false}
                            rounded="rounded-none"
                        />
                    ) : (
                        <div className="relative aspect-video">
                            <Image
                                src={getUrl(schedule.file?.url) || "/placeholder.png"}
                                alt={schedule.file?.originalName || "Preview"}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            {/* Play Button Overlay (from image design) */}
                            {/* <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-11 h-11 bg-bgBlue rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer">
                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                </div>
                            </div> */}
                        </div>
                    )}
                </div>

                {/* Metadata Row 1: Content and Time Range */}
                <div className="flex items-center justify-between gap-4 text-sm text-muted">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted" />
                        <span className="font-medium truncate max-w-[200px] sm:max-w-xs capitalize">
                            {schedule.file?.type?.toLowerCase() || "video"}: {schedule.file?.originalName}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted" />
                        <span className="font-medium">
                            {getRecurrenceLabel()} • {formatTime(schedule.startTime)} – {formatTime(schedule.endTime)}
                        </span>
                    </div>
                </div>

                {/* Metadata Row 2: Date Range (New) */}
                <div className="flex items-center justify-between gap-4 text-sm text-muted pt-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted" />
                        <span className="font-medium">
                            Duration: {formatDate(schedule.startDate)} – {formatDate(schedule.endDate)}
                        </span>
                    </div>
                </div>

                {/* Footer Logic: Horizontal Split with Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-2">
                    {/* <button
                        className="flex items-center gap-2 h-11 px-6 border-border font-bold hover:bg-bgGray transition-all disabled:opacity-50 shadow-customShadow rounded-xl"
                        onClick={handlePause}
                        disabled={isUpdating}
                    >
                        {schedule.status === "paused" ? (
                            <Play className="w-4 h-4" />
                        ) : (
                            <Pause className="w-4 h-4" />
                        )}
                        {isUpdating ? "Processing..." : (schedule.status === "paused" ? "play" : "pasue")}
                    </button> */}
                    <button
                        className="flex items-center gap-2 py-3 px-8 bg-bgBlue hover:bg-blue-600 text-white font-bold transition-all shadow-customShadow rounded-lg cursor-pointer"
                        onClick={() => {
                            onEdit?.(schedule.id);
                            setOpen(false);
                        }}
                    >
                        <PencilLine className="w-4 h-4" />
                        Update
                    </button>
                    <button
                        onClick={() => handleDeleteSchedule(schedule)}
                        className="flex items-center gap-2 py-3 px-8 bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-customShadow rounded-lg cursor-pointer"
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
                itemName={scheduleToDelete?.name}
            />
        </BaseDialog>
    );
};

export default SchedulePreviewDialog;
