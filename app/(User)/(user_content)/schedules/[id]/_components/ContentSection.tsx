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
        <section className="bg-navbarBg border border-border rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-headings">Content</h2>
                {content.length > 0 && (
                    <button
                        onClick={onAddContent}
                        className="text-sm font-semibold text-bgBlue hover:underline cursor-pointer"
                    >
                        Change
                    </button>
                )}
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-headings flex items-center gap-1">
                        Content Type * <Info className="w-4 h-4 text-gray-400" />
                    </label>
                    <BaseSelect
                        value={contentType}
                        onChange={setContentType}
                        options={[
                            { label: "Select content type", value: "all", icon: <FilePlay className="w-5 h-5 text-body" /> },
                            { label: "Image or Video", value: "image-video", icon: <FilePlay className="w-5 h-5 text-body" /> },
                            { label: "Audio", value: "audio", icon: <AudioLines className="w-5 h-5 text-body" /> }
                        ]}
                        placeholder="Select Type"
                    />
                </div>

                {content.length > 0 ? content.map((item) => (
                    <div
                        key={item.id}
                        onClick={onAddContent}
                        className="flex items-center gap-4 p-3 border border-border rounded-xl bg-bgGray/30 dark:bg-gray-800/30 cursor-pointer group hover:border-bgBlue transition-all"
                    >
                        <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
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
                            <div className="font-bold text-muted group-hover:text-bgBlue transition-colors">{item.title}</div>
                            <div className="text-xs text-muted">{item.size}</div>
                        </div>
                        <button className="text-gray-400 hover:text-red-500 transition cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )) : (
                    <div
                        onClick={onAddContent}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-bgGray/10 hover:bg-bgGray/20 cursor-pointer transition-all gap-2"
                    >
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <FilePlay className="w-6 h-6 text-bgBlue" />
                        </div>
                        <div className="text-sm font-medium text-headings">Select Content</div>
                        <p className="text-xs text-muted text-center">Click to browse and add content to this schedule</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ContentSection;
