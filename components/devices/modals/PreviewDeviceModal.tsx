"use client"

import { X, Camera, Maximize, Volume2, Sun, Play, Pause, Trash2, RefreshCw, Power, PowerOff, ListTree, FileText, Layout, Clock, Monitor, Wifi, Database } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useGetSingleDeviceDataQuery } from "@/redux/api/users/devices/devices.api";
import DeviceLocation from "@/components/common/DeviceLocation";
import ResolvedLocation from "@/common/ResolvedLocation";

import { Device, TimelineItem } from "@/redux/api/users/devices/devices.type";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  device: any | null;
}

export default function PreviewDeviceModal({ isOpen, onClose, device }: Props) {
  const { data: detailData, isLoading: isFetchingDetail } = useGetSingleDeviceDataQuery(
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
  const [brightness, setBrightness] = useState(80);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const getBaseUrl = () => {
    const fullUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return fullUrl.split("/api/v1")[0];
  };

  const getFileUrl = (url: string) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    const baseUrl = getBaseUrl();
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
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
      return getFileUrl(currentItem.file.url);
    }
    if (currentDevice?.program?.videoUrl) {
      return getFileUrl(currentDevice.program.videoUrl);
    }
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }, [currentItem, currentDevice]);

  const nextIndex = (currentTimelineIndex + 1) % (timeline.length || 1);

  const handleNext = () => {
    if (timeline.length > 0) {
      setCurrentTimelineIndex(nextIndex);
      setVideoProgress(0);
      setCurrentTime(0);
    }
  };

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
        setVideoProgress((elapsed / itemDuration) * 100);
        setCurrentTime(elapsed / 1000);
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [currentItem, isPlaying, isOpen, currentTimelineIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Brightness is applied via CSS filter on the media container
  const mediaFilter = useMemo(() => ({
    filter: `brightness(${brightness}%)`
  }), [brightness]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (!video.duration) return;
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(progress);
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsMetadataLoaded(true);
    };

    const handleTimeUpdate = () => {
      updateProgress();
    };

    const handleEnded = () => {
      handleNext();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isLooping, isOpen, mediaUrl, currentItem]);

  // Handle Playback based on isPlaying state
  useEffect(() => {
    if (videoRef.current && (currentItem?.file?.type === 'VIDEO' || currentItem?.file?.type === 'AUDIO')) {
      if (isPlaying) {
        videoRef.current.play().catch((err: any) => console.error("Playback failed", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, mediaUrl, currentItem]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setVideoProgress(newProgress);

    if (videoRef.current && duration > 0) {
      const seekTime = (newProgress / 100) * duration;
      videoRef.current.currentTime = seekTime;
    }
  };

  // const toggleLoop = () => {
  //   if (videoRef.current) {
  //     const newLoopState = !isLooping;
  //     setIsLooping(newLoopState);
  //     videoRef.current.loop = newLoopState;
  //   }
  // };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

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



  const timeline = currentDevice.program?.timeline || [];

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
            className="text-[#A3A3A3] hover:text-red-500 transition-colors p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-gray-900/50">
          <div className="flex flex-col lg:flex-row p-6 gap-6">
            {/* Left Column - Media & Controls */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Media Preview Card */}
              <div 
                className="relative bg-black rounded-[20px] overflow-hidden shadow-lg aspect-video ring-1 ring-black/5 flex items-center justify-center"
                style={mediaFilter}
              >
                {currentItem?.file?.type === 'IMAGE' ? (
                  <img
                    src={mediaUrl}
                    alt={currentItem?.file?.originalName}
                    className="w-full h-full object-contain"
                  />
                ) : currentItem?.file?.type === 'AUDIO' ? (
                  <div className="flex flex-col items-center gap-4 text-white">
                    <Volume2 className="w-16 h-16 text-bgBlue animate-pulse" />
                    <p className="text-sm font-medium opacity-60">Playing Audio Sequence</p>
                    <p className="text-xs font-mono">{currentItem?.file?.originalName}</p>
                    <audio 
                      ref={videoRef}
                      src={mediaUrl} 
                      autoPlay={isPlaying}
                      onEnded={handleNext}
                    />
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    key={mediaUrl}
                    className="w-full h-full object-cover"
                    src={mediaUrl}
                    playsInline
                    preload="metadata"
                  />
                )}

                {/* Top Overlay Badge */}
                {/* <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171717] dark:text-white shadow-sm border border-white/20 w-fit">
                    {currentDevice.program?.name || "Main Lobby Display"}
                  </div>
                  {currentItem && (
                    <div className="bg-bgBlue/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-sm w-fit uppercase">
                      {currentItem.file?.type} | {currentTimelineIndex + 1}/{timeline.length}
                    </div>
                  )}
                </div> */}

                {/* Bottom Custom Toolbar */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="shrink-0 text-white hover:scale-110 transition-transform cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
                    </button>

                    <div className="flex-1 flex items-center">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={videoProgress}
                        onChange={handleProgressChange}
                        className="w-full h-1.5 cursor-pointer appearance-none rounded-full bg-white/20"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 ${videoProgress}%, rgba(255,255,255,0.2) ${videoProgress}%)`,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-3 text-white/90">
                      <button className="p-1 hover:text-white transition-colors cursor-pointer">
                        <Camera className="h-5 w-5" />
                      </button>
                      <button onClick={toggleFullscreen} className="p-1 hover:text-white transition-colors cursor-pointer">
                        <Maximize className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls Area */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Volume & Brightness Card */}
                <div className="flex-1 bg-white dark:bg-input rounded-[20px] p-6 shadow-sm border border-border flex flex-col gap-6">
                  {/* Volume Slider */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Volume2 className="h-5 w-5 text-[#737373]" />
                      <span className="text-sm font-medium text-[#737373] dark:text-gray-400">Volume</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="relative flex-1 h-2 flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F5F5] dark:bg-gray-800"
                          style={{
                            background: `linear-gradient(to right, #171717 ${volume}%, #F5F5F5 ${volume}%)`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#171717] dark:text-white w-10 text-right">{volume}%</span>
                    </div>
                  </div>

                  {/* Brightness Slider */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Sun className="h-5 w-5 text-[#737373]" />
                      <span className="text-sm font-medium text-headings">Brightness</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="relative flex-1 h-2 flex items-center">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#F5F5F5] dark:bg-gray-800"
                          style={{
                            background: `linear-gradient(to right, #171717 ${brightness}%, #F5F5F5 ${brightness}%)`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#171717] dark:text-white w-10 text-right">{brightness}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Device Details */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6">
              <div className="bg-navbarBg rounded-[24px] p-6 shadow-sm border border-border flex flex-col gap-6 flex-1">
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
                      {currentDevice?.location && typeof currentDevice.location === 'object' && currentDevice.location.lat && currentDevice.location.lng ? (
                        <DeviceLocation lat={currentDevice.location.lat} lng={currentDevice.location.lng} />
                      ) : (
                        currentDevice?.location || "Unknown Location"
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

                  <div className="h-px bg-gray-100 dark:bg-gray-800" />

                  {/* Program Summary */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100/50 dark:border-blue-800/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Layout className="w-4 h-4 text-bgBlue" />
                      <span className="text-sm font-bold text-headings">Active Program</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-[#737373] dark:text-gray-400 font-medium">Name</span>
                        <span className="text-sm font-semibold text-headings">{currentDevice.program?.name || "N/A"}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-[#737373] dark:text-gray-400 font-medium">Resolution</span>
                        <span className="text-sm font-semibold text-headings">{currentDevice.program?.serene_size || "1920x1080"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Program Timeline (Compact) */}
                  {timeline.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <ListTree className="w-4 h-4 text-bgBlue" />
                        <span className="text-sm font-bold text-headings">Timeline Sequence</span>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
                        {timeline.map((item: any, idx: number) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setCurrentTimelineIndex(idx);
                              setVideoProgress(0);
                              setIsPlaying(true);
                            }}
                            className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${idx === currentTimelineIndex
                                ? "bg-bgBlue/5 border-bgBlue/30 ring-1 ring-bgBlue/20"
                                : "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 hover:border-bgBlue/20"
                              }`}
                          >
                            <span className={`text-[10px] font-bold w-4 ${idx === currentTimelineIndex ? "text-bgBlue" : "text-[#737373]"}`}>
                              {idx === currentTimelineIndex ? <Play className="w-3 h-3 fill-current" /> : idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-bold truncate ${idx === currentTimelineIndex ? "text-bgBlue" : "text-headings"}`}>
                                {item.file?.originalName}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] text-[#737373] font-semibold uppercase">
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

                  {/* Power Button Section */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Power Status</span>
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
                            py-3 px-3 cursor-pointer
                            ${isPlaying ? "bg-bgBlue hover:bg-blue-500" : "bg-bgRed hover:bg-red-600"}`}
                      >
                        {isPlaying ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}