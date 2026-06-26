"use client";

import { ContentItem } from "@/types/content";

interface FileOverviewProps {
  content: ContentItem;
  fileTypeDisplay: string;
}

const FileOverview = ({ content, fileTypeDisplay }: FileOverviewProps) => {
  return (
    <div className="bg-navbarBg rounded-xl border h-full border-border p-4 sm:p-6">
      <h2 className="text-lg md:text-2xl font-semibold text-headings">
        Overview
      </h2>

      <div className="space-y-0">
        {/* File Type */}
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-sm md:text-base text-textGray">
            File Type:
          </span>
          <span className="px-3 py-1 text-body text-xs md:text-sm rounded shadow-customShadow">
            {fileTypeDisplay}
          </span>
        </div>

        {/* File Size */}
        <div className="flex items-center justify-between py-4 border-b border-border">
          <span className="text-sm md:text-base text-muted">
            File Size:
          </span>
          <span className="text-muted text-xs md:text-sm">
            {content.size}
          </span>
        </div>

        {/* Duration */}
        {content.duration && (
          <div className="flex items-center justify-between py-4 border-b border-border">
            <span className="text-sm md:text-base text-muted">
              Duration:
            </span>
            <span className="text-muted text-xs md:text-sm">
              {content.duration}
            </span>
          </div>
        )}

        {/* Uploaded Date */}
        {content.uploadedDate && (
          <div className="flex items-center justify-between py-4 border-b border-border">
            <span className="text-sm md:text-base text-muted">
              {content.type === "folder" ? "Created:" : "Uploaded:"}
            </span>
            <span className="text-muted text-xs md:text-sm">
              {content.uploadedDate}
            </span>
          </div>
        )}

        {/* Total Assigned Devices */}
        <div className="py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start justify-between">
            <div className="flex flex-row sm:flex-col sm:space-y-2 mb-3 sm:mb-0 gap-2 sm:gap-0 items-center sm:items-start">
              <span className="text-sm md:text-base text-headings">
                Total Assigned Devices:
              </span>
              <span className="text-Heading text-base md:text-lg font-medium">
                {content.assignedDevices?.length || 0}
              </span>
            </div>
            <div className="space-y-2">
              {(content.assignedDevices || []).map((device, index) => (
                <div
                  key={index}
                  className="text-muted text-xs md:text-sm"
                >
                  <span className="font-medium">{index + 1}.</span>{" "}
                  {device}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Assigned Playlists */}
        <div className="py-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start justify-between">
            <div className="flex flex-row sm:flex-col sm:space-y-2 mb-3 sm:mb-0 gap-2 sm:gap-0 items-center sm:items-start">
              <span className="text-sm md:text-base text-headings">
                Total Assigned Playlists:
              </span>
              <span className="text-Heading text-base md:text-lg font-medium">
                {content.assignedPlaylists?.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {(content.assignedPlaylists || []).map(
                (playlist, index) => (
                  <div
                    key={index}
                    className="text-muted text-xs md:text-sm"
                  >
                    <span className="font-medium">{index + 1}.</span>{" "}
                    {playlist}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Schedules */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row items-start justify-between">
            <div className="flex flex-row sm:flex-col sm:space-y-2 mb-3 sm:mb-0 gap-2 sm:gap-0 items-center sm:items-start">
              <span className="text-sm md:text-base text-headings">
                Schedules:
              </span>
              <span className="text-Heading text-base md:text-lg font-medium">
                {content.schedules?.length || 0}
              </span>
            </div>
            <div className="space-y-2">
              {(content.schedules || []).map((schedule, index) => (
                <div
                  key={index}
                  className="text-muted text-xs md:text-sm"
                >
                  <span className="">{index + 1}.</span> {schedule}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileOverview;
