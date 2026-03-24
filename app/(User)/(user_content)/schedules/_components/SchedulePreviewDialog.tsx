"use client";

import React from "react";
import { Play, Pause, Edit2, Clock, FileText, X } from "lucide-react";
import BaseDialog from "@/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { Schedule } from "@/redux/api/users/schedules/schedules.type";
import Image from "next/image";
import { getUrl } from "@/lib/content-utils";
import { useUpdateScheduleMutation } from "@/redux/api/users/schedules/schedules.api";
import { toast } from "sonner";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";

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
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const ampm = hours >= 12 ? "AM" : "PM"; // Matches the logic in SchedulesTable
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
        } catch {
            return isoTime;
        }
    };

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title={schedule.name}
            description={schedule.description || "No description provided"}
            maxWidth="xl"
            className="bg-navbarBg"
        >
            <div className="flex flex-col gap-6 py-2">
                {/* Preview Section */}
                <div className="relative w-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 border border-border group shadow-sm">
                    {schedule.file?.type === "VIDEO" ? (
                        <BaseVideoPlayer
                            src={getUrl(schedule.file.url) || ""}
                            autoPlay={false}
                            rounded="rounded-none"
                        />
                    ) : (
                        <div className="relative aspect-video">
                            <Image
                                src={getUrl(schedule.file?.url) || ""}
                                alt={schedule.file?.originalName || "Preview"}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-border pb-6">
                    <div className="flex items-center gap-2 text-sm text-muted">
                        <FileText className="w-5 h-5" />
                        <span className="truncate max-w-[200px] sm:max-w-xs font-medium">
                            {schedule.file?.type === "VIDEO" ? "Video: " : "Image: "}
                            {schedule.file?.originalName}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">
                            {schedule.daysOfWeek?.join(", ") || "No days"} • {formatTime(schedule.startTime)}
                        </span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 h-11 px-6 border-border text-headings font-semibold hover:bg-bgGray transition-all disabled:opacity-50"
                        onClick={handlePause}
                        disabled={isUpdating}
                    >
                        {schedule.status === "paused" ? (
                            <Play className="w-4 h-4 fill-headings" />
                        ) : (
                            <Pause className="w-4 h-4 fill-headings" />
                        )}
                        {isUpdating ? "Processing..." : (schedule.status === "paused" ? "play" : "pasue")}
                    </Button>
                    <Button
                        className="flex items-center gap-2 h-11 px-8 bg-bgBlue hover:bg-bgBlue/90 text-white font-semibold transition-all shadow-md"
                        onClick={() => {
                            onEdit?.(schedule.id);
                            setOpen(false);
                        }}
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default SchedulePreviewDialog;
