// previous code important

// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState, useRef, useCallback, useEffect } from "react";

// import { X, Trash2, CheckCircle, UploadCloud } from "lucide-react";
// import { toast } from "sonner";
// import { useDispatch, useSelector } from "react-redux";
// import { baseApi } from "@/redux/api/baseApi";

// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";

// type UploadStatus =
//   | "pending"
//   | "simulating"
//   | "ready"
//   | "uploading"
//   | "done"
//   | "error";

// interface FileEntry {
//   id: string;
//   file: File;
//   progress: number;
//   status: UploadStatus;
//   uploaded: number;
//   responseData?: any;
// }

// interface UploadFileModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   setIsPageLoading: (loading: boolean) => void;
//   onSuccess?: (files: any[]) => void;
//   programId?: string; // ⬅ Optional programId
// }

// const ALLOWED_TYPES = [
//   "video/mp4",
//   "video/mkv",
//   "video/x-matroska",
//   "audio/mpeg",
//   "audio/mp3",
//   "image/png",
//   "image/jpeg",
//   "image/gif",
//   "image/webp",
// ];

// function formatBytes(bytes: number): string {
//   if (bytes < 1024) return `${bytes} B`;
//   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
//   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
// }

// function getExtBadge(file: File) {
//   const name = file.name.toLowerCase();
//   const type = file.type.toLowerCase();
//   if (type.startsWith("video/")) {
//     if (name.endsWith(".mkv")) return { label: "MKV", bg: "#6B7280" };
//     return { label: "MP4", bg: "#3B82F6" };
//   }
//   if (type.startsWith("audio/")) return { label: "MP3", bg: "#EC4899" };
//   if (name.endsWith(".gif")) return { label: "GIF", bg: "#F59E0B" };
//   if (name.endsWith(".png")) return { label: "PNG", bg: "#10B981" };
//   return { label: "IMG", bg: "#8B5CF6" };
// }

// function genId() {
//   return Math.random().toString(36).slice(2);
// }

// function getUploadErrorMessage(error: any) {
//   if (typeof error?.data?.message === "string") return error.data.message;
//   if (Array.isArray(error?.data?.message)) return error.data.message.join(", ");
//   if (typeof error?.message === "string") return error.message;
//   if (typeof error?.error === "string") return error.error;
//   return "Something went wrong. Please try again.";
// }

// const uploadFileCustom = (
//   entry: FileEntry,
//   programId: string | undefined,
//   token: string | null,
//   currency: string | null,
//   onProgress: (progress: number, uploaded: number) => void,
// ): Promise<any> => {
//   return new Promise((resolve, reject) => {
//     const xhr = new XMLHttpRequest();

//     const params = new URLSearchParams();
//     if (programId) params.append("programId", programId);
//     const queryString = params.toString();

//     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
//     const normalizedBaseUrl = baseUrl.endsWith("/")
//       ? baseUrl.slice(0, -1)
//       : baseUrl;

//     // Construct absolute URL if baseUrl is relative, to bypass Next.js dev server rewrite proxy
//     let url = "";
//     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
//     if (
//       normalizedBaseUrl.startsWith("/") &&
//       socketUrl &&
//       (socketUrl.startsWith("http://") || socketUrl.startsWith("https://"))
//     ) {
//       const normalizedSocketUrl = socketUrl.endsWith("/")
//         ? socketUrl.slice(0, -1)
//         : socketUrl;
//       url = `${normalizedSocketUrl}${normalizedBaseUrl}/content/upload-file${queryString ? `?${queryString}` : ""}`;
//     } else {
//       url = `${normalizedBaseUrl}/content/upload-file${queryString ? `?${queryString}` : ""}`;
//     }

//     xhr.open("POST", url, true);

//     if (token) {
//       xhr.setRequestHeader("authorization", token);
//     }
//     xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
//     if (currency) {
//       xhr.setRequestHeader("X-Display-Currency", currency);
//     }

//     xhr.upload.addEventListener("progress", (event) => {
//       if (event.lengthComputable) {
//         const progress = Math.round((event.loaded / event.total) * 100);
//         onProgress(progress, event.loaded);
//       }
//     });

//     xhr.onload = () => {
//       let response: any;
//       try {
//         response = JSON.parse(xhr.responseText);
//       } catch {
//         response = xhr.responseText;
//       }

//       if (xhr.status >= 200 && xhr.status < 300) {
//         resolve(response);
//       } else {
//         reject({
//           status: xhr.status,
//           data: response,
//           message:
//             response?.message || `Upload failed with status ${xhr.status}`,
//         });
//       }
//     };

//     xhr.onerror = () => {
//       reject({
//         message: "Network error occurred during file upload.",
//       });
//     };

//     xhr.onabort = () => {
//       reject({
//         message: "Upload aborted.",
//       });
//     };

//     const formData = new FormData();
//     formData.append("file", entry.file);
//     if (programId) {
//       formData.append("programId", programId);
//     }

//     xhr.send(formData);
//   });
// };

