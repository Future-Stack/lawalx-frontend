/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Image as ImageIcon, AudioLines, FilePlay, ArrowRight, Play, Loader2, GalleryThumbnails, ChevronRight, CircleCheckBigIcon } from "lucide-react";
import NextImage from "next/image";
import folderIcon from "@/public/icons/folder.svg";
import BaseSelect from "@/common/BaseSelect";
import { Input } from "@/components/ui/input";
import BaseDialog from "@/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { useGetAllContentDataQuery, useMoveToFolderMutation } from "@/redux/api/users/content/content.api";
import { transformFile, transformFolder } from "@/lib/content-utils";
import { ContentItem } from "@/types/content";
import { toast } from "sonner";

interface AddExistingContentDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    targetFolderId: string;
}

const AddExistingContentDialog = ({ open, setOpen, targetFolderId }: AddExistingContentDialogProps) => {
    const { data: allContentData, isLoading } = useGetAllContentDataQuery(undefined);
    const [moveToFolder, { isLoading: isMoving }] = useMoveToFolderMutation();
    const [isMounted, setIsMounted] = useState(false);
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [contentType, setContentType] = useState("all");
    const [selectedItems, setSelectedItems] = useState<ContentItem[]>([]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const toggleFolder = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) {
                next.delete(folderId);
            } else {
                next.add(folderId);
            }
            return next;
        });
    };

    const transformedContent = useMemo(() => {
        if (!allContentData?.data) return [];

        const folders = allContentData.data.folders
            .filter((f: any) => f.id !== targetFolderId) // Exclude current folder
            .map((folder: any) => {
                const transformed = transformFolder(folder, isMounted);
                return {
                    ...transformed,
                    name: transformed.title,
                } as any;
            });

        const rootFiles = allContentData.data.rootFiles.map((file: any) => {
            const transformed = transformFile(file, isMounted);
            return {
                ...transformed,
                name: transformed.title,
            } as any;
        });

        return [...folders, ...rootFiles];
    }, [allContentData, isMounted, targetFolderId]);

    const contentTypeOptions = [
        { label: "Select Content Type", value: "all", icon: <FilePlay className="w-5 h-5 text-body" /> },
        { label: "Image or Video", value: "image-video", icon: <FilePlay className="w-5 h-5 text-body" /> },
        { label: "Audio", value: "audio", icon: <AudioLines className="w-5 h-5 text-body" /> },
    ];

    const filteredContent = useMemo(() => {
        return transformedContent.filter((item: any) => {
            const matchesType =
                contentType === "all"
                    ? true
                    : contentType === "image-video"
                        ? item.type === "image" || item.type === "video" || item.type === "folder"
                        : (item.type === "audio" || item.type === "playlist") || item.type === "folder";

            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesType && matchesSearch;
        });
    }, [transformedContent, contentType, searchQuery]);

    const handleContentSelect = (item: ContentItem) => {
        setSelectedItems(prev => {
            const isSelected = prev.some(c => c.id === item.id);
            if (isSelected) {
                return prev.filter(c => c.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleAdd = async () => {
        if (selectedItems.length === 0) return;

        try {
            const movePromises = selectedItems.map(item =>
                moveToFolder({ id: item.id, targetFolderId }).unwrap()
            );

            await Promise.all(movePromises);
            toast.success(`Successfully added ${selectedItems.length} item(s) to folder`);
            setOpen(false);
            setSelectedItems([]);
        } catch (error: any) {
            console.error("Failed to move files:", error);
            toast.error(error?.data?.message || "Failed to add items to folder");
        }
    };

    const renderContentItem = (item: any, depth = 0) => {
        const isSelected = selectedItems.some(c => c.id === item.id);
        const isExpanded = expandedFolders.has(item.id);

        return (
            <React.Fragment key={item.id}>
                <div
                    onClick={(e) => {
                        if (item.type === "folder") {
                            toggleFolder(e, item.id);
                        } else {
                            handleContentSelect(item);
                        }
                    }}
                    className={`flex items-center gap-3 p-3 rounded-lg border border-border bg-input transition-all group ${isSelected
                            ? "border-bgBlue bg-blue-50/50 dark:bg-blue-950/20"
                            : "hover:border-bgBlue hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        } cursor-pointer mb-2`}
                >
                    <div className="flex-shrink-0">
                        {item.type !== "folder" && (
                            <div
                                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                        ? "bg-bgBlue border-bgBlue text-white"
                                        : "border-borderGray group-hover:border-bgBlue"
                                    }`}
                            >
                                {isSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {item.type === "folder" && (
                            <ChevronRight
                                className={`w-4 h-4 text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
                            />
                        )}

                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {(item.type === "audio" || item.type === "playlist") ? (
                                <div
                                    className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/20"
                                    onMouseEnter={(e) => {
                                        const audio = e.currentTarget.querySelector('audio');
                                        if (audio) audio.play();
                                    }}
                                    onMouseLeave={(e) => {
                                        const audio = e.currentTarget.querySelector('audio');
                                        if (audio) {
                                            audio.pause();
                                            audio.currentTime = 0;
                                        }
                                    }}
                                >
                                    <AudioLines className="w-5 h-5 text-bgBlue" />
                                    <audio src={item.audio} muted={false} />
                                </div>
                            ) : item.type === "video" ? (
                                <video
                                    src={item.video}
                                    className="w-full h-full object-cover"
                                    muted
                                    onMouseEnter={(e) => e.currentTarget.play()}
                                    onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                />
                            ) : item.type === "folder" ? (
                                <NextImage src={folderIcon} alt="folder" width={24} height={24} />
                            ) : (
                                item.thumbnail ? (
                                    <NextImage src={item.thumbnail} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-5 h-5 text-bgBlue" />
                                )
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-headings group-hover:text-bgBlue transition-colors truncate text-sm md:text-base">
                            {item.name}
                        </p>
                        <p className="text-xs text-muted">
                            {item.type === "folder" ? `${item.fileCount || 0} items` : item.size}
                            {item.duration && ` • ${item.duration}`}
                        </p>
                    </div>

                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-bgBlue text-white flex items-center justify-center transition-opacity shadow-customShadow ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}>
                        {isSelected ? (
                            <CircleCheckBigIcon className="w-4 h-4" />
                        ) : item.type === "video" ? (
                            <Play className="w-4 h-4 ml-0.5" />
                        ) : (
                            <ArrowRight className="w-4 h-4" />
                        )}
                    </div>
                </div>

                {item.type === "folder" && isExpanded && item.children && (
                    <div className="ml-6 border-l border-border pl-4 space-y-2 mb-2">
                        {item.children.map((child: any) => renderContentItem(child, depth + 1))}
                    </div>
                )}
            </React.Fragment>
        );
    };

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title="Add Existing Content"
            description="Select existing content to add to this folder."
            maxWidth="xl"
            maxHeight="xl"
        >
            <div className="space-y-4 mt-2">
                <BaseSelect
                    label="Content Type"
                    placeholder="Select content type"
                    options={contentTypeOptions}
                    value={contentType}
                    onChange={setContentType}
                />

                <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-bold text-headings">Select Content</p>
                    <div className="text-xs font-bold text-bgBlue bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        {selectedItems.length} items selected
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                        type="text"
                        placeholder="Search Content in your library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input border-borderGray text-headings h-11"
                    />
                </div>

                <div className="max-h-[350px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
                    {isLoading || !isMounted ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted h-full">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span>Loading your content...</span>
                        </div>
                    ) : (
                        <>
                            {filteredContent.length === 0 ? (
                                <div className="text-center py-8 text-muted flex flex-col items-center gap-2 h-full">
                                    <Search className="w-8 h-8 opacity-20" />
                                    <span>No content found matching your search</span>
                                </div>
                            ) : (
                                filteredContent.map((item) => renderContentItem(item))
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 h-11 md:h-12 border-border shadow-customShadow font-semibold text-base hover:bg-gray-50"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleAdd}
                        disabled={selectedItems.length === 0 || isMoving}
                        className="flex-1 h-11 md:h-12 bg-bgBlue hover:bg-[#0095FF] text-white font-semibold text-base shadow-customShadow disabled:opacity-50"
                    >
                        {isMoving ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            `Add Content (${selectedItems.length})`
                        )}
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default AddExistingContentDialog;
