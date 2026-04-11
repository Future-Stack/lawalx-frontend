"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";
import type { APITypes } from "plyr-react";
import { Loader2, Music } from "lucide-react";

// Client-only load
const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const BaseAudioPlayer = ({
  src,
  autoPlay = false,
  onEnded,
}: AudioPlayerProps) => {
  const playerRef = useRef<APITypes>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Memoize options for a premium audio experience
  const plyrOptions = useMemo(() => ({
    autoplay: autoPlay,
    controls: [
      "play",
      "progress",
      "current-time",
      "duration",
      "mute",
      "volume",
      "settings",
    ],
    settings: ["speed"],
  }), [autoPlay]);

  // Keep onEnded in a ref
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const source = useMemo(() => {
    const safeSrc = src.startsWith("http") ? src : src.startsWith("/") ? src : "/" + src;
    return {
      type: "audio" as const,
      sources: [{ src: safeSrc, type: "audio/mp3" }],
    } as any;
  }, [src]);

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

  return (
    <div className="relative w-full bg-black/5 dark:bg-white/5 rounded-2xl p-6 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-inner">
      <div className="flex flex-col gap-6">
        {/* Visualizer / Icon Area */}
        <div className="flex items-center justify-center py-4 relative">
          <div className={`transition-all duration-700 ${ready ? "scale-100 opacity-100 blur-0" : "scale-90 opacity-0 blur-md"}`}>
            <div className="w-16 h-16 rounded-full bg-primary-action/10 flex items-center justify-center animate-pulse">
              <Music className="w-8 h-8 text-primary-action" />
            </div>
          </div>

          {(!ready || !isMounted) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-action/40" />
            </div>
          )}
        </div>

        {/* Plyr Instance */}
        <div className={`transition-all duration-1000 ease-out ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          {isMounted ? (
            <div className="modern-audio-player">
              <Plyr
                ref={playerRef}
                source={source}
                options={plyrOptions}
              />
            </div>
          ) : (
            <div className="h-12 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseAudioPlayer;
