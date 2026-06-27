/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";
import type { APITypes } from "plyr-react";

const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

// ─── localStorage helpers 
const VOLUME_KEY = "plyr_volume";

function getSavedVolume(): number | null {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw === null) return null;
    const v = parseFloat(raw);
    return isFinite(v) ? Math.min(1, Math.max(0, v)) : null;
  } catch {
    return null;
  }
}

function setSavedVolume(v: number) {
  try {
    localStorage.setItem(VOLUME_KEY, String(v));
  } catch {}
}
interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  rounded?: string;
  mediaType?: "video" | "audio";
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  fillParent?: boolean;
  className?: string; 
  onReady?: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

const BaseVideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  muted = false,
  rounded = "rounded-xl",
  mediaType = "video",
  onEnded,
  onPlay,
  onPause,
  fillParent = false,
  className = "",
  onReady,
  volume,
  onVolumeChange,
}: VideoPlayerProps) => {
  const playerRef = useRef<APITypes>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const hasStartedRef = useRef(false);
  const isSeekingRef = useRef(false);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Spinner delay logic: Only show spinner if media takes > 300ms to load/buffer
  useEffect(() => {
    if (!ready || !isMounted || isBuffering) {
      const timer = setTimeout(() => setShowSpinner(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSpinner(false);
    }
  }, [ready, isMounted, isBuffering, src]);

  // Stable callback refs
  const onEndedRef  = useRef(onEnded);
  const onPlayRef   = useRef(onPlay);
  const onPauseRef  = useRef(onPause);
  const onReadyRef  = useRef(onReady);
  const onVolumeChangeRef = useRef(onVolumeChange);
  const volumeRef = useRef(volume);

  onEndedRef.current  = onEnded;
  onPlayRef.current   = onPlay;
  onPauseRef.current  = onPause;
  onReadyRef.current  = onReady;
  onVolumeChangeRef.current = onVolumeChange;
  volumeRef.current = volume;

  const autoPlayRef = useRef(autoPlay);
  autoPlayRef.current = autoPlay;

  // ── 1. Mount ───────────────────────────────────────────────
  useEffect(() => { setIsMounted(true); }, []);

  // ── 2. Core listeners — attached once on mount ─────────────
  useEffect(() => {
    if (!isMounted) return;

    let retryTimer: NodeJS.Timeout;

    const attach = (): (() => void) | undefined => {
      const player = playerRef.current?.plyr as any;
      if (!player || typeof player.on !== "function") {
        retryTimer = setTimeout(attach, 50);
        return;
      }

      const handleReady = () => {
        onReadyRef.current?.();
        const vol = volumeRef.current !== undefined ? volumeRef.current : getSavedVolume();
        if (vol === null) return;
        
        setTimeout(() => {
          const p = playerRef.current?.plyr as any;
          if (!p) return;
          p.volume = vol;
          // Only unmute if not explicitly muted by prop
          if (!autoPlayRef.current) {
            p.muted = vol === 0;
          }
        }, 50);
      };

      const handleVolumeChange = () => {
        const p = playerRef.current?.plyr as any;
        if (!p) return;
        const vol = p.volume;
        if (autoPlayRef.current && vol === 0 && p.muted) return;
        setSavedVolume(vol);
        onVolumeChangeRef.current?.(vol);
      };

      const handleSeeking = () => {
        isSeekingRef.current = true;
      };
      const handleSeeked = () => {
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 150);
      };
      const handlePlaying = () => { 
        setReady(true); 
        setIsPlaying(true);
        setIsBuffering(false);
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }
        if (isSeekingRef.current) return;
        onPlayRef.current?.(); 
      };
      const handlePause   = () => {
        setIsPlaying(false);
        setIsBuffering(false);
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
        }
        pauseTimerRef.current = setTimeout(() => {
          pauseTimerRef.current = null;
          if (isSeekingRef.current) return;
          onPauseRef.current?.();
        }, 200); // 200ms delay to verify if pause was triggered by seek
      };
      const handleWaiting = () => {
        setIsBuffering(true);
      };
      const handleEnded   = () => {
        setIsPlaying(false);
        setIsBuffering(false);
        if (pauseTimerRef.current) {
          clearTimeout(pauseTimerRef.current);
          pauseTimerRef.current = null;
        }
        onEndedRef.current?.();
      };
      const handleCanPlay = () => {
        setReady(true);
        setIsBuffering(false);
      };

      player.on("ready",        handleReady);
      player.on("canplay",      handleCanPlay);
      player.on("playing",      handlePlaying);
      player.on("waiting",      handleWaiting);
      player.on("pause",        handlePause);
      player.on("ended",        handleEnded);
      player.on("volumechange", handleVolumeChange);
      player.on("seeking",      handleSeeking);
      player.on("seeked",       handleSeeked);

      if (player.ready) handleReady();

      return () => {
        try {
          player.off("ready",        handleReady);
          player.off("canplay",      handleCanPlay);
          player.off("playing",      handlePlaying);
          player.off("pause",        handlePause);
          player.off("ended",        handleEnded);
          player.off("volumechange", handleVolumeChange);
          player.off("seeking",      handleSeeking);
          player.off("seeked",       handleSeeked);
        } catch {}
      };
    };

    const cleanup = attach();
    return () => {
      clearTimeout(retryTimer);
      cleanup?.();
    };
  }, [isMounted]);

  // ── 3. Reset ready and hasStarted on src change ───────────
  useEffect(() => { 
    setReady(false); 
    hasStartedRef.current = false;
  }, [src]);

  // ── 4. Drive autoPlay — mute to start, then restore volume ─
  useEffect(() => {
    const player = playerRef.current?.plyr as any;
    if (!player || !ready) return;

    if (autoPlay) {
      const playPromise = player.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch((error: any) => {
          if (error.name === "NotAllowedError" || error.name === "AbortError") {
            // Try again after a small delay, maybe interaction state hasn't propagated yet
            setTimeout(() => {
              player.muted = true;
              player.play().catch(() => console.warn("Autoplay blocked even after retry"));
            }, 100);
          }
        });
      }
      hasStartedRef.current = true;
    } else {
      player.pause();
    }
  }, [autoPlay, ready, src]);

  // ── 5. Sync external `muted` prop (non-autoplay) ──────────
  useEffect(() => {
    const player = playerRef.current?.plyr as any;
    if (!player || !ready || autoPlay) return;
    player.muted  = muted;
    player.volume = muted ? 0 : (getSavedVolume() ?? 1);
  }, [muted, autoPlay, ready]);

  // ── 6. Sync external `volume` prop ────────────────────────
  useEffect(() => {
    const player = playerRef.current?.plyr as any;
    if (!player || !ready || volume === undefined) return;
    if (Math.abs(player.volume - volume) > 0.01) {
      player.volume = volume;
    }
  }, [volume, ready]);

  // ── Memoized source ────────────────────────────────────────
  const source = useMemo(() => {
    const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");
    if (isYouTube && mediaType === "video") {
      return {
        type: "video" as const,
        poster: poster || "",
        sources: [{ src, provider: "youtube" as const }],
      } as any;
    }
    const isAbsolute = src.startsWith("http://") || src.startsWith("https://");
    const safeSrc = isAbsolute ? src : src.startsWith("/") ? src : `/${src}`;
    const isMp3 = safeSrc.toLowerCase().includes(".mp3");
    const isWav = safeSrc.toLowerCase().includes(".wav");
    const isOgg = safeSrc.toLowerCase().includes(".ogg");
    const resolvedMime = mediaType === "audio"
      ? (isMp3 ? "audio/mpeg" : isWav ? "audio/wav" : isOgg ? "audio/ogg" : "audio/mp4")
      : "video/mp4";
    return {
      type: mediaType as "video" | "audio",
      poster: poster || "",
      sources: [{ src: safeSrc, type: resolvedMime }],
    } as any;
  }, [src, poster, mediaType]);

  // ── Memoized options ───────────────────────────────────────
  const plyrOptions = useMemo(() => ({
    autoplay: false,
    muted: muted,
    controls: ["play", "progress", "current-time", "duration", "mute", "volume", "settings", "fullscreen"],
    storage: { enabled: false },
    html5: {
      preload: "auto",
      playsinline: true,
    }
  }), [muted]);

  return (
    <div
      className={`relative w-full ${
        fillParent || mediaType === "audio" ? "h-full" : "pt-[56.25%]"
      } ${rounded} bg-black overflow-hidden group ${className} ${fillParent ? "plyr-fill-parent" : ""}`}
      style={{ 
        transform: "translateZ(0)",
        ["--plyr-color-main" as any]: "#0FA6FF",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .plyr-fill-parent .plyr__video-wrapper video {
          object-fit: cover !important;
          height: 100% !important;
        }
        .plyr-fill-parent .plyr {
          height: 100% !important;
        }
        .plyr-has-ticker .plyr__controls {
          margin-bottom: 40px !important;
          background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)) !important;
        }
        .plyr__control--overlaid {
          display: none !important;
        }
      `}} />
      <div className={`${(fillParent || mediaType === "video") ? "absolute inset-0" : "relative h-full"} flex items-center justify-center`}>
        {showSpinner && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all duration-300">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#0FA6FF]/20 border-t-[#0FA6FF] rounded-full animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#0FA6FF]/30 rounded-full animate-pulse" />
            </div>
            {/* <span className="mt-4 text-[10px] text-white/50 uppercase tracking-[0.2em] font-semibold animate-pulse">
              Buffering
            </span> */}
          </div>
        )}
        <div className={`absolute inset-0 transition-all duration-300 ease-out ${
          ready ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
        }`}>
          {isMounted ? (
            <Plyr ref={playerRef} source={source} options={plyrOptions} />
          ) : (
            <div className="w-full h-full bg-black" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseVideoPlayer;