// export default function UploadFileModal({
//   isOpen,
//   onClose,
//   setIsPageLoading,
//   onSuccess,
//   programId: propProgramId,
// }: UploadFileModalProps) {
//   const programId = propProgramId;
//   const dispatch = useDispatch();
//   const token = useSelector((state: any) => state.auth.token);
//   const currency = useSelector((state: any) => state.settings.currency);
//   // User Profile
//   const { data: userProfile } = useGetUserProfileQuery(undefined);
//   const userInfo = userProfile?.data;

//   console.log("user data in modal", userInfo);

//   const [files, setFiles] = useState<FileEntry[]>([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const progressIntervalsRef = useRef<
//     Record<string, ReturnType<typeof setInterval>>
//   >({});
//   const simulationPromisesRef = useRef<Record<string, Promise<void>>>({});
//   const stuckTimeoutsRef = useRef<
//     Record<string, ReturnType<typeof setTimeout>>
//   >({});

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//     } else {
//       Object.values(progressIntervalsRef.current).forEach(clearInterval);
//       progressIntervalsRef.current = {};
//       setFiles([]);
//       setIsDragging(false);
//       setIsPageLoading(false);
//     }
//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen, setIsPageLoading]);

//   const stopProgressSimulation = useCallback((id: string) => {
//     clearInterval(progressIntervalsRef.current[id]);
//     delete progressIntervalsRef.current[id];
//   }, []);

//   const handleRemove = useCallback(
//     (id: string) => {
//       stopProgressSimulation(id);
//       setFiles((prev) => prev.filter((f) => f.id !== id));
//     },
//     [stopProgressSimulation],
//   );

//   const runProgressSimulation = useCallback(
//     (id: string, fileSize: number): Promise<void> => {
//       const promise = new Promise<void>((resolve) => {
//         setFiles((prev) =>
//           prev.map((f) =>
//             f.id === id ? { ...f, status: "simulating", progress: 5 } : f,
//           ),
//         );

//         const maybeSetStuckTimeout = (progress: number) => {
//           if (progress >= 90 && !stuckTimeoutsRef.current[id]) {
//             stuckTimeoutsRef.current[id] = setTimeout(() => {
//               setFiles((prev) =>
//                 prev.map((f) =>
//                   f.id === id
//                     ? {
//                         ...f,
//                         progress: 100,
//                         uploaded: fileSize,
//                         status: "simulating",
//                       }
//                     : f,
//                 ),
//               );
//               setTimeout(() => {
//                 setFiles((prev) =>
//                   prev.map((f) =>
//                     f.id === id ? { ...f, status: "ready" } : f,
//                   ),
//                 );
//                 clearInterval(interval);
//                 delete progressIntervalsRef.current[id];
//                 delete simulationPromisesRef.current[id];
//                 clearTimeout(stuckTimeoutsRef.current[id]);
//                 delete stuckTimeoutsRef.current[id];
//                 resolve();
//               }, 300);
//             }, 2000);
//           }
//         };

//         const interval = setInterval(() => {
//           setFiles((prev) => {
//             const entry = prev.find((f) => f.id === id);
//             if (!entry) {
//               clearInterval(interval);
//               if (stuckTimeoutsRef.current[id]) {
//                 clearTimeout(stuckTimeoutsRef.current[id]);
//                 delete stuckTimeoutsRef.current[id];
//               }
//               resolve();
//               return prev;
//             }

//             let increment = 10;
//             if (fileSize <= 2 * 1024 * 1024) {
//               increment = 15;
//             } else if (fileSize <= 10 * 1024 * 1024) {
//               increment = 10;
//             } else {
//               increment = 5;
//             }
//             let nextProgress = entry.progress + increment;
//             let forceComplete = false;
//             if (nextProgress >= 95) {
//               nextProgress = 100;
//               forceComplete = true;
//             }
//             const nextUploaded = Math.round((nextProgress / 100) * fileSize);

//             maybeSetStuckTimeout(nextProgress);

//             if (nextProgress >= 100 || forceComplete) {
//               clearInterval(interval);
//               if (stuckTimeoutsRef.current[id]) {
//                 clearTimeout(stuckTimeoutsRef.current[id]);
//                 delete stuckTimeoutsRef.current[id];
//               }
//               setTimeout(() => {
//                 setFiles((prev) =>
//                   prev.map((f) =>
//                     f.id === id ? { ...f, status: "ready" } : f,
//                   ),
//                 );
//                 delete progressIntervalsRef.current[id];
//                 delete simulationPromisesRef.current[id];
//                 resolve();
//               }, 300);
//               return prev.map((f) =>
//                 f.id === id
//                   ? {
//                       ...f,
//                       progress: 100,
//                       uploaded: fileSize,
//                       status: "simulating",
//                     }
//                   : f,
//               );
//             }

//             return prev.map((f) =>
//               f.id === id
//                 ? { ...f, progress: nextProgress, uploaded: nextUploaded }
//                 : f,
//             );
//           });
//         }, 300);

