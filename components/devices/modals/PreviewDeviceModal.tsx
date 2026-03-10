import { X, RotateCcw, Power, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Device as ApiDevice } from "@/redux/api/users/devices/devices.type";
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
  console.log("detailData", detailData);

  const deviceDetail = useMemo(() => {
    return detailData?.data && detailData.data.length > 0 ? detailData.data[0] : null;
  }, [detailData]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

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

  if (!isOpen || !device) return null;

  const currentDevice = deviceDetail || device;

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-5xl bg-navbarBg rounded-xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col sm:max-h-[90vh] border border-transparent dark:border-gray-700 z-[101] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border bg-navbarBg px-4 py-3 sm:px-5 sm:py-3.5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{currentDevice.name || currentDevice.device}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{currentDevice.model || "Standard Model"}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto relative">
          {isFetchingDetail && (
            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-bgBlue" />
                <span className="text-sm font-medium text-gray-500">Loading details...</span>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-4 sm:p-5">
              <div className="relative bg-black rounded-lg overflow-hidden shadow-md aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                  playsInline
                  preload="metadata"
                />

                <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                  Video Lobby Display
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 py-2.5">
                  <div className="flex items-center gap-2.5 text-white">
                    <button onClick={togglePlayPause} className="shrink-0 cursor-pointer">
                      {isPlaying ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <div className="flex flex-1 items-center gap-2 text-[10px] font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={videoProgress}
                        onChange={handleProgressChange}
                        className="flex-1 h-1 cursor-pointer appearance-none rounded-full bg-white/30"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 ${videoProgress}%, rgba(255,255,255,0.3) ${videoProgress}%)`,
                        }}
                      />
                      <span>{isMetadataLoaded ? formatTime(duration) : "--:--"}</span>
                    </div>

                    <button onClick={toggleLoop} className={`shrink-0 cursor-pointer ${isLooping ? "text-blue-400" : "text-white"}`}>
                      {isLooping ? (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 2v4m0 0v4m0-4h-4m4 0h4M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                        </svg>
                      )}
                    </button>

                    <button onClick={toggleFullscreen} className="shrink-0 cursor-pointer">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div className="bg-navbarBg rounded-2xl shadow-sm border border-border p-4 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Volume</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer volume-slider"
                        style={{
                          background: `linear-gradient(to right, #000 ${volume}%, #e5e7eb ${volume}%)`,
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">{volume}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0-7v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">Brightness</span>
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer brightness-slider"
                        style={{
                          background: `linear-gradient(to right, #000 ${brightness}%, #e5e7eb ${brightness}%)`,
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">{brightness}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center cursor-pointer gap-1.5 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-customShadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300">
                    <RotateCcw className="h-4 w-4" />
                    Reboot
                  </button>
                  <button className="flex items-center justify-center cursor-pointer gap-1.5 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-customShadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300">
                    <Power className="h-4 w-4" />
                    Turn Off
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 xl:w-72 bg-navbarBg border border-border my-5 mr-5 p-3 lg:p-4 rounded-lg shadow-sm shrink-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Device Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${currentDevice.status === "PAIRED" || currentDevice.status === "Online"
                      ? "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-800 text-green-500 dark:text-green-400"
                      : currentDevice.status === "OFFLINE" || currentDevice.status === "Offline"
                        ? "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-400 dark:text-red-500"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-400"
                      }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full animate-pulse ${currentDevice.status === "PAIRED" || currentDevice.status === "Online"
                        ? "bg-green-500"
                        : currentDevice.status === "OFFLINE" || currentDevice.status === "Offline"
                          ? "bg-red-500"
                          : "bg-gray-400"
                        }`}
                    ></div>
                    <span className="text-sm font-medium">
                      {currentDevice.status === "PAIRED" ? "Online" : (currentDevice.status === "OFFLINE" ? "Offline" : currentDevice.status)}
                    </span>
                  </div>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last Sync</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateLastSync(currentDevice.lastSeen || currentDevice.last_Sync)}
                  </span>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Storage</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatted}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-gray-400 rounded-full transition-all duration-500"
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-end">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {(total - used).toFixed(1)} GB Free (
                      {(100 - storagePercent).toFixed(0)}%)
                    </span>
                  </div>
                </div>

                {/* <button className="w-full flex items-center justify-center shadow-customShadow cursor-pointer gap-2 py-3 px-4 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium text-gray-700 dark:text-gray-300">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear Space
                </button> */}

                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Device ID</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white font-mono truncate ml-4">
                    {currentDevice.id}
                  </span>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">IP Address</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white font-mono text-xs">
                    {currentDevice.ip || "192.168.1.1"}
                  </span>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Screen Playing</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate ml-4">
                    {currentDevice.program?.name || "No Screen Playing"}
                  </span>
                </div>
                <hr className="border-gray-100 dark:border-gray-700" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">App Version</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      v2.4.1
                    </p>
                  </div>
                  <button className="flex items-center gap-1.5 cursor-pointer shadow-customShadow px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-xs font-medium text-gray-700 dark:text-gray-300">
                    <RotateCcw className="w-3.5 h-3.5" />
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