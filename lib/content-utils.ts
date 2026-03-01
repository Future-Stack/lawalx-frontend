import { ContentItem } from "@/types/content";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const formatDuration = (seconds: number) => {
    if (!seconds) return undefined;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
};

export const getUrl = (url: string | null) => {
    if (!url) return undefined;
    let cleanUrl = url.trim();

    // Fix malformed protocol from API (e.g., https:/ instead of https://)
    if (cleanUrl.startsWith("https:/") && !cleanUrl.startsWith("https://")) {
        cleanUrl = cleanUrl.replace("https:/", "https://");
    } else if (cleanUrl.startsWith("http:/") && !cleanUrl.startsWith("http://")) {
        cleanUrl = cleanUrl.replace("http:/", "http://");
    }

    if (cleanUrl.startsWith("http")) return cleanUrl;

    // Consistency with ScreenCard.tsx: strip /api/v1 from baseUrl if it exists
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/api\/v1\/?$/, "");

    const path = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
    return `${baseUrl}/${path}`;
};

export const transformFile = (file: any, isMounted: boolean): ContentItem => ({
    id: file.id,
    title: file.originalName,
    type: file.type === "IMAGE" ? "image" : file.type === "VIDEO" ? "video" : file.type === "AUDIO" ? "audio" : "playlist",
    size: formatBytes(file.size),
    duration: formatDuration(file.duration),
    thumbnail: file.type === "IMAGE" ? getUrl(file.url) : undefined,
    video: file.type === "VIDEO" ? getUrl(file.url) : undefined,
    audio: file.type === "AUDIO" ? getUrl(file.url) : undefined,
    uploadedDate: isMounted ? dayjs(file.createdAt).fromNow() : "",
    updatedAt: isMounted ? dayjs(file.updatedAt).fromNow() : "",
    fileExtension: file.fileType?.split("/")[1]?.toUpperCase(),
    assignedTo: [],
});

export const transformFolder = (folder: any, isMounted: boolean): ContentItem => ({
    id: folder.id,
    title: folder.name,
    type: "folder",
    size: formatBytes(folder.files?.reduce((acc: number, f: any) => acc + (f.size || 0), 0) || 0),
    fileCount: folder.files?.length || 0,
    uploadedDate: isMounted ? dayjs(folder.createdAt).fromNow() : "",
    updatedAt: isMounted ? dayjs(folder.updatedAt).fromNow() : "",
    children: folder.files?.map((f: any) => transformFile(f, isMounted)) || [],
    assignedTo: [],
});

export const findContentById = (items: ContentItem[], id: string): ContentItem | null => {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.children && item.children.length > 0) {
            const found = findContentById(item.children, id);
            if (found) return found;
        }
    }
    return null;
};
