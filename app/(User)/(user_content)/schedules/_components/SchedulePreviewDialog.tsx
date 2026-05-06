/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Clock, FileText, Calendar, Trash2, PencilLine, Play, Pause, Music, Volume2, VolumeX, PlayCircle } from "lucide-react";
import BaseDialog from "@/common/BaseDialog";
import { Schedule } from "@/redux/api/users/schedules/schedules.type";
import Image from "next/image";
import { getUrl } from "@/lib/content-utils";
import { useDeleteScheduleMutation, useUpdateScheduleMutation, useGetSingleScheduleDataQuery } from "@/redux/api/users/schedules/schedules.api";
import { toast } from "sonner";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";
import Marquee from "react-fast-marquee";
import { cn } from "@/lib/utils";


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
    const effectiveLowerThird = activeSchedule?.lowerThird || (activeSchedule?.lowerThirds && activeSchedule.lowerThirds.length > 0 ? activeSchedule.lowerThirds[0] : undefined);

    // Play/Pause state (mirrors schedule details page)
    const [localActive, setLocalActive] = React.useState(true);

    // Sync localActive from API data - We default to TRUE for the preview experience
    React.useEffect(() => {
        if (activeSchedule) {
            const status = activeSchedule.status?.toLowerCase();
            // If the schedule is already marked as playing/publish, ensure we are in sync.
            // Otherwise, we keep our default 'true' so the preview autoplays regardless of current DB status.
            if (status === "playing" || status === "publish") {
                setLocalActive(true);
            }
        }
    }, [activeSchedule?.id]); // Only sync once on mount or schedule swap

    const handlePowerClick = async () => {
        if (!activeSchedule) return;
        const nextActive = !localActive;
        setLocalActive(nextActive);
        try {
            await updateSchedule({
                id: activeSchedule.id,
                data: { status: nextActive ? "playing" : "stopped" },
            }).unwrap();
        } catch (err: any) {
            setLocalActive(!nextActive); // revert on failure
            toast.error(err?.data?.message || err?.error || "Failed to update schedule status");
        }
    };

    // Automation States for Professional Looping Preview
    const [playingIndex, setPlayingIndex] = React.useState(0);
    const [isFading, setIsFading] = React.useState(false);
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [isMediaReady, setIsMediaReady] = React.useState(false);
    const [showSpinner, setShowSpinner] = React.useState(false);

    // Audio states for custom player
    const [audioCurrentTime, setAudioCurrentTime] = React.useState(0);
    const [audioDuration, setAudioDuration] = React.useState(0);
    const [audioVolume, setAudioVolume] = React.useState(1);

    const formatDuration = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Spinner delay logic: Only show spinner if media takes > 600ms to load
    React.useEffect(() => {
        if (!isMediaReady) {
            const timer = setTimeout(() => setShowSpinner(true), 600);
            return () => clearTimeout(timer);
        } else {
            setShowSpinner(false);
        }
    }, [isMediaReady, playingIndex]);

    const allItems = React.useMemo(() => {
        if (!activeSchedule) return [];
        const files = (activeSchedule.files || []).map(f => ({ ...f, isFile: true }));
        const programs = (activeSchedule.programs || []).map(p => ({ ...p, isProgram: true }));
        return [...files, ...programs];
    }, [activeSchedule]);

    const currentItem = allItems[playingIndex];

    // Sync audio playback and volume with localActive
    React.useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = audioVolume;
            if (localActive) {
                audioRef.current.play().catch(() => { });
            } else {
                audioRef.current.pause();
            }
        }
    }, [localActive, currentItem, audioVolume]); // Also trigger when content item changes or volume changes

    // Initial volume load
    React.useEffect(() => {
        if (open) {
            const savedVol = localStorage.getItem("plyr_volume");
            if (savedVol !== null) {
                setAudioVolume(parseFloat(savedVol));
            }
        }
    }, [open]);

    // Volume persistence
    React.useEffect(() => {
        if (open) {
            localStorage.setItem("plyr_volume", String(audioVolume));
        }
    }, [audioVolume, open]);

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

    // Reset index when schedule changes or dialog opens
    React.useEffect(() => {
        if (open) {
            setPlayingIndex(0);
            setIsFading(false);
        }
    }, [open, schedule?.id]);

    const getPreviewContent = () => {
        if (!currentItem) return null;

        // Handling Program Preview
        if ((currentItem as any).isProgram) {
            return (
                <BaseVideoPlayer
                    key={(currentItem as any).id}
                    src={getUrl((currentItem as any).videoUrl || "") || ""}
                    autoPlay={localActive}
                    rounded="rounded-none"
                    onEnded={advance}
                    fillParent={true}
                    onReady={() => setIsMediaReady(true)}
                    className={effectiveLowerThird?.text && effectiveLowerThird.position !== "Top" ? "plyr-has-ticker" : ""}
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
                    autoPlay={localActive}
                    rounded="rounded-none"
                    onEnded={advance}
                    fillParent={true}
                    onReady={() => setIsMediaReady(true)}
                    className={effectiveLowerThird?.text && effectiveLowerThird.position !== "Top" ? "plyr-has-ticker" : ""}
                />
            );
        }

        if (file.type === "AUDIO") {
            return (
                <div className="relative w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-white/10">
                    <audio
                        ref={audioRef}
                        key={file.id}
                        src={getUrl(file.url) || ""}
                        autoPlay={localActive}
                        onPlay={() => setLocalActive(true)}
                        onPause={() => setLocalActive(false)}
                        onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                        onLoadedMetadata={(e) => {
                            setAudioDuration(e.currentTarget.duration);
                            setIsMediaReady(true);
                        }}
                        onEnded={advance}
                        hidden
                    />

                    {/* Decorative Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] bg-bgBlue rounded-full blur-[80px]" />
                    </div>

                    {/* Central Icon */}
                    <div className="relative z-10 w-20 h-20 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center mb-4 shadow-2xl">
                        <Music className="w-10 h-10 text-bgBlue animate-pulse" />
                    </div>

                    <div className="relative z-10 space-y-1 mb-12">
                        <h4 className="text-white font-bold text-lg md:text-xl tracking-tight line-clamp-1">
                            {file.originalName || "Audio Content"}
                        </h4>
                        <div className="flex items-center justify-center gap-2 text-blue-400/80 font-medium text-xs">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Now Playing</span>
                        </div>
                    </div>

                    {/* Custom Controls Bar */}
                    <div 
                        className={cn(
                            "absolute left-4 right-4 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500",
                            effectiveLowerThird?.text && effectiveLowerThird.position !== "Top" ? "bottom-16" : "bottom-4"
                        )}
                    >
                        <button
                            onClick={() => {
                                if (audioRef.current) {
                                    if (localActive) audioRef.current.pause();
                                    else audioRef.current.play();
                                }
                                setLocalActive(!localActive);
                            }}
                            className="flex-shrink-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all outline-none cursor-pointer"
                        >
                            {localActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>

                        <span className="text-[10px] text-white/40 font-medium min-w-[30px] tabular-nums">
                            {formatDuration(audioCurrentTime)}
                        </span>

                        <div className="flex-1 flex items-center min-w-0">
                            <div
                                className="h-1 w-full bg-white/10 rounded-full cursor-pointer group relative"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    if (audioRef.current) {
                                        audioRef.current.currentTime = percent * audioDuration;
                                    }
                                }}
                            >
                                <div
                                    className="h-full bg-bgBlue rounded-full relative transition-all duration-100"
                                    style={{ width: `${(audioCurrentTime / (audioDuration || 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        <span className="text-[10px] text-white/40 font-medium min-w-[30px] tabular-nums">
                            {formatDuration(audioDuration)}
                        </span>

                        {/* Volume Control */}
                        <div className="flex-shrink-0 flex items-center gap-2 w-24 border-l border-white/10 pl-3 ml-1">
                            <button
                                onClick={() => setAudioVolume(audioVolume === 0 ? 1 : 0)}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                {audioVolume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={audioVolume}
                                onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                                className="w-full h-0.5 rounded-lg appearance-none cursor-pointer accent-bgBlue"
                                style={{
                                    background: `linear-gradient(to right, #006AFF ${audioVolume * 100}%, rgba(255, 255, 255, 0.2) ${audioVolume * 100}%)`
                                }}
                            />
                        </div>
                    </div>
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
                    onLoad={() => setIsMediaReady(true)}
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

    if (!schedule) return null;

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title={schedule?.name}
            description={schedule?.description || "View and manage this schedule's live playback settings."}
            maxWidth="3xl"
            maxHeight="xl"

            className="bg-navbarBg"
        >
            <div className="flex flex-col py-2 gap-4">
                {/* Professional Media Preview Section wrapper */}
                <div className="w-full rounded-2xl bg-bgGray dark:bg-gray-800 shadow-sm aspect-video bg-black overflow-hidden relative group">
                    {/* MEDIA CONTAINER (Fills space, reserves bottom for ticker if needed) */}
                    <div
                        className={cn(
                            "absolute inset-0 z-0 transition-all duration-300",
                            isFading ? "animate-preview-exit" : "animate-preview-enter",
                            effectiveLowerThird?.text && effectiveLowerThird.position !== "Top" ? "pb-12" : ""
                        )}
                    >
                        {getPreviewContent() || (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-500">No preview available</span>
                            </div>
                        )}
                    </div>

                    {/* CENTRAL SPINNER (YouTube Style) - Only for Non-Video/Program items (BaseVideoPlayer handles its own) */}
                    {showSpinner && currentItem && !(currentItem as any).isProgram && (currentItem as any).type !== "VIDEO" && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-bgBlue/20 border-t-bgBlue rounded-full animate-spin" />
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-bgBlue/30 rounded-full animate-pulse" />
                            </div>
                        </div>
                    )}

                    {/* OVERLAY TICKERS */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between z-10">
                        {/* TOP TICKER */}
                        {effectiveLowerThird?.text && effectiveLowerThird.position === "Top" && (
                            <div
                                className="py-2.5 overflow-hidden shrink-0 pointer-events-auto"
                                style={{
                                    backgroundColor: `${effectiveLowerThird.backgroundColor}${Math.round(
                                        parseInt(effectiveLowerThird.backgroundOpacity || "80") * 2.55
                                    ).toString(16).padStart(2, '0')}`
                                }}
                            >
                                <Marquee
                                    speed={effectiveLowerThird.speed || 40}
                                    direction={effectiveLowerThird.animation === "Right_to_Left" ? "left" : "right"}
                                    gradient={false}
                                    loop={effectiveLowerThird.loop ? 0 : 1}
                                >
                                    <p
                                        className="font-semibold px-4"
                                        style={{
                                            color: effectiveLowerThird.textColor,
                                            fontSize: effectiveLowerThird.fontSize === "Small" ? "14px" :
                                                effectiveLowerThird.fontSize === "Medium" ? "16px" : "20px",
                                            fontFamily: effectiveLowerThird.font || "inherit",
                                        }}
                                    >
                                        {effectiveLowerThird.text}
                                    </p>
                                </Marquee>
                            </div>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* BOTTOM / MIDDLE TICKER */}
                        {effectiveLowerThird?.text && effectiveLowerThird.position !== "Top" && (
                            <div
                                className="py-2.5 overflow-hidden shrink-0 pointer-events-auto"
                                style={{
                                    backgroundColor: `${effectiveLowerThird.backgroundColor}${Math.round(
                                        parseInt(effectiveLowerThird.backgroundOpacity || "80") * 2.55
                                    ).toString(16).padStart(2, '0')}`
                                }}
                            >
                                < Marquee
                                    speed={effectiveLowerThird.speed || 40}
                                    direction={effectiveLowerThird.animation === "Right_to_Left" ? "left" : "right"}
                                    gradient={false}
                                    loop={effectiveLowerThird.loop ? 0 : 1}
                                >
                                    <p
                                        className="font-semibold px-4"
                                        style={{
                                            color: effectiveLowerThird.textColor,
                                            fontSize: effectiveLowerThird.fontSize === "Small" ? "14px" :
                                                effectiveLowerThird.fontSize === "Medium" ? "16px" : "20px",
                                            fontFamily: effectiveLowerThird.font || "inherit",
                                        }}
                                    >
                                        {effectiveLowerThird.text}
                                    </p>
                                </Marquee>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Row 1: Content Name and Play/Pause Action */}
                <div className="flex items-center justify-between gap-4 text-sm text-muted py-1">
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

                    {/* Power Button — same as schedule details page */}
                    <button
                        type="button"
                        onClick={handlePowerClick}
                        disabled={isUpdating}
                        aria-label={localActive ? "Stop Schedule" : "Start Schedule"}
                        className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
                                    p-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
                                    ${localActive ? "bg-bgBlue hover:bg-blue-500" : "bg-bgRed hover:bg-red-600"}`}
                        title={localActive ? "Stop Schedule" : "Start Schedule"}
                    >
                        {localActive ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current" />
                        )}
                    </button>
                </div>

                {/* Metadata Row 2: Time Range and Date Range (Duration) */}
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 text-sm text-muted py-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted" />
                        <span className="font-medium">
                            {getRecurrenceLabel()} • {formatTime(activeSchedule?.startTime || "")} – {formatTime(activeSchedule?.endTime || "")}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted" />
                        <span className="font-medium">
                            {formatDate(activeSchedule?.startDate || "")} – {formatDate(activeSchedule?.endDate || "")}
                        </span>
                    </div>
                </div>

                {/* Footer Logic: Horizontal Split with Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
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
