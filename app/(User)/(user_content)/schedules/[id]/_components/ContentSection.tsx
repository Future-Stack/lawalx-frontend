import React from "react";
import { Info, X, FilePlay, AudioLines } from "lucide-react";
import BaseSelect from "@/common/BaseSelect";
import { ContentItem } from "@/types/content";

interface ContentSectionProps {
    contentType: string;
    setContentType: (val: string) => void;
    content: ContentItem[];
    onAddContent: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({ contentType, setContentType, content, onAddContent }) => {
    return (
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Content</h2>
            
            {/* Divider */}
            <div className="h-px w-full bg-gray-200 dark:bg-gray-700 mb-5" />

            <div className="space-y-5">
                <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                        Content Type * <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <BaseSelect
                        value={contentType}
                        onChange={setContentType}
                        options={[
                            { label: "Select content type", value: "all", icon: <FilePlay className="w-5 h-5 text-gray-500" /> },
                            { label: "Image or Video", value: "image-video", icon: <FilePlay className="w-5 h-5 text-gray-500" /> },
                            { label: "Audio", value: "audio", icon: <AudioLines className="w-5 h-5 text-gray-500" /> }
                        ]}
                        placeholder="Select Type"
                    />
                </div>

                {content.length > 0 && (
                    <div className="space-y-2">
                        {content.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 transition-all"
                            >
                                <div className="w-14 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    {item.type === "video" ? (
                                        <video
                                            src={item.video || item.thumbnail}
                                            className="w-full h-full object-cover"
                                            muted
                                            onMouseEnter={(e) => e.currentTarget.play()}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.pause();
                                                e.currentTarget.currentTime = 0;
                                            }}
                                        />
                                    ) : (
                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{item.title}</div>
                                    <div className="text-[13px] text-gray-500 font-medium mt-0.5">{item.size}</div>
                                </div>
                                <button className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ContentSection;
