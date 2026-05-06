/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef } from "react";
import ContentTimeline from "../components/screenComponent/ContentTimeline";
import ScreenSettings from "../components/screenComponent/ScreenSettings";
import MapLocation from "../components/screenComponent/MapLocation";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import Breadcrumb from "@/common/BreadCrumb";
import { useGetSingleProgramDataQuery, useUpdateSingleProgramMutation } from "@/redux/api/users/programs/programs.api";
import { toast } from "sonner";
import { Device, Timeline, WorkoutStatus } from "@/redux/api/users/programs/programs.type";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// New Component Imports
import ProgramHeader from "./_components/ProgramDetails/ProgramHeader";
import ProgramTabs from "./_components/ProgramDetails/ProgramTabs";
import ProgramPreview from "./_components/ProgramDetails/ProgramPreview";
import ProgramOverview from "./_components/ProgramDetails/ProgramOverview";

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
  const [playbackVersion, setPlaybackVersion] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [localTimeline, setLocalTimeline] = useState<Timeline[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  // Lifted state for ScreenSettings
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [localDevices, setLocalDevices] = useState<Device[]>([]);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isDevicesExpanded, setIsDevicesExpanded] = useState(false);

  // Playback Control & Timer State
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [localActive, setLocalActive] = useState(false);

  // Audio Controls
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
    // Restore volume from localStorage (sync with Video player)
    const savedVolume = localStorage.getItem("plyr_volume");
    if (savedVolume !== null) {
      const vol = parseFloat(savedVolume);
      if (!isNaN(vol)) setAudioVolume(vol);
    }
  }, []);

  // Persist volume to localStorage whenever it changes
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("plyr_volume", String(audioVolume));
    }
  }, [audioVolume, hasMounted]);

  useEffect(() => {
    if (program) {
      if (program.timeline) {
        // Map durations from metaData if available to ensure persistence on reload
        const savedDurations = program.metaData || {};
        const syncedTimeline = program.timeline.map((item) => {
          const savedDuration = savedDurations[item.fileId];
          return savedDuration !== undefined
            ? { ...item, duration: Number(savedDuration) }
            : item;
        });
        setLocalTimeline(syncedTimeline);
      }
      if (program.devices) {
        setLocalDevices(program.devices);
      }
      setName(program.name || "");
      setDescription(program.description || "");
      setLocalActive(program.status?.toUpperCase() === "PUBLISH");
    }
  }, [program]);

  useEffect(() => {
    if (!localActive) {
      setIsPaused(true);
      audioRef.current?.pause();
    } else {
      setIsPaused(false);
      audioRef.current?.play().catch(() => { });
    }
  }, [localActive]);

  // Stable callback — must be declared before any early returns (Rules of Hooks)
  // Won't change on unrelated re-renders, preventing Plyr from re-initializing
  const advance = useCallback(() => {
    setIsFading(true);
    setIsPaused(true); // Pause timer during transition
    // Reset remaining time for the next item
    setRemainingTime(0);
    remainingTimeRef.current = 0;
    setTimeout(() => {
      setPlayingIndex((prev) => (prev + 1) % localTimeline.length);
      setPlaybackVersion((prev) => prev + 1);
      setIsFading(false);
      setIsPaused(false); // Ensure timer resumes on advance
    }, 500);
  }, [localTimeline]);

  // Handle media completion (Video & Audio)
  const handleMediaEnded = useCallback(() => {
    advance();
  }, [advance]);

  // Use refs to track values for the timer without triggering re-render loops
  const isPausedRef = useRef(isPaused);
  const remainingTimeRef = useRef(remainingTime);

  // Sync refs with state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    remainingTimeRef.current = remainingTime;
  }, [remainingTime]);

  // Handle timing for all items (Images, Videos, and Audio)
  useEffect(() => {
    // If program is off, or fading, or no timeline, do nothing
    if (!localTimeline || localTimeline.length < 1 || isPaused || isFading) return;

    const currentItem = localTimeline[playingIndex];
    if (!currentItem) return;

    // Determine how long to wait using the ref to avoid dependency loops
    let timeToWait = remainingTimeRef.current;
    if (timeToWait <= 0) {
      timeToWait = (currentItem.duration || 7) * 1000;
      setRemainingTime(timeToWait);
      return;
    }

    const start = Date.now();
    const timer = setTimeout(() => {
      advance();
    }, timeToWait);

    return () => {
      clearTimeout(timer);
      const passed = Date.now() - start;
      const newRemaining = Math.max(0, remainingTimeRef.current - passed);
      remainingTimeRef.current = newRemaining;

      // Only sync to state if we are pausing, to avoid recursive re-render loops
      if (isPausedRef.current) {
        setRemainingTime(newRemaining);
      }
    };
  }, [playingIndex, localTimeline, advance, isPaused, isFading, remainingTime]);

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
  const audios = localTimeline.filter((t) => t.file?.type === "AUDIO")?.length || 0;

  const getFileUrl = (url: string) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/api\/v1\/?$/, "");
    return `${baseUrl}/${url.startsWith("/") ? url.slice(1) : url}`;
  };

  const selectedContent = localTimeline?.[playingIndex];
  const previewUrl = getFileUrl(selectedContent?.file?.url || "");
  const lastUpdated = dayjs(program.updated_at).fromNow();

  const contentParts = [];
  if (videos > 0) contentParts.push(`${videos} video${videos !== 1 ? 's' : ''}`);
  if (audios > 0) contentParts.push(`${audios} audio`);
  if (images > 0) contentParts.push(`${images} image${images !== 1 ? 's' : ''}`);
  const assignedContent = contentParts.length > 0 ? contentParts.join(", ") : "No media assigned";

  const handleSave = async () => {
    try {
      const content_ids = localTimeline.map((item) => item.fileId);
      const device_ids = localDevices.map((d) => d.id);

      // Construct metaData with content ID as key and duration as value
      const metaData: Record<string, string> = {};
      localTimeline.forEach((item) => {
        if (item.fileId) {
          metaData[item.fileId] = String(item.duration);
        }
      });

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


  const handlePowerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;

    const nextState = !localActive;
    const targetStatus = nextState ? WorkoutStatus.PUBLISH : WorkoutStatus.DRAFT;

    console.log("Power button clicked. Next status:", targetStatus);

    // Immediate UI feedback
    setLocalActive(nextState);

    // Update server state
    updateProgram({
      id: program.id,
      data: { status: targetStatus }
    }).unwrap()
      .then(() => {
        console.log("Program status updated successfully to:", targetStatus);
      })
      .catch((err) => {
        console.error("Failed to update program status", err);
        // Revert local state on failure
        setLocalActive(!nextState);
      });
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
        <ProgramHeader
          program={program}
          handleSave={handleSave}
          isUpdating={isUpdating}
        />

        <ProgramTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

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
                  setRemainingTime(0);
                  remainingTimeRef.current = 0;
                  setIsPaused(false);
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
            <ProgramPreview
              selectedContent={localTimeline[playingIndex]}
              previewUrl={previewUrl}
              localActive={localActive}
              isFading={isFading}
              handleVideoEnded={handleMediaEnded}
              setIsPaused={setIsPaused}
              isPaused={isPaused}
              audioRef={audioRef}
              audioCurrentTime={audioCurrentTime}
              setAudioCurrentTime={setAudioCurrentTime}
              setAudioDuration={setAudioDuration}
              audioDuration={audioDuration}
              currentFileName={
                (localTimeline[playingIndex]?.file as any)?.title || 
                (localTimeline[playingIndex]?.file as any)?.originalName || 
                "Untitled Content"
              }
              audioVolume={audioVolume}
              setAudioVolume={setAudioVolume}
              formatTime={formatTime}
              handlePowerClick={handlePowerClick}
              isUpdating={isUpdating}
              playbackVersion={playbackVersion}
            />

            <ProgramOverview
              assignedContent={assignedContent}
              isDevicesExpanded={isDevicesExpanded}
              setIsDevicesExpanded={setIsDevicesExpanded}
              program={program}
              lastUpdated={lastUpdated}
            />

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
