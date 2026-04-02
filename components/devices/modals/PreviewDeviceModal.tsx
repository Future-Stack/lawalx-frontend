"use client"

import { X, Power, Camera, Maximize, Volume2, Sun, Play, Pause, Trash2, RefreshCw } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useGetSingleDeviceDataQuery } from "@/redux/api/users/devices/devices.api";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(75);
  const [brightness, setBrightness] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const getBaseUrl = () => {
    const fullUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return fullUrl.split("/api/v1")[0];
  };

  const currentDevice = useMemo(() => {
    return deviceDetail || device;
  }, [deviceDetail, device]);

  const videoSrc = useMemo(() => {
    if (currentDevice?.program?.videoUrl) {
      const url = currentDevice.program.videoUrl;
      return `${getBaseUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  }, [currentDevice]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.filter = `brightness(${brightness}%)`;
    }
  }, [brightness]);

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
      if (!isLooping) {
        setIsPlaying(false);
        setVideoProgress(0);
        setCurrentTime(0);
        video.currentTime = 0;
      }
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
  }, [isLooping, isOpen]);

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

  const toggleLoop = () => {
    if (videoRef.current) {
      const newLoopState = !isLooping;
      setIsLooping(newLoopState);
      videoRef.current.loop = newLoopState;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!isOpen || !device || !currentDevice) return null;

  const parseStorage = (storage: any) => {
    if (!storage) return { used: 0, total: 100, formatted: "N/A" };

    // If it's the structure from API metadata or storage field
    if (typeof storage === 'object') {
      const used = parseFloat(storage.used) || 0;
      const total = parseFloat(storage.total) || 100;
      return {
        used,
        total,
        formatted: `${used.toFixed(1)} GB / ${total.toFixed(1)} GB`
      };
    }

    const match = String(storage).match(/([\d.]+)?\s*(?:GB)?\s*\/\s*([\d.]+)\s*GB/);
    if (match) {
      const used = match[1] ? parseFloat(match[1]) : 0;
      const total = parseFloat(match[2]);
      return {
        used,
        total,
        formatted: `${used.toFixed(1)} GB / ${total.toFixed(1)} GB`,
      };
    }

    const singleMatch = String(storage).match(/([\d.]+)\s*GB/);
    if (singleMatch) {
      const used = parseFloat(singleMatch[1]);
      return { used, total: 100, formatted: `${used.toFixed(1)} GB / 100.0 GB` };
    }

    return { used: 0, total: 100, formatted: "N/A" };
  };

  const { used, total, formatted } = parseStorage(currentDevice.storage);
  const storagePercent = total > 0 ? (used / total) * 100 : 0;

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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
              {currentDevice.name || currentDevice.device || "Unnamed Device"}
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
              <div className="relative bg-black rounded-[20px] overflow-hidden shadow-lg aspect-video ring-1 ring-black/5">
                <video
                  ref={videoRef}
                  key={videoSrc}
                  className="w-full h-full object-cover"
                  src={videoSrc}
                  playsInline
                  preload="metadata"
                />

                {/* Top Overlay Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-[#171717] dark:text-white shadow-sm border border-white/20">
                    {currentDevice.program?.name || "Main Lobby Display"}
                  </div>
                </div>

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

                {/* Device Actions Card */}
                {/* <div className="bg-white dark:bg-navbarBg rounded-[20px] p-6 shadow-sm border border-border flex items-center gap-4 justify-center sm:px-8">
                  <button className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 text-[#171717] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-sm">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[#EF4444] text-white hover:bg-red-600 transition-colors cursor-pointer shadow-md">
                    <Power className="h-5 w-5" />
                  </button>
                </div> */}
              </div>
            </div>

            {/* Right Column - Device Details */}
            <div className="w-full lg:w-[350px] bg-navbarBg rounded-[24px] p-6 shadow-sm border border-border flex flex-col gap-6">
              <h3 className="text-xl font-bold text-headings">Device Details</h3>

              <div className="flex flex-col gap-5">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Status</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${currentDevice.status === "PAIRED" || currentDevice.status === "Online"
                    ? "bg-[#ECFDF5] border-[#D1FAE5] text-[#059669]"
                    : "bg-[#FEF2F2] border-[#FEE2E2] text-[#DC2626]"
                    }`}>
                    <span className={`w-2 h-2 rounded-full ${currentDevice.status === "PAIRED" || currentDevice.status === "Online"
                      ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                      : "bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      }`} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {currentDevice.status === "PAIRED" ? "Online" : (currentDevice.status === "OFFLINE" ? "Offline" : currentDevice.status)}
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

                {/* Storage Row */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Storage</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold">{formatted}</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F5F5F5] dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#171717] dark:bg-gray-400 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#737373] dark:text-gray-500">
                      {total > 0 ? (100 - storagePercent).toFixed(0) : 0}% Free
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800" />

                {/* Details List */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium text-nowrap">Device ID: </span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold font-mono">
                      {currentDevice.id || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">OS</span>
                    <div className="text-right">
                      <p className="text-[#171717] dark:text-white text-sm font-bold leading-tight">
                        {currentDevice.deviceType || currentDevice.platform || "Android TV"}
                      </p>
                      <p className="text-[10px] text-[#A3A3A3] font-medium leading-tight">9.0</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">IP Address</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold font-mono">
                      {currentDevice.ip || "192.168.1.45"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">Screen Playing</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold truncate ml-4 max-w-[150px]">
                      {currentDevice.program?.name || "No Screen Playing"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

                {/* App Version Section */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] dark:text-gray-400 text-sm font-medium">App Version</span>
                    <span className="text-[#171717] dark:text-white text-sm font-bold">v2.4.1</span>
                  </div>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-[#171717] dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer w-full justify-center">
                    <RefreshCw className="h-4 w-4" />
                    Update App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}