//         progressIntervalsRef.current[id] = interval;
//       });

//       simulationPromisesRef.current[id] = promise;
//       return promise;
//     },
//     [],
//   );

//   const addFiles = useCallback(
//     (incoming: FileList | File[]) => {
//       const arr = Array.from(incoming);
//       const valid = arr.filter((f) => {
//         const ok =
//           ALLOWED_TYPES.includes(f.type) ||
//           f.name.toLowerCase().endsWith(".mkv");
//         if (!ok) toast.error(`"${f.name}" is not a supported file type.`);
//         return ok;
//       });
//       if (valid.length === 0) return;
//       const entries: FileEntry[] = valid.map((f) => ({
//         id: genId(),
//         file: f,
//         progress: 0,
//         status: "pending",
//         uploaded: 0,
//       }));
//       setFiles((prev) => [...prev, ...entries]);

//       entries.forEach((entry) => {
//         runProgressSimulation(entry.id, entry.file.size);
//       });
//     },
//     [runProgressSimulation],
//   );

//   const handleDone = async () => {
//     if (files.length === 0) {
//       return;
//     }

//     setIsPageLoading(true);

//     try {
//       const filesToUpload = files.filter(
//         (f) =>
//           f.status === "ready" ||
//           f.status === "pending" ||
//           f.status === "simulating",
//       );

//       if (filesToUpload.length === 0) {
//         return;
//       }

//       let hasErrorOccurred = false;
//       let successCount = 0;
//       let failureCount = 0;
//       let firstErrorMessage = "";
//       const BATCH_SIZE = 4;

//       let lastSuccessMessage = "";
//       const uploadedResults: any[] = [];
//       for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
//         const batch = filesToUpload.slice(i, i + BATCH_SIZE);

//         await Promise.all(
//           batch.map(async (entry) => {
//             if (entry.status !== "ready") {
//               const simulationPromise = simulationPromisesRef.current[entry.id];
//               if (simulationPromise) {
//                 await simulationPromise;
//               }
//             }

//             try {
//               setFiles((prev) =>
//                 prev.map((f) =>
//                   f.id === entry.id
//                     ? { ...f, status: "uploading", progress: 0 }
//                     : f,
//                 ),
//               );

//               const res = await uploadFileCustom(
//                 entry,
//                 programId,
//                 token,
//                 currency,
//                 (progress, uploaded) => {
//                   setFiles((prev) =>
//                     prev.map((f) =>
//                       f.id === entry.id ? { ...f, progress, uploaded } : f,
//                     ),
//                   );
//                 },
//               );

//               if (res?.message) {
//                 lastSuccessMessage = res.message;
//               }

//               successCount++;
//               if (res?.data) {
//                 uploadedResults.push(res.data);
//               }

//               setFiles((prev) =>
//                 prev.map((f) =>
//                   f.id === entry.id
//                     ? ({
//                         ...f,
//                         status: "done",
//                         progress: 100,
//                         uploaded: entry.file.size,
//                         responseData: res.data,
//                       } as any)
//                     : f,
//                 ),
//               );
//             } catch (fileError: any) {
//               hasErrorOccurred = true;
//               failureCount++;
//               if (!firstErrorMessage) {
//                 firstErrorMessage = getUploadErrorMessage(fileError);
//               }
//               setFiles((prev) =>
//                 prev.map((f) =>
//                   f.id === entry.id
//                     ? { ...f, status: "error", progress: 0 }
//                     : f,
//                 ),
//               );
//             }
//           }),
//         );
//       }

//       dispatch(baseApi.util.invalidateTags(["Content"] as any));

//       if (!hasErrorOccurred) {
//         const hasVideo = filesToUpload.some(
//           (f) =>
//             f.file.type.startsWith("video/") ||
//             f.file.name.toLowerCase().endsWith(".mkv"),
//         );
//         if (!hasVideo) {
//           toast.success(
//             lastSuccessMessage ||
//               (filesToUpload.length > 1
//                 ? `All ${filesToUpload.length} files uploaded successfully!`
//                 : "File uploaded successfully!"),
//           );
//         }

//         if (uploadedResults.length > 0 && onSuccess) {
//           onSuccess(uploadedResults);
//         }

//         // Auto-close on successful upload
//         setIsPageLoading(false);
//         onClose();
//       } else {
//         toast.error(
//           firstErrorMessage ||
//             `Upload completed with errors. ${successCount} succeeded, ${failureCount} failed.`,
//         );
//         // If at least some succeeded, we should still pass them back but maybe not close automatically if there are errors to show
//         if (uploadedResults.length > 0 && onSuccess) {
//           onSuccess(uploadedResults);
//         }
//       }
//     } catch (error: any) {
//       toast.error(getUploadErrorMessage(error));
//     } finally {
//       setIsPageLoading(false);
//     }
//   };

//   const handleDropZoneClick = useCallback(
//     () => fileInputRef.current?.click(),
//     [],
//   );

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback(() => setIsDragging(false), []);

