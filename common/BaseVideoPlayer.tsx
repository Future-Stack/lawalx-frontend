/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "plyr-react/plyr.css";
import type { APITypes } from "plyr-react";
import { Loader2 } from "lucide-react";

const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

// ─── localStorage helpers ──────────────────────────────────────
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
// ──────────────────────────────────────────────────────────────

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
  fillParent?: boolean; // New prop to force h-full instead of aspect-ratio padding
  className?: string; // Standard className override
}

const BaseVideoPlayer = ({
  src,
  poster,
  autoPlay = false,
  muted = true,
  rounded = "rounded-xl",
  mediaType = "video",
  onEnded,
  onPlay,
  onPause,
  fillParent = false,
  className = "",
}: VideoPlayerProps) => {
  const playerRef = useRef<APITypes>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const hasStartedRef = useRef(false);

  // Stable callback refs
  const onEndedRef  = useRef(onEnded);
  const onPlayRef   = useRef(onPlay);
  const onPauseRef  = useRef(onPause);
  onEndedRef.current  = onEnded;
  onPlayRef.current   = onPlay;
  onPauseRef.current  = onPause;

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
        retryTimer = setTimeout(attach, 100);
        return;
      }

      // READY — fires on mount AND every src swap
      const handleReady = () => {
        setReady(true);
        // Always restore saved volume on ready, regardless of autoPlay.
        // For autoPlay: browser needs muted=true to START playing,
        // but we restore volume right after so user hears audio.
        const vol = getSavedVolume();
        if (vol === null) return;

        setTimeout(() => {
          const p = playerRef.current?.plyr as any;
          if (!p) return;
          p.volume = vol;
          // Only unmute if not explicitly muted by prop
          if (!autoPlayRef.current) {
            p.muted = vol === 0;
          }
          // For autoPlay: volume is set in memory.
          // After play() succeeds we unmute (see effect #4).
        }, 50);
      };

      // VOLUMECHANGE — user moved slider → persist
      // Skip saving when volume is 0 AND autoplay is active
      // (that 0 is forced by browser policy, not user intent)
      const handleVolumeChange = () => {
        const p = playerRef.current?.plyr as any;
        if (!p) return;
        const vol = p.volume;
        // Only save if it's a real user change: not the forced-0 from autoplay start
        if (autoPlayRef.current && vol === 0 && p.muted) return;
        setSavedVolume(vol);
      };

      const handlePlaying = () => { setReady(true); onPlayRef.current?.(); };
      const handlePause   = () => onPauseRef.current?.();
      const handleEnded   = () => onEndedRef.current?.();
      const handleCanPlay = () => setReady(true);

      player.on("ready",        handleReady);
      player.on("canplay",      handleCanPlay);
      player.on("playing",      handlePlaying);
      player.on("pause",        handlePause);
      player.on("ended",        handleEnded);
      player.on("volumechange", handleVolumeChange);

      if (player.ready) handleReady();

      return () => {
        try {
          player.off("ready",        handleReady);
          player.off("canplay",      handleCanPlay);
          player.off("playing",      handlePlaying);
          player.off("pause",        handlePause);
          player.off("ended",        handleEnded);
          player.off("volumechange", handleVolumeChange);
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
      if (hasStartedRef.current) {
        // If already started once, just call play directly for smooth resume
        player.play();
        return;
      }

      // Initial Autoplay Sequence: toggle mute so browser allows autoplay
      hasStartedRef.current = true;
      player.muted  = true;
      player.volume = 0;

      const playTimer = setTimeout(() => {
        const p = playerRef.current?.plyr as any;
        if (!p) return;

        const playPromise = p.play();

        // Step 2: after play() resolves, restore real volume
        const restoreVolume = () => {
          const savedVol = getSavedVolume();
          const vol = savedVol ?? 1; // default to full volume if nothing saved
          setTimeout(() => {
            const p2 = playerRef.current?.plyr as any;
            if (!p2) return;
            p2.volume = vol;
            p2.muted  = false; // unmute so user hears audio
          }, 80); // small extra delay after play() settles
        };

        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(restoreVolume).catch(() => {
            console.warn("Autoplay blocked by browser");
          });
        } else {
          restoreVolume();
        }
      }, 50);

      return () => clearTimeout(playTimer);
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
    autoplay: autoPlay,
    muted: muted || autoPlay,
    controls: ["play", "progress", "current-time", "duration", "mute", "volume", "settings", "fullscreen"],
    storage: { enabled: false },
  }), [autoPlay, muted]);

  return (
    <div
      className={`relative w-full ${
        fillParent || mediaType === "audio" ? "h-full" : "pt-[56.25%]"
      } ${rounded} bg-black overflow-hidden group ${className}`}
      style={{ 
        transform: "translateZ(0)",
        ["--plyr-color-main" as any]: "#0FA6FF",
      }}
    >
      <div className={`${(fillParent || mediaType === "video") ? "absolute inset-0" : "relative h-full"} flex items-center justify-center`}>
        {(!ready || !isMounted) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3 transition-opacity duration-300">
            <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
              Initializing
            </span>
          </div>
        )}
        <div className={`absolute inset-0 transition-all duration-700 ease-out ${
          ready ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"
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



// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// "use client";

// import { useRef, useEffect, useState, useMemo } from "react";
// import dynamic from "next/dynamic";
// import "plyr-react/plyr.css";
// import type { APITypes } from "plyr-react";
// import { Loader2 } from "lucide-react";

// // Client-only load
// const Plyr = dynamic(() => import("plyr-react"), { ssr: false });

// interface VideoPlayerProps {
//   src: string;
//   poster?: string;
//   autoPlay?: boolean;
//   muted?: boolean;
//   rounded?: string;
//   onEnded?: () => void;
//   onPlay?: () => void;
//   onPause?: () => void;
// }

// const BaseVideoPlayer = ({
//   src,
//   poster,
//   autoPlay = false,
//   muted = true,
//   rounded = "rounded-xl",
//   onEnded,
//   onPlay,
//   onPause,
// }: VideoPlayerProps) => {
//   const playerRef = useRef<APITypes>(null);
//   const [isMounted, setIsMounted] = useState(false);
//   const [ready, setReady] = useState(false);
//   const [volumeRange, setVolumeRange] = useState<number | null>(null)
//   useEffect(() => {
//     if (!isMounted) return;

//     let timer: NodeJS.Timeout;

//     const setup = () => {
//       const player = playerRef.current?.plyr as any;

//       if (player && typeof player.on === "function") {

//         const handleReady = () => {
//           setReady(true);

//           // ✅ Restore volume from localStorage
//           const savedVolume = localStorage.getItem("volume");
//           if (savedVolume !== null) {
//             const vol = Number(savedVolume);
//             player.volume = vol;
//             player.muted = vol === 0;
//             setVolumeRange(vol);
//           }

//           // ✅ Attach volume listener
//           player.on("volumechange", () => {
//             const vol = player.volume;
//             localStorage.setItem("volume", String(vol));
//             setVolumeRange(vol);
//           });
//         };

//         const handlePlay = () => onPlayRef.current?.();
//         const handlePause = () => onPauseRef.current?.();
//         const handleEnded = () => onEndedRef.current?.();

//         player.on("ready", handleReady);
//         player.on("playing", handlePlay);
//         player.on("pause", handlePause);
//         player.on("ended", handleEnded);

//         return () => {
//           player.off("ready", handleReady);
//           player.off("playing", handlePlay);
//           player.off("pause", handlePause);
//           player.off("ended", handleEnded);
//         };
//       } else {
//         timer = setTimeout(setup, 300);
//       }
//     };

//     const cleanup = setup();

//     return () => {
//       if (timer) clearTimeout(timer);
//       if (cleanup) cleanup();
//     };
//   }, [isMounted]);
//   useEffect(() => {
//     const player = playerRef.current?.plyr as any;

//     if (player && ready) {
//       const savedVolume = localStorage.getItem("volume");

//       if (savedVolume !== null) {
//         const vol = Number(savedVolume);

//         // Apply AFTER source loads
//         setTimeout(() => {
//           player.volume = vol;
//           player.muted = vol === 0;
//           setVolumeRange(vol);
//         }, 50); // small delay ensures Plyr finished updating source
//       }
//     }
//   }, [src, ready]);
//   // Memoize options to include current autoPlay/muted state
//   const plyrOptions = useMemo(() => ({
//     autoplay: autoPlay,
//     muted: muted || autoPlay,
//     controls: [
//       "play",
//   onEndedRef.current = onEnded;
//   onPlayRef.current = onPlay;
//   onPauseRef.current = onPause;


//   useEffect(() => {
//     setIsMounted(true);

//   }, []);

//   // Memoize source so Plyr doesn't re-initialize on unrelated parent re-renders
//   const source = useMemo(() => {
//     const isYouTube = src.includes("youtube.com") || src.includes("youtu.be");

//     if (isYouTube) {
//       return {
//         type: "video" as const,
//         poster: poster || "",
//         sources: [{ src, provider: "youtube" as const }],
//       } as any;
//     }

//     const isAbsolute = src.startsWith("http://") || src.startsWith("https://");
//     const safeSrc = isAbsolute ? src : src.startsWith("/") ? src : "/" + src;

//     return {
//       type: "video" as const,
//       poster: poster || "",
//       sources: [{ src: safeSrc, type: "video/mp4" }],
//     } as any;
//   }, [src, poster]);

//   // Reset ready state when source changes
//   useEffect(() => {
//     setReady(false);
//   }, [src]);

//   // Handle all event listeners once instance is available
//   useEffect(() => {
//     if (!isMounted) return;

//     let timer: NodeJS.Timeout;
//     const initListeners = () => {
//       const instance = playerRef.current?.plyr as any;

//       if (instance && typeof instance.on === "function") {
//         const handleEnded = () => onEndedRef.current?.();
//         const handleReady = () => setReady(true);
//         const handlePlaying = () => {
//           setReady(true);
//           onPlayRef.current?.();
//         };
//         const handlePause = () => onPauseRef.current?.();

//         instance.on("ended", handleEnded);
//         instance.on("ready", handleReady);
//         instance.on("canplay", handleReady);
//         instance.on("playing", handlePlaying);
//         instance.on("pause", handlePause);

//         if (instance.ready) setReady(true);

//         return () => {
//           try {
//             instance.off("ended", handleEnded);
//             instance.off("ready", handleReady);
//             instance.off("canplay", handleReady);
//             instance.off("playing", handlePlaying);
//             instance.off("pause", handlePause);
//           } catch (e) { /* ignore cleanup errors */ }
//         };
//       } else {
//         timer = setTimeout(initListeners, 100);
//       }
//     };

//     const cleanup = initListeners();
//     return () => {
//       if (timer) clearTimeout(timer);
//       if (cleanup) cleanup();
//     };
//   }, [isMounted]); // Only run once on mount

//   // Sync playback with autoPlay prop
//   useEffect(() => {
//     const instance = playerRef.current?.plyr as any;
//     if (instance && ready) {
//       if (autoPlay) {
//         // Mute before playing to satisfy browser policies
//         instance.muted = true;
//         instance.volume = 0;

//         // Small delay to ensure state is registered
//         const playTimer = setTimeout(() => {
//           instance.play()?.catch(() => {
//             console.warn("Autoplay attempt failed or blocked");
//           });
//         }, 50);
//         return () => clearTimeout(playTimer);
//       } else {
//         instance.pause();
//       }
//     }
//   }, [autoPlay, ready, src]);

//   // Sync volume / muted status (for manual overrides)
//   useEffect(() => {
//     const instance = playerRef.current?.plyr as any;
//     if (instance && ready && !autoPlay) {
//       instance.muted = muted;
//       instance.volume = muted ? 0 : 1;
//     }
//   }, [muted, autoPlay, ready]);

//   return (
//     <div
//       className={`relative w-full pt-[56.25%] ${rounded} bg-black overflow-hidden group`}
//       style={{ transform: "translateZ(0)" }}
//     >
//       <div className="absolute inset-0 flex items-center justify-center">
//         {(!ready || !isMounted) && (
//           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black gap-3 transition-opacity duration-300">
//             <Loader2 className="w-8 h-8 animate-spin text-white/50" />
//             <span className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Initializing</span>
//           </div>
//         )}

//         <div className={`absolute inset-0 transition-all duration-700 ease-out ${ready ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg"}`}>
//           {isMounted ? (
//             <Plyr
//               ref={playerRef}
//               source={source}
//               options={plyrOptions}

//             />
//           ) : (
//             <div className="w-full h-full bg-black" />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BaseVideoPlayer;
