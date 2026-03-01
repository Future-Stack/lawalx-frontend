"use client";

import React from "react";
import { Video, Clock } from "lucide-react";
import { ContentItem } from "@/types/content";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";

interface ContentPreviewProps {
  content?: ContentItem;
  scheduleTime: string;
  video?: string;
  thumbnail?: string;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  scheduleTime,
  video,
  thumbnail,
}) => {
  // Correct logging
  console.log("Preview video:", video);

  return (
    <div className="lg:col-span-5 space-y-6">
      <h2 className="text-xl font-bold text-headings dark:text-white lg:mt-0">
        Preview
      </h2>

      <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4">
          {video ? (
            <BaseVideoPlayer
              src={video}
              poster={thumbnail || content?.thumbnail}
              autoPlay={false}
              rounded="rounded-lg"
            />
          ) : (
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-muted rounded-lg">
              <Video className="w-12 h-12 opacity-20 mb-2" />
              <span className="text-sm">No content preview</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-muted">
            <Video className="w-5 h-5" />
            <span className="text-sm font-medium">
              Video: {content?.title || "None"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-muted">
            <Clock className="w-5 h-5" />
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







// import React from "react";
// import { Video, Play, Clock } from "lucide-react";
// import { ContentItem } from "../../_data";

// interface ContentPreviewProps {
//     content?: ContentItem;
//     scheduleTime: string;
// }

// const ContentPreview: React.FC<ContentPreviewProps> = ({ content, scheduleTime }) => {
//     return (
//         <div className="lg:col-span-5 space-y-6">
//             <h2 className="text-xl font-bold text-headings dark:text-white lg:mt-0">Preview</h2>
//             <div className="bg-navbarBg border border-border rounded-xl overflow-hidden shadow-sm">
//                 <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//                     {content ? (
//                         <>
//                             <img
//                                 src={content.thumbnail}
//                                 alt="Preview"
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 flex items-center justify-center">
//                                 <div className="w-12 h-12 bg-bgBlue rounded-full flex items-center justify-center shadow-lg cursor-pointer">
//                                     <Play className="w-6 h-6 text-white fill-current ml-1" />
//                                 </div>
//                             </div>
//                         </>
//                     ) : (
//                         <div className="flex flex-col items-center gap-2 text-muted">
//                             <Video className="w-12 h-12 opacity-20" />
//                             <span className="text-sm">No content preview</span>
//                         </div>
//                     )}
//                 </div>
//                 <div className="p-6 space-y-4">
//                     <div className="flex items-center gap-3 text-muted">
//                         <Video className="w-5 h-5" />
//                         <span className="text-sm font-medium">Video: {content?.name || "None"}</span>
//                     </div>
//                     <div className="flex items-center gap-3 text-muted">
//                         <Clock className="w-5 h-5" />
//                         <span className="text-sm font-medium">{scheduleTime || "Mon, Tue, Wed, Thu, Fri • 09:00 AM"}</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ContentPreview;