//   const handleDrop = useCallback(
//     (e: React.DragEvent) => {
//       e.preventDefault();
//       setIsDragging(false);
//       if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
//     },
//     [addFiles],
//   );

//   const handleInputChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       if (e.target.files && e.target.files.length > 0) {
//         addFiles(e.target.files);
//         e.target.value = "";
//       }
//     },
//     [addFiles],
//   );

//   const hasFiles = files.length > 0;
//   const isUploading = files.some((f) => f.status === "uploading");

//   return (
//     <Dialog
//       open={isOpen}
//       onOpenChange={() => {
//         if (!isUploading) onClose();
//       }}
//     >
//       <DialogContent
//         showCloseButton={false}
//         onPointerDownOutside={(e: { preventDefault: () => void }) =>
//           e.preventDefault()
//         }
//         onInteractOutside={(e: { preventDefault: () => void }) =>
//           e.preventDefault()
//         }
//         className="p-0 border-none bg-transparent shadow-none max-w-[560px] w-full outline-none z-[10000]"
//       >
//         <DialogTitle className="sr-only">Upload File</DialogTitle>
//         <DialogDescription className="sr-only">
//           Upload your media files to the program timeline.
//         </DialogDescription>

//         <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-gray-200 dark:border-gray-700 w-full">
//           <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
//             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
//               Upload File
//             </h2>
//             <button
//               onClick={onClose}
//               disabled={isUploading}
//               aria-label="Close"
//               className="text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-all cursor-pointer group"
//             >
//               <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
//             </button>
//           </div>

//           <div className="flex-1 overflow-y-auto">
//             <div className="px-5 sm:px-6 pt-5 pb-3 space-y-4">
//               <div
//                 onClick={handleDropZoneClick}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//                 className={`cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 sm:py-10 px-4 transition-colors select-none ${
//                   isDragging
//                     ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
//                     : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
//                 }`}
//               >
//                 <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
//                   <UploadCloud className="w-6 h-6 text-gray-500 dark:text-gray-400" />
//                 </div>
//                 <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
//                   <span className="font-semibold text-[#7F56D9] cursor-pointer hover:underline">
//                     Click to upload
//                   </span>{" "}
//                   or drag and drop
//                 </p>
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
//                   MP4, PNG, JPG or GIF (max. 500MB)
//                 </p>
//               </div>

//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="video/mp4,video/x-matroska,.mkv,audio/mpeg,audio/mp3,image/png,image/jpeg,image/gif,image/webp"
//                 multiple
//                 className="hidden"
//                 onChange={handleInputChange}
//               />

//               {hasFiles && (
//                 <div className="space-y-3 pb-1">
//                   {files.map((entry) => {
//                     const badge = getExtBadge(entry.file);
//                     const isDone = entry.status === "done";
//                     const isError = entry.status === "error";
//                     const isEntryUploading = entry.status === "uploading";

//                     return (
//                       <div
//                         key={entry.id}
//                         className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
//                       >
//                         <div className="relative shrink-0 mt-0.5">
//                           <svg
//                             width="36"
//                             height="44"
//                             viewBox="0 0 36 44"
//                             fill="none"
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="text-gray-200 dark:text-gray-600"
//                           >
//                             <path
//                               d="M0 4C0 1.79086 1.79086 0 4 0H22L36 14V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
//                               fill="currentColor"
//                             />
//                             <path
//                               d="M22 0L36 14H26C23.7909 14 22 12.2091 22 10V0Z"
//                               fill="#D1D5DB"
//                             />
//                           </svg>
//                           <span
//                             className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[8px] font-bold px-1 py-0.5 rounded"
//                             style={{ backgroundColor: badge.bg }}
//                           >
//                             {badge.label}
//                           </span>
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight mb-0.5">
//                             {entry.file.name}
//                           </p>
//                           <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
//                             <span>
//                               {formatBytes(entry.uploaded)} of{" "}
//                               {formatBytes(entry.file.size)}
//                             </span>
//                             <span className="text-gray-300 dark:text-gray-600">
//                               |
//                             </span>
//                             {isDone || entry.status === "ready" ? (
//                               <span className="flex items-center gap-1 text-green-500 font-medium">
//                                 <CheckCircle className="w-3.5 h-3.5" />
//                                 Complete
//                               </span>
//                             ) : isError ? (
//                               <span className="text-red-500 font-medium">
//                                 Failed
//                               </span>
//                             ) : isEntryUploading ||
//                               entry.status === "simulating" ? (
//                               <span className="flex items-center gap-1 text-blue-500 font-medium">
//                                 <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
//                                 {isEntryUploading
//                                   ? "Uploading..."
//                                   : "Processing..."}
//                               </span>
//                             ) : (
//                               <span className="text-gray-400 dark:text-gray-500">
//                                 Ready to upload
//                               </span>
//                             )}
//                           </div>

