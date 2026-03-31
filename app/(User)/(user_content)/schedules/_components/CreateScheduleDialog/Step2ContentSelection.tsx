/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Image as ImageIcon, Video, AudioLines, FilePlay, ArrowRight, Play, Loader2, GalleryThumbnails } from "lucide-react";
import NextImage from "next/image";
import BaseSelect from "@/common/BaseSelect";
import { Input } from "@/components/ui/input";
import { useGetAllFilesQuery } from "@/redux/api/users/content/content.api";
import { transformFile } from "@/lib/content-utils";
import { ContentItem } from "@/types/content";

interface Step2Props {
    data: {
        contentType: string;
        selectedContent: ContentItem | null;
    };
    onChange: (data: { contentType: string; selectedContent: ContentItem | null }) => void;
    onContentSelect: (content: ContentItem) => void;
}

const Step2ContentSelection: React.FC<Step2Props> = ({ data, onChange, onContentSelect }) => {
    const { data: allFiles, isLoading } = useGetAllFilesQuery(undefined);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const transformedContent = useMemo(() => {
        if (!allFiles?.data) return [];
        return allFiles.data.map((file: any) => {
            const transformed = transformFile(file, isMounted);
            // Map to the local ContentItem shape if needed (Schedules _data.ts uses 'name' whereas transformFile uses 'title')
            return {
                ...transformed,
                name: transformed.title, // Add 'name' for compatibility with existing code
            } as any;
        });
    }, [allFiles, isMounted]);

    const [searchQuery, setSearchQuery] = useState("");

    const contentTypeOptions = [
        { label: "Select Content Type", value: "all", icon: <FilePlay className="w-5 h-5 text-body" /> },
        { label: "Image or Video", value: "image-video", icon: <FilePlay className="w-5 h-5 text-body" /> },
        { label: "Audio", value: "audio", icon: <AudioLines className="w-5 h-5 text-body" /> },
        { label: "Lower Third", value: "lower-third", icon: <GalleryThumbnails className="w-5 h-5 text-body" /> }
    ];

    // Filter content based on selected type and search query
    const filteredContent = transformedContent.filter((item: any) => {
        const matchesType =
            data.contentType === "all"
                ? true
                : data.contentType === "image-video"
                    ? item.type === "image" || item.type === "video"
                    : item.type === "audio";

        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-4">
            {/* Content Type Selector */}
            <BaseSelect
                label="Content Type"
                placeholder="Select content type"
                options={contentTypeOptions}
                value={data.contentType}
                onChange={(value) => onChange({ ...data, contentType: value, selectedContent: null })}
                required
            />

            {/* Select Content Field */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-headings">
                    Select Content
                </label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                        type="text"
                        placeholder="Search Content"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input border-borderGray text-headings"
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span>Loading content...</span>
                    </div>
                ) : filteredContent.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                        No content found
                    </div>
                ) : (
                    filteredContent.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onContentSelect(item)}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-input hover:border-bgBlue hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all group"
                        >
                            {/* Thumbnail or Icon */}
                            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer">
                                {item.type === "audio" ? (
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
                                        <AudioLines className="w-6 h-6 text-bgBlue" />
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
                                ) : (
                                    item.thumbnail ? (
                                        <NextImage src={item.thumbnail} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-bgBlue" />
                                    )
                                )}
                            </div>

                            {/* Content Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-headings group-hover:text-bgBlue transition-colors truncate">
                                    {item.name}
                                </p>
                                <p className="text-sm text-muted">
                                    {item.size}
                                    {item.duration && ` • ${item.duration}`}
                                </p>
                            </div>

                            {/* Action Icon */}
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-bgBlue text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-customShadow">
                                {item.type === "video" ? (
                                    <Play className="w-5 h-5" />
                                ) : (
                                    <ArrowRight className="w-5 h-5" />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Step2ContentSelection;
