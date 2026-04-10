// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";
import type { APITypes } from "plyr-react";

// Client-only load
const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  rounded?: string;
  onEnded?: () => void;
}

const PLYR_OPTIONS = {
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
};

const BaseVideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  rounded = "rounded-xl",
  onEnded,
}: VideoPlayerProps) => {
  const playerRef = useRef<APITypes>(null);
  const [isMounted, setIsMounted] = useState(false);
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

  useEffect(() => {
    if (!isMounted) return;

    let timer: NodeJS.Timeout;
    let checkCount = 0;
    const maxChecks = 20;

    const initPlayer = () => {
      const instance = playerRef.current?.plyr;

      if (instance && typeof instance.on === "function") {
        const handleEnded = () => {
          // Use ref so this closure never goes stale
          onEndedRef.current?.();
        };

        instance.on("ended", handleEnded);

        if (autoPlay) {
          setTimeout(() => {
            const playResult = instance.play?.();
            if (playResult instanceof Promise) {
              playResult.catch(() => {
                console.warn("Autoplay blocked by browser");
              });
            }
          }, 200);
        }

        return () => {
          try {
            if (instance && typeof instance.off === "function") {
              instance.off("ended", handleEnded);
            }
            if (instance && typeof instance.pause === "function") {
              instance.pause();
            }
          } catch {
            // Plyr might already be destroyed, ignore these errors
          }
        };
      } else if (checkCount < maxChecks) {
        checkCount++;
        timer = setTimeout(initPlayer, 100);
      }
    };

    const cleanup = initPlayer();

    return () => {
      if (timer) clearTimeout(timer);
      if (cleanup) cleanup();
    };
    // onEnded intentionally excluded — we use onEndedRef to avoid stale closures
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, autoPlay, isMounted]);

  return (
    <div
      className={`relative w-full pt-[56.25%] ${rounded} bg-black overflow-hidden`}
      style={{ transform: "translateZ(0)" }}
    >
      <div className="absolute inset-0">
        {isMounted ? (
          <Plyr
            ref={playerRef}
            source={source}
            options={PLYR_OPTIONS}
          />
        ) : (
          <div className="w-full h-full bg-black" />
        )}
      </div>
    </div>
  );
};

export default BaseVideoPlayer;
