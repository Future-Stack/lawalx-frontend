/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Music, PlayCircle, Pause, Play, Volume2, VolumeX, Loader2 } from "lucide-react";
import Image from "next/image";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";

interface ProgramPreviewProps {
  selectedContent: any;
  previewUrl: string | undefined;
  localActive: boolean;
  isFading: boolean;
  handleVideoEnded: () => void;
  setIsPaused: (paused: boolean) => void;
  isPaused: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioCurrentTime: number;
  setAudioCurrentTime: (time: number) => void;
  setAudioDuration: (duration: number) => void;
  audioDuration: number;
  currentFileName: string;
  audioVolume: number;
  setAudioVolume: (volume: number) => void;
  formatTime: (time: number) => string;
  handlePowerClick: (e: React.MouseEvent) => void;
  isUpdating: boolean;
  playbackVersion: number;
}

const ProgramPreview = ({
  selectedContent,
  previewUrl,
  localActive,
  isFading,
  handleVideoEnded,
  setIsPaused,
  isPaused,
  audioRef,
  audioCurrentTime,
  setAudioCurrentTime,
  setAudioDuration,
  audioDuration,
  currentFileName,
  audioVolume,
  setAudioVolume,
  formatTime,
  handlePowerClick,
  isUpdating,
  playbackVersion
}: ProgramPreviewProps) => {
  // Sync Audio volume
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume, audioRef]);

  return (
    <div className="border border-border p-4 sm:p-6 rounded-xl bg-navbarBg space-y-4 sm:space-y-6 shadow-lg transition-shadow hover:shadow-xl overflow-hidden mb-6">
      <div className="aspect-video relative overflow-hidden rounded-lg bg-black">
        <div className={`w-full h-full ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>
          {selectedContent?.file?.type === "VIDEO" ? (
            <div className="w-full h-full">
              <BaseVideoPlayer
                key={`${previewUrl}-${playbackVersion}`}
                src={previewUrl || ""}
                poster={undefined}
                autoPlay={localActive}
                fillParent={true}
                rounded="rounded-lg"
                onEnded={handleVideoEnded}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                volume={audioVolume}
                onVolumeChange={setAudioVolume}
              />
            </div>
          ) : selectedContent?.file?.type === "AUDIO" ? (
            <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-indigo-950 via-slate-900 to-black overflow-hidden flex flex-col items-center justify-center p-8 text-center border border-white/10">
              <audio
                ref={audioRef}
                key={`${previewUrl}-${playbackVersion}`}
                src={previewUrl}
                autoPlay={localActive}
                onPlay={() => setIsPaused(false)}
                onPause={() => setIsPaused(true)}
                onTimeUpdate={(e) => setAudioCurrentTime(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                onEnded={handleVideoEnded}
                hidden
              />

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

              <div className="absolute bottom-6 left-5 right-5 z-20 flex items-center gap-3.5 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
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

                <span className="text-[10px] text-white/40 font-medium min-w-[32px] tabular-nums text-center">
                  {formatTime(audioCurrentTime)}
                </span>

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

                <span className="text-[10px] text-white/40 font-medium min-w-[32px] tabular-nums text-center">
                  {formatTime(audioDuration)}
                </span>

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
                <Image
                  key={`${previewUrl}-${playbackVersion}`}
                  src={previewUrl}
                  alt={currentFileName}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                  onLoad={() => setIsPaused(false)}
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

      <p className="flex justify-between items-center text-sm sm:text-base text-muted mt-2">
        Shows the Menu
        <button
          type="button"
          onClick={handlePowerClick}
          disabled={isUpdating}
          aria-label={localActive ? "Turn Off Program" : "Turn On Program"}
          className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
                      py-3 sm:py-3.5 px-3 sm:px-3.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
                      ${localActive
              ? "bg-bgBlue hover:bg-blue-500"
              : "bg-bgRed hover:bg-red-600"
            }`}
          title={localActive ? "Turn Off" : "Turn On"}
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          ) : localActive ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </p>
    </div>
  );
};

export default ProgramPreview;
