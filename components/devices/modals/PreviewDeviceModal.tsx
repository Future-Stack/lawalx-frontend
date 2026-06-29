/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { X, Volume2, Play, ListTree, Layout, Clock, Monitor, Database, Music, PlayCircle, VolumeX, Pause } from "lucide-react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useGetSingleDeviceDataQuery } from "@/redux/api/users/devices/devices.api";
import DeviceLocation from "@/components/common/DeviceLocation";
import { getUrl } from "@/lib/content-utils";

import { TimelineItem } from "@/redux/api/users/devices/devices.type";
import Image from "next/image";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  device: any | null;
}

export default function PreviewDeviceModal({ isOpen, onClose, device }: Props) {
  const { data: detailData } = useGetSingleDeviceDataQuery(
    { id: device?.id },
    { skip: !isOpen || !device?.id }
  );

  const deviceDetail = useMemo(() => {
    if (!detailData?.data) return null;
    // Handle both array and object responses
    return Array.isArray(detailData.data) ? detailData.data[0] : detailData.data;
  }, [detailData]);
  const videoRef = useRef<any>(null);
  const [volume, setVolume] = useState(75);
  const [brightness] = useState(80);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const formatDuration = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentDevice = useMemo(() => {
    if (!deviceDetail) return device;
    return { ...device, ...deviceDetail };
  }, [deviceDetail, device]);

  const timeline: TimelineItem[] = useMemo(() => {
    return currentDevice?.program?.timeline || [];
  }, [currentDevice]);

  const currentItem = useMemo(() => {
    if (timeline.length === 0) return null;
    return timeline[currentTimelineIndex] || timeline[0];
  }, [timeline, currentTimelineIndex]);

  const mediaUrl = useMemo(() => {
    if (currentItem?.file?.url) {
      return getUrl(currentItem.file.url);
    }
    if (currentDevice?.program?.videoUrl) {
      return getUrl(currentDevice.program.videoUrl);
    }
  }, [currentItem, currentDevice]);

  const nextIndex = (currentTimelineIndex + 1) % (timeline.length || 1);

  // Preload next timeline item for faster transitions
  const nextTimelineItem = timeline.length > 1 ? timeline[nextIndex] : null;
  const nextMediaUrl = useMemo(() => {
    if (nextTimelineItem?.file?.url) return getUrl(nextTimelineItem.file.url);
    return null;
  }, [nextTimelineItem]);

  const handleNext = useCallback(() => {
    if (timeline.length > 0) {
      setCurrentTimelineIndex(nextIndex);
      setCurrentTime(0);
    }
  }, [timeline.length, nextIndex]);

  // Image/Audio Timer logic
  useEffect(() => {
    if (!isOpen || !isPlaying || !currentItem) return;

    // Only set timer for images. Video and Audio are handled by media events.
    if (currentItem?.file?.type === 'IMAGE') {
      const itemDuration = (currentItem.duration || currentItem.file?.duration || 5) * 1000;
      const timer = setTimeout(() => {
        handleNext();
      }, itemDuration);

      // Update progress for images
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setCurrentTime(elapsed / 1000);
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [currentItem, isPlaying, isOpen, handleNext]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
  };

  const handleTimeUpdate = () => {
    updateProgress();
  };

  const handleEnded = () => {
    handleNext();
  };

  // Brightness is applied via CSS filter on the media container
  const mediaFilter = useMemo(() => ({
    filter: `brightness(${brightness}%)`
  }), [brightness]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }
  }, [mediaUrl, currentItem]);

  // Handle Audio Playback based on isPlaying state
  useEffect(() => {
    if (videoRef.current && currentItem?.file?.type === 'AUDIO') {
      if (isPlaying) {
        videoRef.current.play().catch((err: any) => console.error("Playback failed", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, mediaUrl, currentItem]);

  const parseStorage = (storage: any, usedStorage?: number) => {
    if (usedStorage !== undefined) {
      const totalGB = typeof storage === 'number' ? storage : 10; // Fallback to 10GB
      const usedGB = Math.abs(usedStorage); // Math.abs to handle the negative values in sample JSON
      return {
        used: usedGB,
        total: totalGB,
        formatted: `${usedGB.toFixed(2)} GB / ${totalGB.toFixed(0)} GB`,
        percent: totalGB > 0 ? (usedGB / totalGB) * 100 : 0
      };
    }

    if (!storage) return { used: 0, total: 10, formatted: "N/A", percent: 0 };

    // If it's already a formatted string (e.g. from table data)
    const match = String(storage).match(/([\d.]+)?\s*(?:GB)?\s*\/\s*([\d.]+)\s*GB/);
    if (match) {
      const used = match[1] ? parseFloat(match[1]) : 0;
      const total = parseFloat(match[2]);
      return {
        used,
        total,
        formatted: `${used.toFixed(1)} GB / ${total.toFixed(1)} GB`,
        percent: total > 0 ? (used / total) * 100 : 0
      };
    }

    return { used: 0, total: 10, formatted: "N/A", percent: 0 };
  };

  const storageInfo = useMemo(() => {
    return parseStorage(
      currentDevice?.user?.totalStorage || currentDevice?.totalStorage,
      currentDevice?.totalUsedStorage || currentDevice?.user?.usedStorage
    );
  }, [currentDevice]);

  if (!isOpen || !device || !currentDevice) return null;

  const storagePercent = storageInfo.percent;

  const calculateLastSync = (lastSeen: string | null) => {
    if (!hasMounted) return "...";
    if (!lastSeen) return "Never";
    const date = new Date(lastSeen);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-6xl bg-input rounded-[24px] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-border animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-6 py-4 bg-navbarBg">
          <div>
            <h2 className="text-xl font-bold text-headings leading-tight">
              {currentDevice.name || "Unnamed Device"}
            </h2>
            <p className="text-sm text-[#737373] dark:text-gray-400 mt-1">
              {currentDevice.program?.serene_size || "1920 × 1080"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white rounded-full w-10 h-10 flex items-center justify-center transition-all cursor-pointer hover:bg-red-500/20 group"
          >
            <X className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-gray-900/50">
          {/* Preload next timeline item for faster transitions */}
          {nextMediaUrl && (
            <link
              rel="preload"
              href={nextMediaUrl}
              as={nextTimelineItem?.file?.type === "VIDEO" ? "video" : nextTimelineItem?.file?.type === "AUDIO" ? "fetch" : "image"}
              {...({ fetchPriority: "low" } as any)}
            />
          )}
          <div className="flex flex-col lg:flex-row p-6 gap-6">
            {/* Left Column - Media & Controls */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Media Preview Card */}
              <div
                className="relative bg-black rounded-[20px] overflow-hidden shadow-lg aspect-video ring-1 ring-black/5 flex items-center justify-center"
                style={mediaFilter}
              >
                {currentItem?.file?.type === 'IMAGE' ? (
                  mediaUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={mediaUrl}
                        alt={currentItem?.file?.originalName || "Device Media"}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  ) : null
                ) : currentItem?.file?.type === 'AUDIO' ? (
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-white/10">
                    <audio
                      ref={videoRef}
                      key={mediaUrl}
                      src={mediaUrl || ""}
                      autoPlay={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleNext}
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
                        {currentItem?.file?.originalName || "Audio Content"}
                      </h4>
                      <div className="flex items-center justify-center gap-2 text-blue-400/80 font-medium text-xs">
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Now Playing</span>
                      </div>
                    </div>

                    {/* Custom Controls Bar */}
                    <div className="absolute left-4 right-4 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-2.5 shadow-2xl bottom-4">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play().catch(() => {});
                          }
                          setIsPlaying(!isPlaying);
                        }}
                        className="flex-shrink-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all outline-none cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>

                      <span className="text-[10px] text-white/40 font-medium min-w-[30px] tabular-nums">
                        {formatDuration(currentTime)}
                      </span>

                      <div className="flex-1 flex items-center min-w-0">
                        <div
                          className="h-1 w-full bg-white/10 rounded-full cursor-pointer group relative"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            if (videoRef.current) {
                              videoRef.current.currentTime = percent * duration;
                            }
                          }}
                        >
                          <div
                            className="h-full bg-bgBlue rounded-full relative transition-all duration-100"
                            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <span className="text-[10px] text-white/40 font-medium min-w-[30px] tabular-nums">
                        {formatDuration(duration)}
                      </span>

                      {/* Volume Control */}
                      <div className="flex-shrink-0 flex items-center gap-2 w-24 border-l border-white/10 pl-3 ml-1">
                        <button
                          onClick={() => setVolume(volume === 0 ? 75 : 0)}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full h-0.5 rounded-lg appearance-none cursor-pointer accent-bgBlue"
                          style={{
                            background: `linear-gradient(to right, #006AFF ${volume}%, rgba(255, 255, 255, 0.2) ${volume}%)`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full">
                    <BaseVideoPlayer
                      key={mediaUrl}
                      src={mediaUrl || ""}
                      autoPlay={isPlaying}
                      rounded="rounded-none"
                      onEnded={handleEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      fillParent={true}
                      volume={volume / 100}
                      onVolumeChange={(v) => setVolume(Math.round(v * 100))}
                    />
                  </div>
                )}

              </div>

              {/* Play/Pause & Active Program Section */}
              <div className="bg-white dark:bg-input rounded-[20px] p-6 shadow-sm border border-border flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Layout className="w-5 h-5 text-bgBlue" />
                  <div>
                    <span className="text-xs text-[#737373] dark:text-gray-400 font-medium block">Active Program</span>
                    <span className="text-lg font-bold text-headings">{currentDevice.program?.name || "N/A"}</span>
                    <span className="text-xs text-[#737373] dark:text-gray-500 block mt-0.5">
                      Resolution: {currentDevice.program?.serene_size || "1920x1080"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
                        py-3 px-3 cursor-pointer
                        ${isPlaying ? "bg-bgBlue hover:bg-blue-500" : "bg-bgRed hover:bg-red-600"}`}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[400px] flex flex-col gap-6">
              <div className="bg-navbarBg rounded-[24px] p-6 shadow-sm border border-border flex flex-col gap-6 h-fit">
                <h3 className="text-xl font-bold text-headings">Device Details</h3>

                <div className="flex flex-col gap-5">
                  {/* Status Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Status</span>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${currentDevice.status === "ONLINE"
                      ? "bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]"
                      : currentDevice.status === "OFFLINE"
                        ? "bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]"
                        : currentDevice.status === "PAIRED"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : currentDevice.status === "WAITING"
                            ? "bg-orange-50 border-orange-200 text-orange-700"
                            : "bg-gray-100 border-gray-200 text-gray-700"
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${currentDevice.status === "ONLINE"
                        ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        : currentDevice.status === "OFFLINE"
                          ? "bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                          : currentDevice.status === "PAIRED"
                            ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            : currentDevice.status === "WAITING"
                              ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                              : "bg-gray-500"
                        }`} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {currentDevice.status}
                      </span>
                    </div>
                  </div>

                  {/* Last Sync Row */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Last Sync</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold">
                      {calculateLastSync(currentDevice.lastSeen || currentDevice.last_Sync)}
                    </span>
                  </div>

                  {/* Location Row */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Location</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold text-right truncate ml-4 max-w-[180px]">
                      {currentDevice?.location && typeof currentDevice.location === 'object' ? (
                        <DeviceLocation
                          lat={currentDevice.location.lat ?? 0}
                          lng={currentDevice.location.lng ?? 0}
                        />
                      ) : (currentDevice?.lat !== undefined && currentDevice?.lng !== undefined && currentDevice?.lat !== null && currentDevice?.lng !== null) ? (
                        <DeviceLocation lat={currentDevice.lat} lng={currentDevice.lng} />
                      ) : (
                        (!currentDevice?.location || currentDevice.location === '0.00, 0.00' || currentDevice.location === '0, 0' || currentDevice.location === 'Unknown Location') ? 'N/A' : currentDevice.location
                      )}
                    </span>
                  </div>

                  {/* Storage Row */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#737373]" />
                        <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Storage</span>
                      </div>
                      <span className="text-[#171717] dark:text-white text-sm font-bold">{storageInfo.formatted}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F5F5F5] dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bgBlue rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#737373] dark:text-gray-500">
                        {storagePercent > 100 ? "Limit Exceeded" : `${(100 - storagePercent).toFixed(1)}% Free`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                {/* Details List */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#737373]" />
                      <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Device ID</span>
                    </div>
                    <span className="text-[#171717] dark:text-white text-[12px] font-bold font-mono truncate ml-4 max-w-[150px]">
                      {currentDevice.id || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">OS</span>
                    <p className="text-[#171717] dark:text-white text-sm font-bold">
                      {currentDevice.deviceType || "Android TV"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">IP Address</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold font-mono">
                      {currentDevice.ip || "---"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#737373]" />
                      <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Serial Number</span>
                    </div>
                    <span className="text-[#171717] dark:text-white text-sm font-bold font-mono">
                      {currentDevice.deviceSerial || "---"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                {/* Timeline Sequence Section */}
                {timeline.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <ListTree className="w-4 h-4 text-bgBlue" />
                      <span className="text-sm font-bold text-headings">Timeline Sequence</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                      {timeline.map((item: any, idx: number) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setCurrentTimelineIndex(idx);
                            setIsPlaying(true);
                          }}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${idx === currentTimelineIndex
                            ? "bg-bgBlue/5 border-bgBlue/30 ring-1 ring-bgBlue/20"
                            : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-bgBlue/20"
                            }`}
                        >
                          <span className={`text-[11px] font-bold w-4 ${idx === currentTimelineIndex ? "text-bgBlue" : "text-[#737373]"}`}>
                            {idx === currentTimelineIndex ? <Play className="w-3 h-3 fill-current" /> : idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] font-bold truncate ${idx === currentTimelineIndex ? "text-bgBlue" : "text-headings"}`}>
                              {item.file?.originalName}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-[#737373] font-semibold uppercase">
                              <span className={idx === currentTimelineIndex ? "text-bgBlue/80" : "text-bgBlue"}>
                                {(item.file?.type || "media").toLowerCase()}
                              </span>
                              <span>•</span>
                              <span>{item.duration || item.file?.duration || 0}s</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}