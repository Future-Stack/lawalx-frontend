"use client";

import { Video, Clock } from "lucide-react";
import { ContentItem } from "@/types/content";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import Image from "next/image";
import { useState, useEffect } from "react";
import Marquee from "react-fast-marquee";
import { LowerThirdPayload } from "@/redux/api/users/schedules/schedules.type";

interface ContentPreviewProps {
  items: ContentItem[];
  scheduleTime: string;
  playingIndex: number;
  setPlayingIndex: (index: number) => void;
  lowerThird?: LowerThirdPayload;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  items,
  scheduleTime,
  playingIndex,
  setPlayingIndex,
  lowerThird,
}) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Reset index if items change significantly or current index exceeds bounds
    if (playingIndex >= items.length && items.length > 0) {
      setPlayingIndex(0);
    }
  }, [items?.length, playingIndex, setPlayingIndex]);

  const advance = () => {
    if (!items || items.length <= 1) return;
    setIsFading(true);
    setTimeout(() => {
      setPlayingIndex((playingIndex + 1) % items.length);
      setIsFading(false);
    }, 500); // 500ms fade duration
  };

  useEffect(() => {
    if (!items || items.length <= 1) return;

    const currentItem = items[playingIndex];
    // If it's a video, we rely on the onEnded callback of the video player
    if (currentItem?.type === "video") return;

    // For images, audio, or other media, use provided duration or fallback to 7s
    const displayDuration = parseInt(currentItem?.duration || "7");
    const timer = setTimeout(advance, Math.max(0, (displayDuration * 1000) - 500));

    return () => clearTimeout(timer);
  }, [playingIndex, items]);

  const content = items[playingIndex];

  // Helpers to resolve media sources
  const videoSrc = content?.video || (content?.type === "video" ? content?.thumbnail : undefined);
  const thumbnailSrc = content?.thumbnail;

  return (
    <div className="lg:col-span-5 space-y-6">
      <h2 className="text-xl font-bold text-headings dark:text-white lg:mt-0">
        Preview
      </h2>

      <div className="bg-navbarBg border border-border rounded-xl shadow-[0_0_24px_rgba(15,23,42,0.14)] hover:shadow-[0_0_30px_rgba(15,23,42,0.18)] transition-shadow flex flex-col">
        {/* MEDIA CONTAINER (Fixed Aspect Ratio) */}
        <div className="p-4 relative h-[360px] md:h-[410px] overflow-hidden">
          <div className="w-full h-full flex flex-col overflow-hidden bg-black rounded-lg">
            {/* TOP TICKER */}
            {lowerThird && lowerThird.text && lowerThird.position === "Top" && (
              <div 
                className="py-3 overflow-hidden shrink-0"
                style={{
                  backgroundColor: `${lowerThird.backgroundColor}${Math.round(
                    parseInt(lowerThird.backgroundOpacity || "80") * 2.55
                  ).toString(16).padStart(2, '0')}`
                }}
              >
                <Marquee
                  speed={lowerThird.speed || 40}
                  direction={lowerThird.animation === "Left_to_Light" ? "left" : "right"}
                  gradient={false}
                  loop={lowerThird.loop ? 0 : 1}
                >
                  <p
                    className="font-semibold px-4"
                    style={{
                      color: lowerThird.textColor,
                      fontSize: lowerThird.fontSize === "Small" ? "14px" : 
                                lowerThird.fontSize === "Medium" ? "16px" : "20px",
                      fontFamily: lowerThird.font || "inherit",
                    }}
                  >
                    {lowerThird.text}
                  </p>
                </Marquee>
              </div>
            )}

            {/* CONTENT AREA */}
            <div className={`relative flex-1 overflow-hidden ${isFading ? "animate-preview-exit" : "animate-preview-enter"}`}>
              {content ? (
                <div key={content.id} className="w-full h-full">
                  {content.type === "video" && videoSrc ? (
                    <BaseVideoPlayer
                      key={videoSrc}
                      src={videoSrc}
                      poster={thumbnailSrc}
                      autoPlay={true}
                      rounded="rounded-none"
                      onEnded={advance}
                    />
                  ) : content.type === "audio" && content.audio ? (
                    <BaseVideoPlayer
                      key={content.audio}
                      src={content.audio}
                      autoPlay={true}
                      rounded="rounded-none"
                      mediaType="audio"
                      onEnded={advance}
                    />
                  ) : content.type === "image" && thumbnailSrc ? (
                    <div className="relative w-full h-full overflow-hidden border border-border">
                      <Image
                        src={thumbnailSrc || "/placeholder.png"}
                        alt={content.title || "Preview"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-muted border border-border">
                      <Video className="w-12 h-12 opacity-20 mb-2" />
                      <span className="text-sm">Cannot preview this content type</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-muted">
                  <Video className="w-12 h-12 opacity-20 mb-2" />
                  <span className="text-sm">No content preview</span>
                </div>
              )}
            </div>

            {/* BOTTOM / MIDDLE TICKER (Middle defaults to bottom for this layout) */}
            {lowerThird && lowerThird.text && lowerThird.position !== "Top" && (
              <div 
                className="py-2.5 overflow-hidden shrink-0"
                style={{
                  backgroundColor: `${lowerThird.backgroundColor}${Math.round(
                    parseInt(lowerThird.backgroundOpacity || "80") * 2.55
                  ).toString(16).padStart(2, '0')}`
                }}
              >
                <Marquee
                  speed={lowerThird.speed || 40}
                  direction={lowerThird.animation === "Left_to_Light" ? "left" : "right"}
                  gradient={false}
                  loop={lowerThird.loop ? 0 : 1}
                >
                  <p
                    className="font-semibold px-4"
                    style={{
                      color: lowerThird.textColor,
                      fontSize: lowerThird.fontSize === "Small" ? "14px" : 
                                lowerThird.fontSize === "Medium" ? "16px" : "20px",
                      fontFamily: lowerThird.font || "inherit",
                    }}
                  >
                    {lowerThird.text}
                  </p>
                </Marquee>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-muted">
            <Video className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium line-clamp-1">
              Playing: {content?.title || "None"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              {scheduleTime || "Mon, Tue, Wed, Thu, Fri • 09:00 AM"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentPreview;
