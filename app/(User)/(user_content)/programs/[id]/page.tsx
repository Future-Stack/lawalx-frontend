/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  FileText,
  ListTree,
  Tv,
  Settings,
  ChevronDown,
  ChevronUp,
  Monitor,
  WifiOff,
  Music,
  PlayCircle,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import ContentTimeline from "../components/screenComponent/ContentTimeline";
import ScreenSettings from "../components/screenComponent/ScreenSettings";
import MapLocation from "../components/screenComponent/MapLocation";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import Breadcrumb from "@/common/BreadCrumb";
import ResolvedLocation from "@/common/ResolvedLocation";
import { useGetSingleProgramDataQuery, useUpdateSingleProgramMutation } from "@/redux/api/users/programs/programs.api";
import { toast } from "sonner";
import { Device, Timeline } from "@/redux/api/users/programs/programs.type";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Loader2 } from "lucide-react";

dayjs.extend(relativeTime);

const ScreenCardDetails = () => {
  const { id } = useParams();
  const { data: programResponse, isLoading } = useGetSingleProgramDataQuery({ id: String(id) });
  const [updateProgram, { isLoading: isUpdating }] = useUpdateSingleProgramMutation();
  const program = programResponse?.data;
  console.log("update program", program);

  const [activeTab, setActiveTab] = useState<"timeline" | "settings">(
    "timeline"
  );
  const [playingIndex, setPlayingIndex] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [localTimeline, setLocalTimeline] = useState<Timeline[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // Lifted state for ScreenSettings
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [localDevices, setLocalDevices] = useState<Device[]>([]);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isDevicesExpanded, setIsDevicesExpanded] = useState(false);

  // Playback Control & Timer State
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [lastTimerTick, setLastTimerTick] = useState(0);

  // Audio Controls
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (program) {
      if (program.timeline) {
        // Map durations from metaData if available to ensure persistence on reload
        const savedDurations = program.metaData?.durations || [];
        const syncedTimeline = program.timeline.map((item, index) => {
          const savedDuration = savedDurations[index]?.duration;
          return savedDuration !== undefined
            ? { ...item, duration: savedDuration }
            : item;
        });
        setLocalTimeline(syncedTimeline);
      }
      if (program.devices) {
        setLocalDevices(program.devices);
      }
      setName(program.name || "");
      setDescription(program.description || "");
    }
  }, [program]);

  // Stable callback — must be declared before any early returns (Rules of Hooks)
  // Won't change on unrelated re-renders, preventing Plyr from re-initializing
  const advance = useCallback(() => {
    if (localTimeline.length <= 1) return;
    setIsFading(true);
    // Reset remaining time for the next item
    setRemainingTime(0);
    setTimeout(() => {
      setPlayingIndex((prev) => (prev + 1) % localTimeline.length);
      setIsAutoPlay(true);
      setIsFading(false);
      setIsPaused(false); // Auto-resume on advance
    }, 500);
  }, [localTimeline.length]);

  // Handle video completion
  const handleVideoEnded = useCallback(() => {
    advance();
  }, [advance]);

  // Handle timing for all items (Images, Videos, and Audio)
  useEffect(() => {
    if (!localTimeline || localTimeline.length <= 1) return;
    const currentItem = localTimeline[playingIndex];
    if (!currentItem) return;

    // Initialize remaining time if it's 0 (start of new item)
    if (remainingTime <= 0) {
      const duration = (currentItem.duration || 7) * 1000;
      setRemainingTime(duration);
      setLastTimerTick(Date.now());
      return;
    }

    // If paused, don't start the timeout
    if (isPaused) return;

    // Record the current tick time
    setLastTimerTick(Date.now());

    // Set the timer for the remaining time
    const timer = setTimeout(() => {
      advance();
    }, remainingTime);

    return () => {
      clearTimeout(timer);
      // When the component re-renders or pauses, calculate how much time passed
      const timePassed = Date.now() - lastTimerTick;
      setRemainingTime(prev => Math.max(0, prev - timePassed));
    };
  }, [playingIndex, localTimeline, advance, isPaused, remainingTime === 0]);

  // Sync Audio Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume, playingIndex]);

  if (!hasMounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Initializing...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p>Loading program details...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <p>Program not found.</p>
      </div>
    );
  }

  const videos = localTimeline.filter((t) => t.file?.type === "VIDEO")?.length || 0;
  const images = localTimeline.filter((t) => t.file?.type === "IMAGE" || t.file?.type === "CONTENT")?.length || 0;

  const getFileUrl = (url: string) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/api\/v1\/?$/, "");
    return `${baseUrl}/${url.startsWith("/") ? url.slice(1) : url}`;
  };

  const selectedContent = localTimeline?.[playingIndex];
  const previewUrl = getFileUrl(selectedContent?.file?.url || "");
  const currentFileName = selectedContent?.file?.originalName || program.name;
  const lastUpdated = dayjs(program.updated_at).fromNow();
  const isActive = program.status?.toUpperCase() === "PUBLISH";
  const assignedContent = `${videos} videos, ${images} content`;

  const handleSave = async () => {
    try {
      const content_ids = localTimeline.map((item) => item.fileId);
      const device_ids = localDevices.map((d) => d.id);
      const schedule_ids = program.schedules?.map((s) => s.id) || [];

      // Construct metaData with duration mapping for the timeline
      const metaData = {
        durations: localTimeline.map((item) => ({
          fileId: item.fileId,
          duration: item.duration,
        })),
      };

      const res = await updateProgram({
        id: String(id),
        data: {
          name,
          description,
          content_ids,
          device_ids,
          metaData,
          serene_size: program.serene_size || "1920x1080",
          status: (program.status.toUpperCase() as any) || "DRAFT",
        },
      }).unwrap();
      toast.success(res.message || "Program updated successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save changes");
    }
  };

  const handleAppendExisting = (newFiles: any[]) => {
    // Logic to append files to localTimeline
    setIsAddExistingOpen(false);
  };

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Programs", href: "/programs" },
            { label: program.name },
          ]}
        />
      </div>
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="sm:items-start justify-between mb-6 sm:mb-8 gap-6 md:gap-10 border border-t-0 border-r-0 border-l-0 border-border pb-6 md:pb-8 rounded-t-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h1 className="text-lg sm:text-2xl md:text-[30px] font-semibold text-headings">
              {program.name}
            </h1>

            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-bgBlue hover:bg-blue-500 text-white px-6 py-2.5 md:px-8 md:py-3.5 rounded-lg text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out shadow-customShadow whitespace-nowrap shrink-0 sm:mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
          <p className="text-sm sm:text-base text-muted mt-2 md:mt-6 leading-relaxed">
            {program.description}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-navbarBg rounded-full border border-border p-1 mb-6 inline-flex overflow-x-auto w-fit">
          {(["timeline", "settings"] as const).map((tab) => {
            const isActiveTab = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm sm:text-base rounded-full gap-2 font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${isActiveTab
                  ? "bg-blue-50 dark:bg-blue-900/20 shadow-customShadow"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
              >
                <span
                  className={`flex items-center gap-2 ${isActiveTab ? "text-bgBlue" : "text-muted hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  {tab === "timeline" && <ListTree className="w-4 h-4" />}
                  {tab === "settings" && <Settings className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            );
          })}
        </div>
        {/* Main layout */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          {/* Left side - Sticky */}
          <div className="flex-1 w-full md:sticky md:top-6 md:max-h-[calc(100vh-80px)] md:overflow-y-auto scrollbar-hide">
            {activeTab === "timeline" && (
              <ContentTimeline
                timeline={localTimeline}
                programId={String(id)}
                programName={program.name}
                selectedId={localTimeline?.[playingIndex]?.id}
                onSelect={(_, index) => {
                  setPlayingIndex(index);
                  setIsAutoPlay(true);
                }}
                onChange={(newTimeline) => {
                  const currentId = localTimeline[playingIndex]?.id;
                  setLocalTimeline(newTimeline);
                  if (currentId) {
                    const newIndex = newTimeline.findIndex(item => item.id === currentId);
                    if (newIndex !== -1) {
                      setPlayingIndex(newIndex);
                    }
                  }
                }}
              />
            )}
            {activeTab === "settings" && (
              <ScreenSettings
                program={program}
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                localDevices={localDevices}
                setLocalDevices={setLocalDevices}
                openAddDevice={() => setIsAddDeviceModalOpen(true)}
              />
            )}
          </div>

          {/* Right side */}
          <div className="w-full md:w-[55%] space-y-6">
            {/* Preview Section */}
            <div className="border border-border p-4 sm:p-6 rounded-xl bg-navbarBg space-y-4 sm:space-y-6 shadow-lg transition-shadow hover:shadow-xl overflow-hidden mb-6">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-black">
                <div className={`w-full h-full ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>
                  {selectedContent?.file?.type === "VIDEO" ? (
                    <div className="w-full h-full">
                      <BaseVideoPlayer
                        key={previewUrl}
                        src={previewUrl || ""}
                        poster={undefined}
                        autoPlay={true}
                        fillParent={true}
                        rounded="rounded-lg"
                        onEnded={handleVideoEnded}
                        onPlay={() => setIsPaused(false)}
                        onPause={() => setIsPaused(true)}
                      />
                    </div>
                  ) : selectedContent?.file?.type === "AUDIO" ? (
                    <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-black overflow-hidden flex flex-col items-center justify-center p-8 text-center border border-white/10">
                      {/* Audio Playback Component */}
                      <audio
                        ref={audioRef}
                        key={previewUrl}
                        src={previewUrl}
                        autoPlay={!isPaused}
                        onPlay={() => setIsPaused(false)}
                        onPause={() => setIsPaused(true)}
                        onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                        onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                        hidden
                      />

                      {/* Audio Visualizer Decoration */}
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-bgBlue rounded-full blur-[100px]" />
                      </div>

                      <div className="relative z-10 w-24 h-24 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                        <Music className="w-12 h-12 text-bgBlue animate-pulse" />
                      </div>

                      <div className="relative z-10 space-y-2 mb-16">
                        <h4 className="text-white font-bold text-xl md:text-2xl tracking-tight line-clamp-1">{currentFileName}</h4>
                        <div className="flex items-center justify-center gap-2 text-blue-400/80 font-medium text-sm">
                          <PlayCircle className="w-4 h-4" />
                          <span>Now Playing Audio Content</span>
                        </div>
                      </div>

                      {/* Unified Audio Controls Bar - Perfectly Aligned Horizontal Layout */}
                      <div className="absolute bottom-6 left-5 right-5 z-20 flex items-center gap-3.5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Play/Pause Button */}
                        <button
                          onClick={() => {
                            if (audioRef.current) {
                              if (!isPaused) audioRef.current.pause();
                              else audioRef.current.play();
                            }
                          }}
                          className="flex-shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all outline-none cursor-pointer"
                          title={!isPaused ? "Pause" : "Play"}
                        >
                          {!isPaused ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>

                        {/* Current Time */}
                        <span className="text-[10px] text-white/40 font-medium min-w-[32px] tabular-nums text-center">
                          {formatTime(audioCurrentTime)}
                        </span>

                        {/* Progress Bar Section */}
                        <div className="flex-1 flex items-center min-w-0">
                          <div
                            className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer group relative"
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
                            >
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                            </div>
                          </div>
                        </div>

                        {/* Total Time */}
                        <span className="text-[10px] text-white/40 font-medium min-w-[32px] tabular-nums text-center">
                          {formatTime(audioDuration)}
                        </span>

                        {/* Volume Control Section */}
                        <div className="flex-shrink-0 flex items-center gap-2.5 w-28 border-l border-white/10 pl-3.5 ml-1">
                          <button
                            onClick={() => setAudioVolume(audioVolume === 0 ? 1 : 0)}
                            className="text-white/60 hover:text-white transition-colors"
                          >
                            {audioVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={audioVolume}
                            onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                            className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-bgBlue hover:accent-blue-400 transition-all duration-300"
                            style={{
                              background: `linear-gradient(to right, #006AFF ${audioVolume * 100}%, rgba(255, 255, 255, 0.2) ${audioVolume * 100}%)`
                            }}
                            title="Volume Control"
                          />
                        </div>
                      </div>

                      {/* Animated Audio Bars */}
                      <div className="absolute bottom-20 flex items-end gap-1.5 h-12 pointer-events-none">
                        {[0.6, 0.8, 1, 0.7, 0.9, 0.5, 0.8].map((scale, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-bgBlue/60 rounded-full animate-audio-bar"
                            style={{
                              height: '100%',
                              animationDelay: `${i * 0.15}s`,
                              animationDuration: `${0.8 + Math.random()}s`,
                              transform: `scaleY(${scale})`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full rounded-lg bg-black overflow-hidden flex items-center justify-center">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={currentFileName}
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted">
                          No preview available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
                <h3 className="text-xl md:text-2xl font-semibold text-headings line-clamp-1 truncate">
                  {currentFileName}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-muted mt-2">
                Playing: {program.description}
              </p>
            </div>

            {/* Overview */}
            <div className="rounded-xl border border-border p-4 sm:p-6 bg-navbarBg">
              <h3 className="text-xl md:text-2xl font-semibold text-headings mb-3 sm:mb-4">
                Overview
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {/* Content */}
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
                    <FileText className="w-5 h-5 text-body" />
                    <span className="text-sm sm:text-base text-body truncate">
                      Content
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-medium text-body text-right w-[40%] truncate">
                    {assignedContent}
                  </div>
                </div>

                {/* Total Devices */}
                <div className="py-2 border-b border-borderGray">
                  <div
                    className="flex justify-between items-center cursor-pointer group"
                    onClick={() => setIsDevicesExpanded(!isDevicesExpanded)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
                      <Tv className="w-5 h-5 text-body group-hover:text-bgBlue transition-colors" />
                      <span className="text-sm sm:text-base text-body truncate font-medium">
                        Total Devices
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="text-sm sm:text-base font-semibold text-headings">
                        {program.devices?.length || 0}
                      </span>
                      {isDevicesExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Devices List */}
                  {isDevicesExpanded && program.devices && program.devices.length > 0 && (
                    <div className="mt-4 space-y-2 pl-8 sm:pl-9 animate-in slide-in-from-top-2 duration-300">
                      {program.devices.map((device, idx) => (
                        <div
                          key={device.id}
                          className="flex items-center justify-between text-sm text-muted py-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md px-3"
                        >
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-5 h-5 text-bgBlue shrink-0" />
                              <span className="truncate font-medium text-headings text-base tracking-tight">{device.name || "Unnamed Device"}</span>
                            </div>
                            {device.location && (
                              <div className="flex items-center gap-1.5 pl-7 text-[12px] text-muted font-medium">
                                <ResolvedLocation
                                  lat={device.location.lat}
                                  lng={device.location.lng}
                                  className="truncate"
                                />
                              </div>
                            )}
                          </div>

                          {/* Actionable Status Badge */}
                          <div className="shrink-0">
                            {device.status === "ONLINE" ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                                Online
                              </div>
                            ) : device.status === "OFFLINE" ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[10px] font-bold">
                                <WifiOff className="w-3 h-3" />
                                Offline
                              </div>
                            ) : device.status === "PAIRED" ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Paired
                              </div>
                            ) : device.status === "WAITING" ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Waiting
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373] text-[10px] font-bold">
                                {device.status}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolution */}
                <div className="flex justify-between items-center py-2 border-b border-borderGray">
                  <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
                    <ListTree className="w-5 h-5 text-body" />
                    <span className="text-sm sm:text-base text-body truncate">
                      Resolution
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-medium text-body text-right w-[40%] truncate">
                    {program.serene_size || "1920x1080"}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
                    <Clock className="w-5 h-5 text-body" />
                    <span className="text-sm sm:text-base text-body truncate">
                      Last Updated
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-medium text-body text-right w-[40%] truncate">
                    {lastUpdated}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="rounded-xl border border-border p-4 sm:p-6 bg-navbarBg">
              <MapLocation devices={program.devices} />
            </div>
          </div>
        </div>
      </div>
      <AddDeviceModal
        isOpen={isAddDeviceModalOpen}
        onClose={() => setIsAddDeviceModalOpen(false)}
        programId={String(id)}
      />
    </div>
  );
};

export default ScreenCardDetails;
