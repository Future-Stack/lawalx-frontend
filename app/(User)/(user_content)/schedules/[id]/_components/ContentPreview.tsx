"use client";

import {
  Video,
  Clock,
  Play,
  Pause,
  Music,
  PlayCircle,
  Volume2,
  VolumeX,
  Loader2,
  File,
  FileVideo2,
  FileVideo,
} from "lucide-react";
import { ContentItem } from "@/types/content";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import Image from "next/image";
import { useState, useEffect, useTransition, useCallback, useRef } from "react";
import Marquee from "react-fast-marquee";
import { LowerThirdPayload } from "@/redux/api/users/schedules/schedules.type";

interface ContentPreviewProps {
  items: ContentItem[];
  scheduleTime: string;
  playingIndex: number;
  setPlayingIndex: (index: number) => void;
  lowerThird?: LowerThirdPayload;
  localActive?: boolean;
  onPowerClick?: () => void;
  isUpdating?: boolean;
}

function formatTime(time: number): string {
  if (isNaN(time)) return "00:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  items,
  scheduleTime,
  playingIndex,
  setPlayingIndex,
  lowerThird,
  localActive = false,
  onPowerClick,
  isUpdating = false,
}) => {
  const [isFading, setIsFading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [audioVolume, setAudioVolume] = useState(1);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const content = items[playingIndex];
  const videoSrc = content?.video || (content?.type === "video" ? content?.thumbnail : undefined);
  const thumbnailSrc = content?.thumbnail;
  const currentFileName = content?.title || "No content selected";

  useEffect(() => {
    if (playingIndex >= items.length && items.length > 0) {
      setPlayingIndex(0);
    }
  }, [items?.length, playingIndex, setPlayingIndex]);

  // Sync isPlaying with localActive
  useEffect(() => {
    setIsPlaying(localActive);
    setIsPaused(!localActive);
  }, [localActive]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  // Manually control audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const advance = useCallback(() => {
    if (!items || items.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setPlayingIndex((playingIndex + 1) % items.length);
      setIsFading(false);
    }, 500);
  }, [items.length, playingIndex, setPlayingIndex]);

  useEffect(() => {
    if (!items || items.length <= 1 || !isPlaying) return;
    const currentItem = items[playingIndex];
    if (currentItem?.type === "video" || currentItem?.type === "audio") return;
    const displayDuration = parseInt(currentItem?.duration || "7");
    const timer = setTimeout(advance, Math.max(0, displayDuration * 1000 - 500));
    return () => clearTimeout(timer);
  }, [playingIndex, items.length, isPlaying, advance]);

  return (
    <div className="lg:col-span-5 space-y-6">
      <h2 className="text-xl font-bold text-headings dark:text-white lg:mt-0">Preview</h2>

      <div className="border border-border p-4 sm:p-6 rounded-xl bg-navbarBg space-y-4 sm:space-y-6 shadow-lg transition-shadow hover:shadow-xl overflow-hidden">
        {/* Media Container */}
        <div className="aspect-video relative overflow-hidden rounded-lg bg-black">
          <div className={`w-full h-full ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>

            {/* TOP TICKER */}
            {lowerThird?.text && lowerThird.position === "Top" && (
              <div
                className="absolute top-0 left-0 right-0 z-10 py-3 overflow-hidden"
                style={{
                  backgroundColor: `${lowerThird.backgroundColor}${Math.round(
                    parseInt(lowerThird.backgroundOpacity || "80") * 2.55
                  ).toString(16).padStart(2, "0")}`,
                }}
              >
                <Marquee
                  speed={lowerThird.speed || 40}
                  direction={lowerThird.animation === "Right_to_Left" ? "left" : "right"}
                  gradient={false}
                  loop={lowerThird.loop ? 0 : 1}
                >
                  <p
                    className="font-semibold px-4"
                    style={{
                      color: lowerThird.textColor,
                      fontSize: lowerThird.fontSize === "Small" ? "14px" : lowerThird.fontSize === "Medium" ? "16px" : "20px",
                      fontFamily: lowerThird.font || "inherit",
                    }}
                  >
                    {lowerThird.text}
                  </p>
                </Marquee>
              </div>
            )}

            {/* VIDEO */}
            {content?.type === "video" && videoSrc ? (
              <div className="w-full h-full">
                <BaseVideoPlayer
                  key={videoSrc}
                  src={videoSrc}
                  poster={thumbnailSrc}
                  autoPlay={isPlaying}
                  muted={false}
                  fillParent={true}
                  rounded="rounded-lg"
                  onEnded={advance}
                  onPlay={() => setIsPaused(false)}
                  onPause={() => setIsPaused(true)}
                />
              </div>

            ) : content?.type === "audio" && content.audio ? (
              /* AUDIO */
              <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-black overflow-hidden flex flex-col items-center justify-center p-8 text-center border border-white/10">
                <audio
                  ref={audioRef}
                  key={content.audio}
                  src={content.audio}
                  autoPlay={isPlaying}
                  onPlay={() => setIsPaused(false)}
                  onPause={() => setIsPaused(true)}
                  onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                  hidden
                />

                {/* Glow bg */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-bgBlue rounded-full blur-[100px]" />
                </div>

                {/* Music icon */}
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

                {/* Audio Controls Bar */}
                <div className="absolute bottom-6 left-5 right-5 z-20 flex items-center gap-3.5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* Play/Pause */}
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

                  {/* Current time */}
                  <span className="text-[10px] text-white/40 font-medium min-w-[32px] tabular-nums text-center">
                    {formatTime(audioCurrentTime)}
                  </span>

                  {/* Progress bar */}
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

                  {/* Total time */}
                  <span className="text-[10px] text-white/40 font-medium min-w-[32px] tabular-nums text-center">
                    {formatTime(audioDuration)}
                  </span>

                  {/* Volume */}
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
                      className="w-full h-1 rounded-lg appearance-none cursor-pointer accent-bgBlue"
                      style={{
                        background: `linear-gradient(to right, #006AFF ${audioVolume * 100}%, rgba(255,255,255,0.2) ${audioVolume * 100}%)`,
                      }}
                      title="Volume Control"
                    />
                  </div>
                </div>

                {/* Animated audio bars */}
                <div className="absolute bottom-20 flex items-end gap-1.5 h-12 pointer-events-none">
                  {[0.6, 0.8, 1, 0.7, 0.9, 0.5, 0.8].map((scale, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-bgBlue/60 rounded-full animate-audio-bar"
                      style={{
                        height: "100%",
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: `${0.8 + Math.random()}s`,
                        transform: `scaleY(${scale})`,
                        animationPlayState: isPlaying ? "running" : "paused",
                      }}
                    />
                  ))}
                </div>
              </div>

            ) : content?.type === "image" && thumbnailSrc ? (
              /* IMAGE */
              <div className="relative w-full h-full rounded-lg bg-black overflow-hidden flex items-center justify-center">
                <Image
                  src={thumbnailSrc}
                  alt={currentFileName}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

            ) : (
              /* EMPTY */
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-muted rounded-lg">
                <Video className="w-12 h-12 opacity-20 mb-2" />
                <span className="text-sm">{items.length === 0 ? "No content added yet" : "Cannot preview this content type"}</span>
              </div>
            )}

            {/* BOTTOM TICKER */}
            {lowerThird?.text && lowerThird.position !== "Top" && (
              <div
                className="absolute bottom-0 left-0 right-0 z-10 py-2.5 overflow-hidden"
                style={{
                  backgroundColor: `${lowerThird.backgroundColor}${Math.round(
                    parseInt(lowerThird.backgroundOpacity || "80") * 2.55
                  ).toString(16).padStart(2, "0")}`,
                }}
              >
                <Marquee
                  speed={lowerThird.speed || 40}
                  direction={lowerThird.animation === "Right_to_Left" ? "left" : "right"}
                  gradient={false}
                  loop={lowerThird.loop ? 0 : 1}
                >
                  <p
                    className="font-semibold px-4"
                    style={{
                      color: lowerThird.textColor,
                      fontSize: lowerThird.fontSize === "Small" ? "14px" : lowerThird.fontSize === "Medium" ? "16px" : "20px",
                      fontFamily: lowerThird.font || "inherit",
                    }}
                  >
                    {lowerThird.text}
                  </p>
                </Marquee>
              </div>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center gap-2">
          <FileVideo className="text-headings w-5 h-5 md:w-6 md:h-6"/>
          <h3 className="text-sm md:text-lg font-medium text-headings line-clamp-1 truncate">
            {currentFileName}
          </h3>
        </div>

        <p className="flex justify-between items-center text-sm sm:text-base text-muted">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            {scheduleTime || "Mon, Tue, Wed, Thu, Fri • 09:00 AM"}
          </span>

          {/* Power Button — same as programs page */}
          <button
            type="button"
            onClick={onPowerClick}
            disabled={isUpdating}
            aria-label={localActive ? "Stop Schedule" : "Start Schedule"}
            className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
                        py-3 sm:py-3.5 px-3 sm:px-3.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
                        ${
                          localActive
                            ? "bg-bgBlue hover:bg-blue-500"
                            : "bg-bgRed hover:bg-red-600"
                        }`}
            title={localActive ? "Stop Schedule" : "Start Schedule"}
          >
            {localActive ? (
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ContentPreview;
