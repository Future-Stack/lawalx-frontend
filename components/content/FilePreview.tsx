"use client";

import { AudioLines } from "lucide-react";
import Image from "next/image";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import { ContentItem } from "@/types/content";

interface FilePreviewProps {
  content: ContentItem;
}

const FilePreview = ({ content }: FilePreviewProps) => {
  return (
    <div className="bg-navbarBg rounded-xl md:rounded-[12px] h-full border border-border p-4 md:p-6 flex flex-col">
      <h2 className="text-lg md:text-2xl font-semibold text-headings mb-4">
        Preview
      </h2>

      <div className="flex-1 flex items-center justify-center w-full">
        {content.type === "video" && content.video ? (
          <div className="w-full relative rounded-lg overflow-hidden">
            <BaseVideoPlayer
              src={content.video || ""}
              poster={content.thumbnail}
              autoPlay={false}
              rounded=""
            />
          </div>
        ) : content.type === "playlist" && content.audio ? (
          <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl w-full">
            <div className="flex flex-col items-center justify-center mb-6 bg-navbarBg p-4 rounded-xl">
              <AudioLines className="w-24 h-24 text-headings mb-4" />
              <h3 className="text-lg font-semibold text-headings mb-2 text-center">
                {content.title}
              </h3>
              <p className="text-sm text-muted">
                {content.size}
                {content.duration && ` • ${content.duration}`}
              </p>
            </div>
            <div className="bg-navbarBg rounded-lg p-4 shadow-sm w-full">
              <AudioPlayer
                src={content.audio}
                autoPlay={false}
                showJumpControls={false}
                customAdditionalControls={[]}
                layout="stacked"
              />
            </div>
          </div>
        ) : content.type === "image" && content.thumbnail ? (
          <div className="rounded-lg overflow-hidden w-full h-full flex items-center justify-center">
            <Image
              src={content.thumbnail}
              alt={content.title}
              width={600}
              height={400}
              unoptimized
              className="rounded-lg object-contain w-full h-full max-h-[500px]"
            />
          </div>
        ) : (
          <div className="aspect-video w-full flex items-center justify-center bg-gray-200 rounded-lg">
            <span className="text-gray-500">No Preview Available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
