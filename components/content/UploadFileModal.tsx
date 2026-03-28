
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Trash2, CheckCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useUploadFileMutation } from "@/redux/api/users/content/content.api";
import { baseApi } from "@/redux/api/baseApi";

type UploadStatus = "pending" | "simulating" | "ready" | "uploading" | "done" | "error";

interface FileEntry {
    id: string;
    file: File;
    progress: number;
    status: UploadStatus;
    uploaded: number;
}

interface UploadFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    setIsPageLoading: (loading: boolean) => void;
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

export default function UploadFileModal({
    isOpen,
    onClose,
    setIsPageLoading,
}: UploadFileModalProps) {
    const dispatch = useDispatch();
    const [uploadFile] = useUploadFileMutation();
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressIntervalsRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
    const simulationPromisesRef = useRef<Record<string, Promise<void>>>({});

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

    const handleRemove = useCallback((id: string) => {
        stopProgressSimulation(id);
        setFiles((prev) => prev.filter((f) => f.id !== id));
    }, [stopProgressSimulation]);

    const runProgressSimulation = useCallback(
        (id: string, fileSize: number): Promise<void> => {
            const promise = new Promise<void>((resolve) => {
                // Mark as simulating
                setFiles((prev) =>
                    prev.map((f) =>
                        f.id === id ? { ...f, status: "simulating", progress: 0 } : f
                    )
                );

                const interval = setInterval(() => {
                    setFiles((prev) => {
                        const entry = prev.find((f) => f.id === id);
                        if (!entry) {
                            clearInterval(interval);
                            resolve();
                            return prev;
                        }

                        const increment = Math.floor(Math.random() * 10) + 5;
                        const nextProgress = Math.min(entry.progress + increment, 100);
                        const nextUploaded = Math.round((nextProgress / 100) * fileSize);

                        // When progress reaches 100% — stop interval and resolve promise
                        if (nextProgress >= 100) {
                            clearInterval(interval);
                            delete progressIntervalsRef.current[id];
                            delete simulationPromisesRef.current[id];
                            // small delay so user sees 100% bar before API fires
                            setTimeout(() => resolve(), 300);
                            return prev.map((f) =>
                                f.id === id
                                    ? { ...f, progress: 100, uploaded: fileSize, status: "ready" }
                                    : f
                            );
                        }


                        return prev.map((f) =>
                            f.id === id
                                ? { ...f, progress: nextProgress, uploaded: nextUploaded }
                                : f
                        );
                    });
                }, 300);

                progressIntervalsRef.current[id] = interval;
            });

            simulationPromisesRef.current[id] = promise;
            return promise;
        },
        []
    );

    const addFiles = useCallback((incoming: FileList | File[]) => {
        const arr = Array.from(incoming);
        const valid = arr.filter((f) => {
            const ok =
                ALLOWED_TYPES.includes(f.type) ||
                f.name.toLowerCase().endsWith(".mkv");
            if (!ok) toast.error(`"${f.name}" is not a supported file type.`);
            return ok;
        });
        if (valid.length === 0) return;
        const entries: FileEntry[] = valid.map((f) => ({
            id: genId(),
            file: f,
            progress: 0,
            status: "pending",
            uploaded: 0,
        }));
        setFiles((prev) => [...prev, ...entries]);

        // ─── Trigger simulation immediately for each file ───────────────────
        entries.forEach((entry) => {
            runProgressSimulation(entry.id, entry.file.size);
        });
    }, [runProgressSimulation]);

    // ─── handleDone ───────────────────────────────────────────────────────────
    const handleDone = async () => {
        if (files.length === 0) {
            onClose();
            return;
        }

        setIsPageLoading(true);

        try {
            // Include files that are ready, pending, OR simulating
            const filesToUpload = files.filter(f =>
                f.status === "ready" ||
                f.status === "pending" ||
                f.status === "simulating"
            );

            if (filesToUpload.length === 0) {
                onClose();
                return;
            }

            let hasErrorOccurred = false;
            const BATCH_SIZE = 4;

            // Process uploads in batches to optimize performance and prevent network issues
            for (let i = 0; i < filesToUpload.length; i += BATCH_SIZE) {
                const batch = filesToUpload.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (entry) => {
                    // 1. Wait for its simulation to finish if it's still running
                    const simulationPromise = simulationPromisesRef.current[entry.id];
                    if (simulationPromise) {
                        await simulationPromise;
                    }

                    // 2. Perform the actual API upload
                    const formData = new FormData();
                    formData.append("file", entry.file);

                    try {
                        // Mark as actually uploading
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === entry.id ? { ...f, status: "uploading" } : f
                            )
                        );

                        const res = await uploadFile(formData).unwrap();

                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === entry.id
                                    ? { ...f, status: "done", progress: 100, uploaded: entry.file.size }
                                    : f
                            )
                        );

                        toast.success(res?.message || `"${entry.file.name}" uploaded successfully!`);
                    } catch (fileError: any) {
                        hasErrorOccurred = true;
                        setFiles((prev) =>
                            prev.map((f) =>
                                f.id === entry.id ? { ...f, status: "error", progress: 0 } : f
                            )
                        );
                        toast.error(
                            fileError?.data?.message || `Failed to upload "${entry.file.name}"`
                        );
                    }
                }));
            }

            dispatch(baseApi.util.invalidateTags(["Content"] as any));

            // Only close if all files in this attempt were successful
            if (!hasErrorOccurred) {
                onClose();
            }
        } catch (error: any) {
            toast.error(
                error?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setIsPageLoading(false);
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    const handleDropZoneClick = useCallback(
        () => fileInputRef.current?.click(),
        []
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
        [addFiles]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                addFiles(e.target.files);
                e.target.value = "";
            }
        },
        [addFiles]
    );

    if (!isOpen) return null;

    const hasFiles = files.length > 0;
    const isUploading = files.some((f) => f.status === "uploading");

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 cursor-pointer"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col overflow-hidden cursor-default border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Upload File
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="px-5 sm:px-6 pt-5 pb-3 space-y-4">
                        {/* Drop zone */}
                        <div
                            onClick={handleDropZoneClick}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 sm:py-10 px-4 transition-colors select-none ${isDragging
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

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/x-matroska,.mkv,audio/mpeg,audio/mp3,image/png,image/jpeg,image/gif,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleInputChange}
                        />

                        {/* File list */}
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
                                            {/* File icon */}
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

                                            {/* Info + Progress */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight mb-0.5">
                                                    {entry.file.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
                                                    <span>
                                                        {formatBytes(entry.uploaded)} of{" "}
                                                        {formatBytes(entry.file.size)}
                                                    </span>
                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                    {isDone || entry.status === "ready" ? (
                                                        <span className="flex items-center gap-1 text-green-500 font-medium">
                                                            <CheckCircle className="w-3.5 h-3.5" />
                                                            Complete
                                                        </span>
                                                    ) : isError ? (
                                                        <span className="text-red-500 font-medium">Failed</span>
                                                    ) : isEntryUploading || entry.status === "simulating" ? (
                                                        <span className="flex items-center gap-1 text-blue-500 font-medium">
                                                            <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
                                                            {isEntryUploading ? "Uploading..." : "Processing..."}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">
                                                            Ready to upload
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Progress bar */}
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-300 ${isError
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

                                            {/* Remove */}
                                            <button
                                                onClick={() => handleRemove(entry.id)}
                                                disabled={isEntryUploading}
                                                className={`shrink-0 transition-colors mt-0.5 p-0.5 ${isEntryUploading
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

                {/* Footer */}
                <div className="shrink-0 flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className={`flex-1 py-2.5 border border-border rounded-xl text-sm font-medium transition-colors shadow-customShadow ${isUploading
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-body hover:bg-gray-50 cursor-pointer"
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDone}
                        disabled={isUploading || !hasFiles}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-customShadow text-white ${isUploading || !hasFiles
                            ? "bg-blue-300 cursor-not-allowed"
                            : "bg-bgBlue hover:bg-blue-500 cursor-pointer"
                            }`}
                    >
                        {isUploading ? "Uploading..." : "Upload"}
                    </button>
                </div>
            </div>
        </div>
    );
}


//                         {/* File list */}
//                         {hasFiles && (
//                             <div className="space-y-3 pb-1">
//                                 {files.map((entry) => {
//                                     const badge = getExtBadge(entry.file);
//                                     const isDone = entry.status === "done";
//                                     const isError = entry.status === "error";
//                                     const isEntryUploading = entry.status === "uploading";

//                                     return (
//                                         <div
//                                             key={entry.id}
//                                             className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
//                                         >
//                                             {/* File icon */}
//                                             <div className="relative shrink-0 mt-0.5">
//                                                 <svg
//                                                     width="36"
//                                                     height="44"
//                                                     viewBox="0 0 36 44"
//                                                     fill="none"
//                                                     xmlns="http://www.w3.org/2000/svg"
//                                                     className="text-gray-200 dark:text-gray-600"
//                                                 >
//                                                     <path
//                                                         d="M0 4C0 1.79086 1.79086 0 4 0H22L36 14V40C36 42.2091 34.2091 44 32 44H4C1.79086 44 0 42.2091 0 40V4Z"
//                                                         fill="currentColor"
//                                                     />
//                                                     <path
//                                                         d="M22 0L36 14H26C23.7909 14 22 12.2091 22 10V0Z"
//                                                         fill="#D1D5DB"
//                                                     />
//                                                 </svg>
//                                                 <span
//                                                     className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-[8px] font-bold px-1 py-0.5 rounded"
//                                                     style={{ backgroundColor: badge.bg }}
//                                                 >
//                                                     {badge.label}
//                                                 </span>
//                                             </div>

//                                             {/* Info + Progress */}
//                                             <div className="flex-1 min-w-0">
//                                                 <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight mb-0.5">
//                                                     {entry.file.name}
//                                                 </p>
//                                                 <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
//                                                     <span>
//                                                         {formatBytes(entry.uploaded)} of{" "}
//                                                         {formatBytes(entry.file.size)}
//                                                     </span>
//                                                     <span className="text-gray-300 dark:text-gray-600">|</span>
//                                                     {isDone ? (
//                                                         <span className="flex items-center gap-1 text-green-500 font-medium">
//                                                             <CheckCircle className="w-3.5 h-3.5" />
//                                                             Complete
//                                                         </span>
//                                                     ) : isError ? (
//                                                         <span className="text-red-500 font-medium">Failed</span>
//                                                     ) : isEntryUploading ? (
//                                                         <span className="flex items-center gap-1 text-blue-500 font-medium">
//                                                             <UploadCloud className="w-3.5 h-3.5 animate-bounce" />
//                                                             Uploading...
//                                                         </span>
//                                                     ) : (
//                                                         <span className="text-gray-400 dark:text-gray-500">
//                                                             Ready to upload
//                                                         </span>
//                                                     )}
//                                                 </div>

//                                                 {/* Progress bar */}
//                                                 <div className="flex items-center gap-2">
//                                                     <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
//                                                         <div
//                                                             className={`h-full rounded-full transition-all duration-300 ${isError
//                                                                     ? "bg-red-400"
//                                                                     : isDone
//                                                                         ? "bg-green-400"
//                                                                         : "bg-violet-500"
//                                                                 }`}
//                                                             style={{ width: `${entry.progress}%` }}
//                                                         />
//                                                     </div>
//                                                     <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right shrink-0">
//                                                         {entry.progress}%
//                                                     </span>
//                                                 </div>
//                                             </div>

//                                             {/* Remove */}
//                                             <button
//                                                 onClick={() => handleRemove(entry.id)}
//                                                 disabled={isEntryUploading}
//                                                 className={`shrink-0 transition-colors mt-0.5 p-0.5 ${isEntryUploading
//                                                         ? "text-gray-200 dark:text-gray-600 cursor-not-allowed"
//                                                         : "text-gray-400 hover:text-red-500 cursor-pointer"
//                                                     }`}
//                                             >
//                                                 <Trash2 className="w-4 h-4" />
//                                             </button>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="shrink-0 flex items-center gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
//                     <button
//                         onClick={onClose}
//                         disabled={isUploading}
//                         className={`flex-1 py-2.5 border border-border rounded-xl text-sm font-medium transition-colors shadow-customShadow ${isUploading
//                                 ? "text-gray-300 cursor-not-allowed"
//                                 : "text-body hover:bg-gray-50 cursor-pointer"
//                             }`}
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleDone}
//                         disabled={isUploading || !hasFiles}
//                         className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-customShadow text-white ${isUploading || !hasFiles
//                                 ? "bg-blue-300 cursor-not-allowed"
//                                 : "bg-bgBlue hover:bg-blue-500 cursor-pointer"
//                             }`}
//                     >
//                         {isUploading ? "Uploading..." : "Upload"}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
