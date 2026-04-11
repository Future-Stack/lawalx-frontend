// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";
import type { APITypes } from "plyr-react";
import { Loader2 } from "lucide-react";

// Client-only load
const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  rounded?: string;
  onEnded?: () => void;
}

const BaseVideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  muted = true,
  rounded = "rounded-xl",
  onEnded,
}: VideoPlayerProps) => {
  const playerRef = useRef<APITypes>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Memoize options to include current autoPlay/muted state
  const plyrOptions = useMemo(() => ({
    autoplay: autoPlay,
    muted: muted || autoPlay,
    volume: (muted || autoPlay) ? 0 : 1,
    controls: [
      "play",
      "progress",
      "current-time",
      "duration",
      "mute",
      "volume",
      "settings",
      "fullscreen",
    ],
  }), [autoPlay, muted]);

  // Keep onEnded in a ref so it never triggers effect re-runs
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Memoize source so Plyr doesn't re-initialize on unrelated parent re-renders
  const source = useMemo(() => {
    const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");

    if (isYouTube) {
      return {
        type: "video" as const,
        poster: poster || "",
        sources: [{ src, provider: "youtube" as const }],
      } as any;
    }

    const isAbsolute = src.startsWith("http://") || src.startsWith("https://");
    const safeSrc = isAbsolute ? src : src.startsWith("/") ? src : "/" + src;

    return {
      type: "video" as const,
      poster: poster || "",
      sources: [{ src: safeSrc, type: "video/mp4" }],
    } as any;
  }, [src, poster]);

  // Reset ready state when source changes
  useEffect(() => {
    setReady(false);
  }, [src]);

  // Handle all event listeners once instance is available
  useEffect(() => {
    if (!isMounted) return;

    let timer: NodeJS.Timeout;
    const initListeners = () => {
      const instance = playerRef.current?.plyr as any;

      if (instance && typeof instance.on === "function") {
        const handleEnded = () => onEndedRef.current?.();
        const handleReady = () => setReady(true);
        const handlePlaying = () => setReady(true);

        instance.on("ended", handleEnded);
        instance.on("ready", handleReady);
        instance.on("canplay", handleReady);
        instance.on("playing", handlePlaying);

        if (instance.ready) setReady(true);

        return () => {
          try {
            instance.off("ended", handleEnded);
            instance.off("ready", handleReady);
            instance.off("canplay", handleReady);
            instance.off("playing", handlePlaying);
          } catch (e) { /* ignore cleanup errors */ }
        };
      } else {
        timer = setTimeout(initListeners, 100);
      }
    };

    const cleanup = initListeners();
    return () => {
      if (timer) clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [isMounted]); // Only run once on mount

  // Sync playback with autoPlay prop
  useEffect(() => {
    const instance = playerRef.current?.plyr as any;
    if (instance && ready) {
      if (autoPlay) {
        // Mute before playing to satisfy browser policies
        instance.muted = true;
        instance.volume = 0;
        
        // Small delay to ensure state is registered
        const playTimer = setTimeout(() => {
          instance.play()?.catch(() => {
            console.warn("Autoplay attempt failed or blocked");
          });
        }, 50);
        return () => clearTimeout(playTimer);
      } else {
        instance.pause();
      }
    }
  }, [autoPlay, ready, src]);

  // Sync volume / muted status (for manual overrides)
  useEffect(() => {
    const instance = playerRef.current?.plyr as any;
    if (instance && ready && !autoPlay) {
      instance.muted = muted;
      instance.volume = muted ? 0 : 1;
    }
  }, [muted, autoPlay, ready]);

  return (
    <div
      className={`relative w-full pt-[56.25%] ${rounded} bg-black overflow-hidden group`}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {(!ready || !isMounted) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3 transition-opacity duration-300">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Initializing</span>
          </div>
        )}

        <div className={`absolute inset-0 transition-all duration-700 ease-out ${ready ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"}`}>
          {isMounted ? (
            <Plyr
              ref={playerRef}
              source={source}
              options={plyrOptions}
            />
          ) : (
            <div className="w-full h-full bg-black" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseVideoPlayer;
