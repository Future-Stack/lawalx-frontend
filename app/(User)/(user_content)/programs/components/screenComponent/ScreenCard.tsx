/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  Clock,
  Settings2,
  FilePlay,
  TvMinimal,
  Loader2,
  Music,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Program, WorkoutStatus } from "@/redux/api/users/programs/programs.type";
import { useUpdateSingleProgramMutation } from "@/redux/api/users/programs/programs.api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect } from "react";
import Image from "next/image";
import SyncProgramDialog from "./SyncProgramDialog";
import { getUrl } from "@/lib/content-utils";
dayjs.extend(relativeTime);

interface ScreenCardProps {
  program: Program;
}

const ScreenCard: React.FC<ScreenCardProps> = ({ program }) => {
  const [loading, setLoading] = useState(false);
  const [updateProgram, { isLoading: isUpdating }] = useUpdateSingleProgramMutation();
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const navigate = useRouter();

  // More robust status check (handling case sensitivity)
  const isActiveProp = program.status?.toUpperCase() === "PUBLISH";
  const [localActive, setLocalActive] = useState(isActiveProp);

  // Sync local state with prop when server data updates
  useEffect(() => {
    setLocalActive(isActiveProp);
  }, [isActiveProp]);

  const lastUpdated = dayjs(program.updated_at).fromNow();
  const videos = program.timeline?.filter((t) => t.file?.type === "VIDEO")?.length || 0;
  const images = program.timeline?.filter((t) => t.file?.type === "IMAGE" || t.file?.type === "CONTENT")?.length || 0;
  const audios = program.timeline?.filter((t) => t.file?.type === "AUDIO")?.length || 0;

  const contentParts = [];
  if (videos > 0) contentParts.push(`${videos} video${videos !== 1 ? 's' : ''}`);
  if (audios > 0) contentParts.push(`${audios} audio`);
  if (images > 0) contentParts.push(`${images} image${images !== 1 ? 's' : ''}`);
  const assignedLabel = contentParts.length > 0 ? contentParts.join(", ") : "No media assigned";

  const advance = useCallback(() => {
    if (!program.timeline || program.timeline.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % program.timeline!.length);
      setIsFading(false);
    }, 1500);
  }, [program.timeline]);

  useEffect(() => {
    const timeline = program.timeline;
    if (!timeline || timeline.length <= 1 || !localActive) return;

    const currentItem = timeline[currentIndex];
    if (currentItem?.file?.type === "VIDEO") return;

    const duration = currentItem?.file?.duration ? currentItem.file.duration * 1000 : 7000;
    const timer = setTimeout(advance, Math.max(0, duration - 1500));
    return () => clearTimeout(timer);
  }, [currentIndex, program.timeline, localActive, advance]);

  // Handle autoPlay based on localActive
  useEffect(() => {
    if (videoRef.current) {
      if (localActive) {
        videoRef.current.play().catch(err => console.error("Playback failed", err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [localActive, currentIndex]);

  const currentItem = program.timeline?.[currentIndex];
  const previewData = getUrl(currentItem?.file?.url || "");

  // Preload next item for faster transitions
  const nextIdx = program.timeline && program.timeline.length > 1 ? (currentIndex + 1) % program.timeline.length : -1;
  const nextItem = nextIdx >= 0 ? program.timeline![nextIdx] : null;
  const nextPreviewData = nextItem?.file?.url ? getUrl(nextItem.file.url) : null;

  const programId = program.id || (program as any)._id;

  const handleOnClick = () => {
    setLoading(true);
    navigate.push(`/programs/${programId}`);
  };

  const handlePowerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpdating) return;

    const nextState = !localActive;
    const targetStatus = nextState ? WorkoutStatus.PUBLISH : WorkoutStatus.DRAFT;

    console.log("Power button clicked. Next status:", targetStatus);

    // Immediate UI feedback
    setLocalActive(nextState);

    // Update server state
    updateProgram({
      id: programId,
      data: { status: targetStatus }
    }).unwrap()
      .then(() => {
        console.log("Program status updated successfully to:", targetStatus);
      })
      .catch((err) => {
        console.error("Failed to update program status", err);
        // Revert local state on failure
        setLocalActive(!nextState);
      });
  };

  // Program sync api
  const handleSyncClick = () => {
    setIsSyncOpen(true);
  };

  return (
    <div className="group bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Preload next timeline item for faster transitions */}
      {nextPreviewData && (
        <link
          rel="preload"
          href={nextPreviewData}
          as={nextItem?.file?.type === "VIDEO" ? "video" : nextItem?.file?.type === "AUDIO" ? "fetch" : "image"}
          {...({ fetchPriority: "low" } as any)}
        />
      )}
      {/* Video Section (ONLY this has p-3) */}
      <div className="p-3">
        <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-video">
          <div className={`w-full h-full ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>
            {(currentItem?.file?.type === "IMAGE" || currentItem?.file?.type === "CONTENT" || !currentItem) ? (
              <Image
                src={previewData || "/placeholder.png"}
                alt={program.name}
                width={500}
                height={500}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : currentItem?.file?.type === "AUDIO" ? (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex flex-col items-center justify-center p-4">
                <Music className={`w-10 h-10 text-bgBlue mb-2 ${localActive ? "animate-pulse" : ""}`} />
                <span className="text-[10px] text-white/70 text-center line-clamp-1 px-2">
                  {currentItem.file?.originalName}
                </span>
              </div>
            ) : (
              <video
                key={currentItem.file?.id}
                ref={videoRef}
                src={previewData}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                muted
                playsInline
                preload="auto"
                autoPlay={localActive}
                loop={program.timeline?.length === 1}
                onEnded={advance}
                onCanPlay={(e) => {
                  if (localActive) {
                    e.currentTarget.play().catch(() => { });
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Rest of Content (UNCHANGED padding) */}
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-headings truncate">
          {program.name}
        </h3>
        <p className="text-sm sm:text-base text-body truncate py-1 md:py-2">
          {program.description}
        </p>

        {/* Full-width Divider */}
        <div className="border-t border-borderGray mt-auto mb-6 -mx-4 sm:-mx-6" />

        {/* Info Section */}
        <div className="space-y-2 sm:space-y-3 mb-6 text-sm sm:text-base text-body">
          <div className="flex items-center gap-2">
            <FilePlay className="w-4 h-4 sm:w-5 sm:h-5 text-headings" />
            <span>Assigned Content: {assignedLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <TvMinimal className="w-4 h-4 sm:w-5 sm:h-5 text-headings" /> Assigned Devices:
            <span>
              {program.devices?.length || 0} Device{program.devices?.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-headings" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Manage Button */}
          <button
            type="button"
            onClick={handleOnClick}
            disabled={loading}
            className="w-full shadow-customShadow bg-bgBlue hover:bg-blue-500 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                Managing...
              </>
            ) : (
              <>
                <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
                Manage
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleSyncClick}
            aria-label="Sync Program"
            className="shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
              w-10 h-10 sm:w-12 sm:h-12 shrink-0 cursor-pointer bg-bgBlue hover:bg-blue-500"
            title="Sync Program"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Power Button */}
          <button
            type="button"
            onClick={handlePowerClick}
            disabled={isUpdating}
            aria-label={localActive ? "Turn Off Program" : "Turn On Program"}
            className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
              w-10 h-10 sm:w-12 sm:h-12 shrink-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
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
        </div>
      </div>

      <SyncProgramDialog
        open={isSyncOpen}
        setOpen={setIsSyncOpen}
        programName={program.name}
        devices={program.devices || []}
      />
    </div>
  );
};

export default ScreenCard;






// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import {
//   Clock,
//   Settings2,
//   FilePlay,
//   TvMinimal,
//   Loader2,
//   Music,
//   Play,
//   Pause,
//   RefreshCw,
// } from "lucide-react";
// import React, { useState, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { Program, WorkoutStatus } from "@/redux/api/users/programs/programs.type";
// import { useUpdateSingleProgramMutation, useCreateProgramSyncMutation } from "@/redux/api/users/programs/programs.api";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";
// import { useEffect } from "react";
// import Image from "next/image";
// import { toast } from "sonner";
// dayjs.extend(relativeTime);

// interface ScreenCardProps {
//   program: Program;
// }

// const ScreenCard: React.FC<ScreenCardProps> = ({ program }) => {
//   const [loading, setLoading] = useState(false);
//   const [updateProgram, { isLoading: isUpdating }] = useUpdateSingleProgramMutation();
//   const [createProgramSync, { isLoading: isSyncing }] = useCreateProgramSyncMutation();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isFading, setIsFading] = useState(false);
//   const videoRef = React.useRef<HTMLVideoElement>(null);
//   const navigate = useRouter();

//   // More robust status check (handling case sensitivity)
//   const isActiveProp = program.status?.toUpperCase() === "PUBLISH";
//   const [localActive, setLocalActive] = useState(isActiveProp);

//   // Sync local state with prop when server data updates
//   useEffect(() => {
//     setLocalActive(isActiveProp);
//   }, [isActiveProp]);

//   const lastUpdated = dayjs(program.updated_at).fromNow();
//   const videos = program.timeline?.filter((t) => t.file?.type === "VIDEO")?.length || 0;
//   const images = program.timeline?.filter((t) => t.file?.type === "IMAGE" || t.file?.type === "CONTENT")?.length || 0;
//   const audios = program.timeline?.filter((t) => t.file?.type === "AUDIO")?.length || 0;

//   const contentParts = [];
//   if (videos > 0) contentParts.push(`${videos} video${videos !== 1 ? 's' : ''}`);
//   if (audios > 0) contentParts.push(`${audios} audio`);
//   if (images > 0) contentParts.push(`${images} image${images !== 1 ? 's' : ''}`);
//   const assignedLabel = contentParts.length > 0 ? contentParts.join(", ") : "No media assigned";

//   const getFileUrl = (url: string) => {
//     if (!url) return undefined;
//     if (url.startsWith("http")) return url;
//     const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/api\/v1\/?$/, "");
//     return `${baseUrl}/${url.startsWith("/") ? url.slice(1) : url}`;
//   };

//   const advance = useCallback(() => {
//     if (!program.timeline || program.timeline.length <= 1) return;
//     setIsFading(true);
//     setTimeout(() => {
//       setCurrentIndex((prev) => (prev + 1) % program.timeline!.length);
//       setIsFading(false);
//     }, 1500);
//   }, [program.timeline]);

//   useEffect(() => {
//     const timeline = program.timeline;
//     if (!timeline || timeline.length <= 1 || !localActive) return;

//     const currentItem = timeline[currentIndex];
//     if (currentItem?.file?.type === "VIDEO") return;

//     const duration = currentItem?.file?.duration ? currentItem.file.duration * 1000 : 7000;
//     const timer = setTimeout(advance, Math.max(0, duration - 1500));
//     return () => clearTimeout(timer);
//   }, [currentIndex, program.timeline, localActive, advance]);

//   // Handle autoPlay based on localActive
//   useEffect(() => {
//     if (videoRef.current) {
//       if (localActive) {
//         videoRef.current.play().catch(err => console.error("Playback failed", err));
//       } else {
//         videoRef.current.pause();
//       }
//     }
//   }, [localActive, currentIndex]);

//   const currentItem = program.timeline?.[currentIndex];
//   const previewData = getFileUrl(currentItem?.file?.url || "");

//   const handleOnClick = () => {
//     setLoading(true);
//     navigate.push(`/programs/${program.id}`);
//   };

//   const handlePowerClick = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (isUpdating) return;

//     const nextState = !localActive;
//     const targetStatus = nextState ? WorkoutStatus.PUBLISH : WorkoutStatus.DRAFT;

//     console.log("Power button clicked. Next status:", targetStatus);

//     // Immediate UI feedback
//     setLocalActive(nextState);

//     // Update server state
//     updateProgram({
//       id: program.id,
//       data: { status: targetStatus }
//     }).unwrap()
//       .then(() => {
//         console.log("Program status updated successfully to:", targetStatus);
//       })
//       .catch((err) => {
//         console.error("Failed to update program status", err);
//         // Revert local state on failure
//         setLocalActive(!nextState);
//       });
//   };

//   // Program sync api
//   const handleSyncClick = async () => {
//     try {
//       const res = await createProgramSync({ programId: program.id }).unwrap();
//       if (res?.success) {
//         toast.success(res?.message || "Program synced successfully");
//       } else {
//         toast.error(res?.message || "Failed to sync program");
//       }
//     } catch (err: any) {
//       toast.error(err?.data?.message || "Failed to sync program");
//     }
//   };

//   return (
//     <div className="group bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
//       {/* Video Section (ONLY this has p-3) */}
//       <div className="p-3">
//         <div className="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-video">
//           <div className={`w-full h-full ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>
//             {(currentItem?.file?.type === "IMAGE" || currentItem?.file?.type === "CONTENT" || !currentItem) ? (
//               <Image
//                 src={previewData || "/placeholder.png"}
//                 alt={program.name}
//                 width={500}
//                 height={500}
//                 className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//               />
//             ) : currentItem?.file?.type === "AUDIO" ? (
//               <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black flex flex-col items-center justify-center p-4">
//                 <Music className={`w-10 h-10 text-bgBlue mb-2 ${localActive ? "animate-pulse" : ""}`} />
//                 <span className="text-[10px] text-white/70 text-center line-clamp-1 px-2">
//                   {currentItem.file?.originalName}
//                 </span>
//               </div>
//             ) : (
//               <video
//                 key={currentItem.file?.id}
//                 ref={videoRef}
//                 src={previewData}
//                 className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 muted
//                 playsInline
//                 autoPlay={localActive}
//                 loop={program.timeline?.length === 1}
//                 onEnded={advance}
//                 onCanPlay={(e) => {
//                   if (localActive) {
//                     e.currentTarget.play().catch(() => { });
//                   }
//                 }}
//               />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Rest of Content (UNCHANGED padding) */}
//       <div className="p-4 sm:p-6 flex flex-col flex-grow">
//         {/* Title */}
//         <h3 className="text-base sm:text-lg md:text-xl font-semibold text-headings truncate">
//           {program.name}
//         </h3>
//         <p className="text-sm sm:text-base text-body truncate py-1 md:py-2">
//           {program.description}
//         </p>

//         {/* Full-width Divider */}
//         <div className="border-t border-borderGray mt-auto mb-6 -mx-4 sm:-mx-6" />

//         {/* Info Section */}
//         <div className="space-y-2 sm:space-y-3 mb-6 text-sm sm:text-base text-body">
//           <div className="flex items-center gap-2">
//             <FilePlay className="w-4 h-4 sm:w-5 sm:h-5 text-headings" />
//             <span>Assigned Content: {assignedLabel}</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <TvMinimal className="w-4 h-4 sm:w-5 sm:h-5 text-headings" /> Assigned Devices:
//             <span>
//               {program.devices?.length || 0} Device{program.devices?.length !== 1 ? "s" : ""}
//             </span>
//           </div>

//           <div className="flex items-center gap-2">
//             <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-headings" />
//             <span>Last Updated: {lastUpdated}</span>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex items-center gap-2 sm:gap-4">
//           {/* Manage Button */}
//           <button
//             type="button"
//             onClick={handleOnClick}
//             disabled={loading}
//             className="w-full shadow-customShadow bg-bgBlue hover:bg-blue-500 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
//                 Managing...
//               </>
//             ) : (
//               <>
//                 <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
//                 Manage
//               </>
//             )}
//           </button>

//           {/* Sync Button */}
//           <button
//             type="button"
//             onClick={handleSyncClick}
//             disabled={isSyncing}
//             aria-label="Sync Program"
//             className="shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
//               w-10 h-10 sm:w-12 sm:h-12 shrink-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
//               bg-bgBlue hover:bg-blue-500"
//             title="Sync Program"
//           >
//             <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isSyncing ? "animate-spin" : ""}`} />
//           </button>

//           {/* Power Button */}
//           <button
//             type="button"
//             onClick={handlePowerClick}
//             disabled={isUpdating}
//             aria-label={localActive ? "Turn Off Program" : "Turn On Program"}
//             className={`shadow-customShadow rounded-full transition-all flex items-center justify-center text-white
//               w-10 h-10 sm:w-12 sm:h-12 shrink-0 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed
//               ${localActive
//                 ? "bg-bgBlue hover:bg-blue-500"
//                 : "bg-bgRed hover:bg-red-600"
//               }`}
//             title={localActive ? "Turn Off" : "Turn On"}
//           >
//             {isUpdating ? (
//               <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
//             ) : localActive ? (
//               <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
//             ) : (
//               <Play className="w-4 h-4 sm:w-5 sm:h-5" />
//             )}
//           </button>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default ScreenCard;