//                           <div className="flex items-center gap-2">
//                             <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
//                               <div
//                                 className={`h-full rounded-full transition-all duration-300 ${
//                                   isError
//                                     ? "bg-red-400"
//                                     : isDone || entry.status === "ready"
//                                       ? "bg-green-400"
//                                       : "bg-violet-500"
//                                 }`}
//                                 style={{ width: `${entry.progress}%` }}
//                               />
//                             </div>
//                             <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">
//                               {entry.progress}%
//                             </span>
//                           </div>
//                         </div>

//                         <button
//                           onClick={() => handleRemove(entry.id)}
//                           disabled={isEntryUploading}
//                           className={`shrink-0 transition-colors mt-0.5 p-0.5 ${
//                             isEntryUploading
//                               ? "text-gray-200 dark:text-gray-600 cursor-not-allowed"
//                               : "text-gray-400 hover:text-red-500 cursor-pointer"
//                           }`}
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="shrink-0 flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
//             <button
//               onClick={onClose}
//               disabled={isUploading}
//               className={`flex-1 py-2.5 border border-border rounded-xl text-sm font-medium transition-colors shadow-customShadow ${
//                 isUploading
//                   ? "text-gray-300 cursor-not-allowed"
//                   : "text-body hover:bg-gray-50 cursor-pointer"
//               }`}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDone}
//               disabled={isUploading || !hasFiles}
//               className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-customShadow text-white ${
//                 isUploading || !hasFiles
//                   ? "bg-blue-300 cursor-not-allowed"
//                   : "bg-bgBlue hover:bg-blue-500 cursor-pointer"
//               }`}
//             >
//               {isUploading ? "Uploading..." : "Upload Content"}
//             </button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }




// update code 

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useCallback, useEffect } from "react";

import { X, Trash2, CheckCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { baseApi } from "@/redux/api/baseApi";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";
import { UploadLimitModal } from "./UploadLimitModal";
import { useGetAllFilesQuery } from "@/redux/api/users/content/content.api";

type UploadStatus =
  | "pending"
  | "simulating"
  | "ready"
  | "uploading"
  | "done"
  | "error";

interface FileEntry {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  uploaded: number;
  responseData?: any;
}

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  setIsPageLoading: (loading: boolean) => void;
  onSuccess?: (files: any[]) => void;
  programId?: string; // ⬅ Optional programId
}

const ALLOWED_TYPES = [
  "video/mp4",
  "video/mkv",
  "video/x-matroska",
  "audio/mpeg",
  "audio/mp3",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExtBadge(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  if (type.startsWith("video/")) {
    if (name.endsWith(".mkv")) return { label: "MKV", bg: "#6B7280" };
    return { label: "MP4", bg: "#3B82F6" };
  }
  if (type.startsWith("audio/")) return { label: "MP3", bg: "#EC4899" };
  if (name.endsWith(".gif")) return { label: "GIF", bg: "#F59E0B" };
  if (name.endsWith(".png")) return { label: "PNG", bg: "#10B981" };
  return { label: "IMG", bg: "#8B5CF6" };
}

function genId() {
  return Math.random().toString(36).slice(2);
}

function getUploadErrorMessage(error: any) {
  if (typeof error?.data?.message === "string") return error.data.message;
  if (Array.isArray(error?.data?.message)) return error.data.message.join(", ");
  if (typeof error?.message === "string") return error.message;
  if (typeof error?.error === "string") return error.error;
  return "Something went wrong. Please try again.";
}

const uploadFileCustom = (
  entry: FileEntry,
  programId: string | undefined,
  token: string | null,
  currency: string | null,
  onProgress: (progress: number, uploaded: number) => void,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    const params = new URLSearchParams();
    if (programId) params.append("programId", programId);
    const queryString = params.toString();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const normalizedBaseUrl = baseUrl.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;

    // Construct absolute URL if baseUrl is relative, to bypass Next.js dev server rewrite proxy
    let url = "";
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    if (
      normalizedBaseUrl.startsWith("/") &&
      socketUrl &&
      (socketUrl.startsWith("http://") || socketUrl.startsWith("https://"))
    ) {
      const normalizedSocketUrl = socketUrl.endsWith("/")
        ? socketUrl.slice(0, -1)
        : socketUrl;
      url = `${normalizedSocketUrl}${normalizedBaseUrl}/content/upload-file${queryString ? `?${queryString}` : ""}`;
    } else {
      url = `${normalizedBaseUrl}/content/upload-file${queryString ? `?${queryString}` : ""}`;
    }

    xhr.open("POST", url, true);

    if (token) {
      xhr.setRequestHeader("authorization", token);
    }
    xhr.setRequestHeader("ngrok-skip-browser-warning", "true");
    if (currency) {
      xhr.setRequestHeader("X-Display-Currency", currency);
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress, event.loaded);
      }
    });

    xhr.onload = () => {
      let response: any;
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        response = xhr.responseText;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject({
          status: xhr.status,
          data: response,
          message:
            response?.message || `Upload failed with status ${xhr.status}`,
        });
      }
    };

    xhr.onerror = () => {
      reject({
        message: "Network error occurred during file upload.",
      });
    };

    xhr.onabort = () => {
      reject({
        message: "Upload aborted.",
      });
    };

    const formData = new FormData();
    formData.append("file", entry.file);
    if (programId) {
      formData.append("programId", programId);
    }

    xhr.send(formData);
  });
};

