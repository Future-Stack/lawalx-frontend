/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { FileText, Tv, ChevronDown, ChevronUp, Monitor, WifiOff, ListTree, Clock } from "lucide-react";
import ResolvedLocation from "@/common/ResolvedLocation";

interface ProgramOverviewProps {
  assignedContent: string;
  isDevicesExpanded: boolean;
  setIsDevicesExpanded: (expanded: boolean) => void;
  program: any;
  lastUpdated: string;
}

const ProgramOverview = ({
  assignedContent,
  isDevicesExpanded,
  setIsDevicesExpanded,
  program,
  lastUpdated
}: ProgramOverviewProps) => {
  return (
    <div className="rounded-xl border border-border p-4 sm:p-6 bg-navbarBg">
      <h3 className="text-xl md:text-2xl font-semibold text-headings mb-3 sm:mb-4">
        Overview
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {/* Content */}
        <div className="flex justify-between items-center py-2 border-b border-border">
          <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
            <FileText className="w-5 h-5 text-body" />
            <span className="text-sm sm:text-base text-body truncate">
              Content
            </span>
          </div>
          <div className="text-sm sm:text-base font-medium text-body text-right w-[40%] truncate">
            {assignedContent}
          </div>
        </div>

        {/* Total Devices */}
        <div className="py-2 border-b border-borderGray">
          <div
            className="flex justify-between items-center cursor-pointer group"
            onClick={() => setIsDevicesExpanded(!isDevicesExpanded)}
          >
            <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
              <Tv className="w-5 h-5 text-body group-hover:text-bgBlue transition-colors" />
              <span className="text-sm sm:text-base text-body truncate font-medium">
                Total Devices
              </span>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="text-sm sm:text-base font-semibold text-headings">
                {program.devices?.length || 0}
              </span>
              {isDevicesExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </div>
          </div>

          {/* Expanded Devices List */}
          {isDevicesExpanded && program.devices && program.devices.length > 0 && (
            <div className="mt-4 space-y-2 pl-8 sm:pl-9 animate-in slide-in-from-top-2 duration-300">
              {program.devices.map((device: any) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between text-sm text-muted py-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md px-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-bgBlue shrink-0" />
                      <span className="truncate font-medium text-headings text-base tracking-tight">{device.name || "Unnamed Device"}</span>
                    </div>
                    {device.location && (
                      <div className="flex items-center gap-1.5 pl-7 text-[12px] text-muted font-medium">
                        <ResolvedLocation
                          lat={device.location.lat}
                          lng={device.location.lng}
                          className="truncate"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actionable Status Badge */}
                  <div className="shrink-0">
                    {device.status === "ONLINE" ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Online
                      </div>
                    ) : device.status === "OFFLINE" ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[10px] font-bold">
                        <WifiOff className="w-3 h-3" />
                        Offline
                      </div>
                    ) : device.status === "PAIRED" ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        Paired
                      </div>
                    ) : device.status === "WAITING" ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        Waiting
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F5F5F5] border border-[#E5E5E5] text-[#737373] text-[10px] font-bold">
                        {device.status}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution */}
        <div className="flex justify-between items-center py-2 border-b border-borderGray">
          <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
            <ListTree className="w-5 h-5 text-body" />
            <span className="text-sm sm:text-base text-body truncate">
              Resolution
            </span>
          </div>
          <div className="text-sm sm:text-base font-medium text-body text-right w-[40%] truncate">
            {program.serene_size || "1920x1080"}
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2 sm:gap-3 w-[60%]">
            <Clock className="w-5 h-5 text-body" />
            <span className="text-sm sm:text-base text-body truncate">
              Last Updated
            </span>
          </div>
          <div className="text-sm sm:text-base font-medium text-body text-right w-[40%] truncate">
            {lastUpdated}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramOverview;