export default function UploadFileModal({
  isOpen,
  onClose,
  setIsPageLoading,
  onSuccess,
  programId: propProgramId,
}: UploadFileModalProps) {
  const programId = propProgramId;
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.token);
  const currency = useSelector((state: any) => state.settings.currency);
  // User Profile
  const { data: userProfile } = useGetUserProfileQuery(undefined);
  const userInfo = userProfile?.data;

  console.log("user data in modal", userInfo);

  const { data: allFilesRes } = useGetAllFilesQuery(undefined, { skip: !isOpen });

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);

  const isFreePlan = !userInfo?.plan?.name || 
                     userInfo?.plan?.name?.toLowerCase().includes("free");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalsRef = useRef<
    Record<string, ReturnType<typeof setInterval>>
  >({});
  const simulationPromisesRef = useRef<Record<string, Promise<void>>>({});
  const stuckTimeoutsRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      Object.values(progressIntervalsRef.current).forEach(clearInterval);
      progressIntervalsRef.current = {};
      setFiles([]);
      setIsDragging(false);
      setIsPageLoading(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setIsPageLoading]);

  const stopProgressSimulation = useCallback((id: string) => {
    clearInterval(progressIntervalsRef.current[id]);
    delete progressIntervalsRef.current[id];
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      stopProgressSimulation(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [stopProgressSimulation],
  );

  const runProgressSimulation = useCallback(
    (id: string, fileSize: number): Promise<void> => {
      const promise = new Promise<void>((resolve) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "simulating", progress: 5 } : f,
          ),
        );

        const maybeSetStuckTimeout = (progress: number) => {
          if (progress >= 90 && !stuckTimeoutsRef.current[id]) {
            stuckTimeoutsRef.current[id] = setTimeout(() => {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === id
                    ? {
                        ...f,
                        progress: 100,
                        uploaded: fileSize,
                        status: "simulating",
                      }
                    : f,
                ),
              );
              setTimeout(() => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === id ? { ...f, status: "ready" } : f,
                  ),
                );
                clearInterval(interval);
                delete progressIntervalsRef.current[id];
                delete simulationPromisesRef.current[id];
                clearTimeout(stuckTimeoutsRef.current[id]);
                delete stuckTimeoutsRef.current[id];
                resolve();
              }, 300);
            }, 2000);
          }
        };

        const interval = setInterval(() => {
          setFiles((prev) => {
            const entry = prev.find((f) => f.id === id);
            if (!entry) {
              clearInterval(interval);
              if (stuckTimeoutsRef.current[id]) {
                clearTimeout(stuckTimeoutsRef.current[id]);
                delete stuckTimeoutsRef.current[id];
              }
              resolve();
              return prev;
            }

            let increment = 10;
            if (fileSize <= 2 * 1024 * 1024) {
              increment = 15;
            } else if (fileSize <= 10 * 1024 * 1024) {
              increment = 10;
            } else {
              increment = 5;
            }
            let nextProgress = entry.progress + increment;
            let forceComplete = false;
            if (nextProgress >= 95) {
              nextProgress = 100;
              forceComplete = true;
            }
            const nextUploaded = Math.round((nextProgress / 100) * fileSize);

            maybeSetStuckTimeout(nextProgress);

            if (nextProgress >= 100 || forceComplete) {
              clearInterval(interval);
              if (stuckTimeoutsRef.current[id]) {
                clearTimeout(stuckTimeoutsRef.current[id]);
                delete stuckTimeoutsRef.current[id];
              }
              setTimeout(() => {
                setFiles((prev) =>
                  prev.map((f) =>
                    f.id === id ? { ...f, status: "ready" } : f,
                  ),
                );
                delete progressIntervalsRef.current[id];
                delete simulationPromisesRef.current[id];
                resolve();
              }, 300);
              return prev.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      progress: 100,
                      uploaded: fileSize,
                      status: "simulating",
                    }
                  : f,
              );
            }

            return prev.map((f) =>
              f.id === id
                ? { ...f, progress: nextProgress, uploaded: nextUploaded }
                : f,
            );
          });
        }, 300);

        progressIntervalsRef.current[id] = interval;
      });

      simulationPromisesRef.current[id] = promise;
      return promise;
    },
    [],
  );

  const checkUploadLimits = useCallback(
    (incomingFiles: File[]): boolean => {
      if (!isFreePlan) return true;

      const existingFiles = allFilesRes?.data || [];
      const serverImages = existingFiles.filter((f) => f.type === "IMAGE").length;
      const serverVideos = existingFiles.filter((f) => f.type === "VIDEO").length;
      const serverAudios = existingFiles.filter((f) => f.type === "AUDIO").length;

      const getFileType = (file: File): "IMAGE" | "VIDEO" | "AUDIO" | null => {
        const name = file.name.toLowerCase();
        const type = file.type.toLowerCase();
        if (type.startsWith("image/")) return "IMAGE";
        if (type.startsWith("video/") || name.endsWith(".mkv")) return "VIDEO";
        if (type.startsWith("audio/")) return "AUDIO";
        return null;
      };

      // Count staged files in the modal state that are not uploaded yet
      const stagedImages = files.filter(
        (f) =>
          f.status !== "done" &&
          f.status !== "error" &&
          getFileType(f.file) === "IMAGE",
      ).length;
      const stagedVideos = files.filter(
        (f) =>
          f.status !== "done" &&
          f.status !== "error" &&
          getFileType(f.file) === "VIDEO",
      ).length;
      const stagedAudios = files.filter(
        (f) =>
          f.status !== "done" &&
          f.status !== "error" &&
          getFileType(f.file) === "AUDIO",
      ).length;

      // Count incoming files
      const incomingImages = incomingFiles.filter((f) => getFileType(f) === "IMAGE").length;
      const incomingVideos = incomingFiles.filter((f) => getFileType(f) === "VIDEO").length;
      const incomingAudios = incomingFiles.filter((f) => getFileType(f) === "AUDIO").length;

      const totalImages = serverImages + stagedImages + incomingImages;
      const totalVideos = serverVideos + stagedVideos + incomingVideos;
      const totalAudios = serverAudios + stagedAudios + incomingAudios;

      if (totalImages > 2 || totalVideos > 2 || totalAudios > 2) {
        setIsLimitModalOpen(true);
        return false;
      }

      return true;
    },
    [files, allFilesRes, isFreePlan],
  );

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const valid = arr.filter((f) => {
        const ok =
          ALLOWED_TYPES.includes(f.type) ||
          f.name.toLowerCase().endsWith(".mkv");
        if (!ok) toast.error(`"${f.name}" is not a supported file type.`);
        return ok;
      });
      if (valid.length === 0) return;

      if (!checkUploadLimits(valid)) {
        return;
      }

      const entries: FileEntry[] = valid.map((f) => ({
        id: genId(),
        file: f,
        progress: 0,
        status: "pending",
        uploaded: 0,
      }));
      setFiles((prev) => [...prev, ...entries]);

      entries.forEach((entry) => {
        runProgressSimulation(entry.id, entry.file.size);
      });
    },
    [runProgressSimulation, checkUploadLimits],
  );

  const handleDone = async () => {
    if (files.length === 0) {
      return;
    }

    if (!checkUploadLimits([])) {
      return;
    }

    setIsPageLoading(true);

    try {
      const filesToUpload = files.filter(
        (f) =>
          f.status === "ready" ||
          f.status === "pending" ||
          f.status === "simulating",
      );

      if (filesToUpload.length === 0) {
        return;
      }

      let hasErrorOccurred = false;
      let successCount = 0;
      let failureCount = 0;
      let firstErrorMessage = "";
      const BATCH_SIZE = 4;

      let lastSuccessMessage = "";
      const uploadedResults: any[] = [];
      for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
        const batch = filesToUpload.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (entry) => {
            if (entry.status !== "ready") {
              const simulationPromise = simulationPromisesRef.current[entry.id];
              if (simulationPromise) {
                await simulationPromise;
              }
            }

            try {
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === entry.id
                    ? { ...f, status: "uploading", progress: 0 }
                    : f,
                ),
              );

              const res = await uploadFileCustom(
                entry,
                programId,
                token,
                currency,
                (progress, uploaded) => {
                  setFiles((prev) =>
                    prev.map((f) =>
                      f.id === entry.id ? { ...f, progress, uploaded } : f,
                    ),
                  );
                },
              );

              if (res?.message) {
                lastSuccessMessage = res.message;
              }

              successCount++;
              if (res?.data) {
                uploadedResults.push(res.data);
              }

              setFiles((prev) =>
                prev.map((f) =>
                  f.id === entry.id
                    ? ({
                        ...f,
                        status: "done",
                        progress: 100,
                        uploaded: entry.file.size,
                        responseData: res.data,
                      } as any)
                    : f,
                ),
              );
            } catch (fileError: any) {
              hasErrorOccurred = true;
              failureCount++;
              if (!firstErrorMessage) {
                firstErrorMessage = getUploadErrorMessage(fileError);
              }
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === entry.id
                    ? { ...f, status: "error", progress: 0 }
                    : f,
                ),
              );
            }
          }),
        );
      }

      dispatch(baseApi.util.invalidateTags(["Content"] as any));

      if (!hasErrorOccurred) {
        const hasVideo = filesToUpload.some(
          (f) =>
            f.file.type.startsWith("video/") ||
            f.file.name.toLowerCase().endsWith(".mkv"),
        );
        if (!hasVideo) {
          toast.success(
            lastSuccessMessage ||
              (filesToUpload.length > 1
                ? `All ${filesToUpload.length} files uploaded successfully!`
                : "File uploaded successfully!"),
          );
        }

        if (uploadedResults.length > 0 && onSuccess) {
          onSuccess(uploadedResults);
        }

        // Auto-close on successful upload
        setIsPageLoading(false);
        onClose();
      } else {
        toast.error(
          firstErrorMessage ||
            `Upload completed with errors. ${successCount} succeeded, ${failureCount} failed.`,
        );
        // If at least some succeeded, we should still pass them back but maybe not close automatically if there are errors to show
        if (uploadedResults.length > 0 && onSuccess) {
          onSuccess(uploadedResults);
        }
      }
    } catch (error: any) {
      toast.error(getUploadErrorMessage(error));
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleDropZoneClick = useCallback(
    () => fileInputRef.current?.click(),
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const hasFiles = files.length > 0;
  const isUploading = files.some((f) => f.status === "uploading");

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={() => {
          if (!isUploading) onClose();
        }}
      >
      <DialogContent
        showCloseButton={false}
        onPointerDownOutside={(e: { preventDefault: () => void }) =>
          e.preventDefault()
        }
        onInteractOutside={(e: { preventDefault: () => void }) =>
          e.preventDefault()
        }
        className="p-0 border-none bg-transparent shadow-none max-w-[560px] w-full outline-none z-[10000]"
      >
        <DialogTitle className="sr-only">Upload File</DialogTitle>
        <DialogDescription className="sr-only">
          Upload your media files to the program timeline.
        </DialogDescription>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-gray-200 dark:border-gray-700 w-full">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Upload File
            </h2>
            <button
              onClick={onClose}
              disabled={isUploading}
              aria-label="Close"
              className="text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-all cursor-pointer group"
            >
              <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-5 sm:px-6 pt-5 pb-3 space-y-4">
              <div
                onClick={handleDropZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 sm:py-10 px-4 transition-colors select-none ${
                  isDragging
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                }`}
              >
                <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm">
                  <UploadCloud className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <span className="font-semibold text-[#7F56D9] cursor-pointer hover:underline">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                  MP4, PNG, JPG or GIF (max. 500MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/x-matroska,.mkv,audio/mpeg,audio/mp3,image/png,image/jpeg,image/gif,image/webp"
                multiple
                className="hidden"
                onChange={handleInputChange}
              />

              {hasFiles && (
                <div className="space-y-3 pb-1">
                  {files.map((entry) => {
                    const badge = getExtBadge(entry.file);
                    const isDone = entry.status === "done";
                    const isError = entry.status === "error";
                    const isEntryUploading = entry.status === "uploading";

                    return (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <div className="relative shrink-0 mt-0.5">
                          <svg
                            width="36"
                            height="44"
                            viewBox="0 0 36 44"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-gray-200 dark:text-gray-600"
                          >
                            <path
                              d="M0 4C0 1.79086 1.79086 0 4 0H22L36 14V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
                              fill="currentColor"
                            />
                            <path
                              d="M22 0L36 14H26C23.7909 14 22 12.2091 22 10V0Z"
                              fill="#D1D5DB"
                            />
                          </svg>
                          <span
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[8px] font-bold px-1 py-0.5 rounded"
                            style={{ backgroundColor: badge.bg }}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight mb-0.5">
                            {entry.file.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                            <span>
                              {formatBytes(entry.uploaded)} of{" "}
                              {formatBytes(entry.file.size)}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">
                              |
                            </span>
                            {isDone || entry.status === "ready" ? (
                              <span className="flex items-center gap-1 text-green-500 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Complete
                              </span>
                            ) : isError ? (
                              <span className="text-red-500 font-medium">
                                Failed
                              </span>
                            ) : isEntryUploading ||
                              entry.status === "simulating" ? (
                              <span className="flex items-center gap-1 text-blue-500 font-medium">
                                <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
                                {isEntryUploading
                                  ? "Uploading..."
                                  : "Processing..."}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">
                                Ready to upload
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isError
                                    ? "bg-red-400"
                                    : isDone || entry.status === "ready"
                                      ? "bg-green-400"
                                      : "bg-violet-500"
                                }`}
                                style={{ width: `${entry.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">
                              {entry.progress}%
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(entry.id)}
                          disabled={isEntryUploading}
                          className={`shrink-0 transition-colors mt-0.5 p-0.5 ${
                            isEntryUploading
                              ? "text-gray-200 dark:text-gray-600 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-500 cursor-pointer"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isUploading}
              className={`flex-1 py-2.5 border border-border rounded-xl text-sm font-medium transition-colors shadow-customShadow ${
                isUploading
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-body hover:bg-gray-50 cursor-pointer"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleDone}
              disabled={isUploading || !hasFiles}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-customShadow text-white ${
                isUploading || !hasFiles
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-bgBlue hover:bg-blue-500 cursor-pointer"
              }`}
            >
              {isUploading ? "Uploading..." : "Upload Content"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Upload Limit Reached Modal */}
    <UploadLimitModal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} />
  </>
  );
}
