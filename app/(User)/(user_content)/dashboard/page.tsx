"use client";

import { useState, useRef } from "react";
import {
  Monitor,
  Wifi,
  HardDrive,
  Calendar,
  TrendingUp,

  Tv,
  Video,
  ArrowUpRight,
  ScreenShare,
  WifiOff,
  Plus,
  CloudUpload,
  Activity,
  TvMinimal,
  UserRoundCog,
} from "lucide-react";

import ActionCardButton from "@/common/ActionCardButton";
import CreateScreenModal from "@/components/dashboard/CreateScreenModal";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import Link from "next/link";
import DashboardBannerSystem from "@/components/dashboard/DashboardBannerSystem";
import { formatDistanceToNow } from "date-fns";
import { useGetAllActivitiesQuery, useGetAllStatsQuery, useGetAllDevicesQuery } from "@/redux/api/users/dashboard/activityApi";
import CommonLoader from "@/common/CommonLoader";
import CreateScheduleDialog from "../schedules/_components/CreateScheduleDialog";
import UploadFileModal from "@/components/content/UploadFileModal";
import DeviceLocation from "@/components/common/DeviceLocation";

export default function Dashboard() {
  const { data: statsData } = useGetAllStatsQuery(undefined);
  const { data: devicesData } = useGetAllDevicesQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const { data: activityData } = useGetAllActivitiesQuery();
  const activities = activityData?.data?.slice(0, 4) || [];

  const devices = devicesData?.data || [];

  const totalDevices = statsData?.data?.totalDevices || 0;
  const onlineDevices = statsData?.data?.onlineDevices || 0;
  const offlineDevices = statsData?.data?.offlineDevices || 0;

  function handleSaveSchedule(data: unknown): void {
    console.log("Saved schedule:", data);
    setIsScheduleModalOpen(false);
  }


  return (
    <div className="min-h-screen">
      {/* Header Section - Banner System */}
      <DashboardBannerSystem />

      {/* Stats Cards - Redesigned to match image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Devices */}
        <div className="bg-[#F0F7FF] border border-[#E0F2FE] rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-[#3BA5FF] bg-white">
              <Monitor className="w-5 h-5 text-[#3BA5FF]" />
            </span>
            <span className="text-[15px] font-medium text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Total Devices</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[32px] font-bold text-[#111827]" style={{ fontFamily: "Inter, sans-serif" }}>{totalDevices}</span>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
              <TrendingUp className="w-4 h-4" />
              <span>{statsData?.data?.newDevicesThisWeek ?? 0} This Week</span>
            </div>
          </div>
        </div>

        {/* Online Status */}
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-[#22C55E] bg-white">
              <Wifi className="w-5 h-5 text-[#22C55E]" />
            </span>
            <span className="text-[15px] font-medium text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Online Status</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[32px] font-bold text-[#111827]" style={{ fontFamily: "Inter, sans-serif" }}>{onlineDevices}</span>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
              <TrendingUp className="w-4 h-4" />
              <span>0 This Week</span>
            </div>
          </div>
        </div>

        {/* Offline Status */}
        <div className="bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-[#EF4444] bg-white">
              <WifiOff className="w-5 h-5 text-[#EF4444]" />
            </span>
            <span className="text-[15px] font-medium text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Offline Status</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-[32px] font-bold text-[#111827]" style={{ fontFamily: "Inter, sans-serif" }}>{offlineDevices}</span>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
              <TrendingUp className="w-4 h-4" />
              <span>0 This Week</span>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-5 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full border border-[#6B7280] bg-white">
              <HardDrive className="w-5 h-5 text-[#374151]" />
            </span>
            <span className="text-[15px] font-medium text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>Storage</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-bold text-[#111827]" style={{ fontFamily: "Inter, sans-serif" }}>
                {statsData?.data?.usedStorageGb ?? 0}/{statsData?.data?.totalStorageGb ?? 0}
              </span>
              <span className="text-sm font-semibold text-gray-900 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>GB</span>
            </div>
            <Link href="/choose-plan" className="text-[14px] font-medium text-[#0FA6FF] hover:text-[#0d8ad4] flex items-center gap-1 mb-2 transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>
              Upgrade <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Add New Section - Background image preserved */}
      <div className="rounded-xl shadow-sm p-6 mb-6 add-bg-img">
        <h2 className="text-lg font-semibold newAdd mb-4">Add New</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <ActionCardButton
            onClick={() => setIsModalOpen(true)}
            icon={<ScreenShare className="text-white w-4 h-4" />}
            title="Create Program"
            // subtitle="Create a new screen to play on your devices"
            active
          />
          <button
            onClick={() => setIsAddDeviceModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-navbarBg cursor-pointer transition-colors hover:shadow-sm"
          >
            <Tv className="w-8 h-8 text-[#155DFC] p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Add Device</div>
            </div>
            <span className="ml-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-full"><Plus className="w-4 h-4 text-bgBlue" /></span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-navbarBg cursor-pointer transition-colors hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
          >
            <Video className="w-8 h-8 text-[#155DFC] p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Upload Content</div>
            </div>
            <span className="ml-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-full"><CloudUpload className="w-4 h-4 text-bgBlue" /></span>
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-navbarBg cursor-pointer transition-colors hover:shadow-sm"
          >
            <Calendar className="w-8 h-8 text-[#155DFC] p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Schedule</div>
            </div>
            <span className="ml-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-full"><Plus className="w-4 h-4 text-bgBlue" /></span>
          </button>
        </div>
      </div>

      {/* Recent Devices & Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Devices */}
        <div className="bg-navbarBg rounded-[20px] shadow-sm border border-borderGray overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-navbarBg border-b border-borderGray">
            <h2 className="text-[20px] font-semibold text-headings" style={{ fontFamily: "Inter, sans-serif" }}>
              Recent Devices
            </h2>
            <Link
              href="/devices"
              className="text-sm font-medium text-headings bg-navbarBg border border-border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              View All
            </Link>
          </div>

          <div className="p-6 space-y-4">
            {devices.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent devices</div>
            ) : (
              devices.slice(0, 3).map((device, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 border border-border rounded-[20px] bg-navbarBg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[16px] font-semibold text-headings" style={{ fontFamily: "Inter, sans-serif" }}>
                          {typeof device.name === 'object' ? 'Device' : (device.name || "Unknown Device")}
                        </span>
                        <div
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-medium ${device.status === "ONLINE"
                            ? "bg-[#F0FDF4] text-[#22C55E] border-[#DCFCE7]"
                            : "bg-[#FEF2F2] text-[#EF4444] border-[#FEE2E2]"
                            }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${device.status === "ONLINE" ? "bg-[#22C55E]" : "bg-[#EF4444]"}`}></div>
                          {device.status === "ONLINE" ? "Online" : "Offline"}
                        </div>
                      </div>
                      {/* <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                        <MoreVertical className="w-5 h-5" />
                      </button> */}
                    </div>
                    <div className="text-[14px] text-muted mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                      3840 × 2160
                    </div>
                    <div className="text-[14px] text-body font-medium uppercase" style={{ fontFamily: "Inter, sans-serif" }}>
                      {device.location && typeof device.location === 'object' && (device.location as any).lat !== undefined ? (
                        <DeviceLocation lat={(device.location as any).lat} lng={(device.location as any).lng} />
                      ) : (
                        (device.location as string) || "LA, USA"
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-navbarBg rounded-[20px] shadow-sm border border-borderGray overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-navbarBg border-b border-borderGray">
            <h2 className="text-[20px] font-semibold text-headings" style={{ fontFamily: "Inter, sans-serif" }}>
              Recent Activities
            </h2>
            <Link
              href="/activity"
              className="text-sm font-medium text-headings bg-navbarBg border border-border px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              View All
            </Link>
          </div>

          <div className="p-6 space-y-4">
            {activities.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent activities</div>
            ) : (
              activities.map((activity: any, index: number) => (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start gap-4 p-5 border border-border rounded-[20px] bg-navbarBg"
                >
                  <div className="w-10 h-10 rounded-full bg-[rgba(21,93,252,0.08)] p-2.5 flex items-center justify-center shrink-0">
                    {activity.actionType.toLowerCase().includes("device") ? (
                      <TvMinimal className="w-5 h-5 text-[#3BA5FF]" />
                    ) : activity.actionType.toLowerCase().includes("account") ? (
                      <UserRoundCog className="w-5 h-5 text-[#3BA5FF]" />
                    ) : (
                      <Activity className="w-5 h-5 text-[#3BA5FF]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-[15px] font-semibold text-headings truncate" style={{ fontFamily: "Inter, sans-serif" }}>
                        {typeof activity.actionType === 'object' ? 'Activity' : (activity.actionType || "Activity")}
                      </h4>
                      <span className="text-[13px] text-gray-400 shrink-0" style={{ fontFamily: "Inter, sans-serif" }}>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[14px] text-body mt-1 line-clamp-1" style={{ fontFamily: "Inter, sans-serif" }}>
                      {typeof activity.description === 'object' ? 'Activity Details' : (activity.description || "No description provided")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateScreenModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <AddDeviceModal isOpen={isAddDeviceModalOpen} onClose={() => setIsAddDeviceModalOpen(false)} />
      {/* Create Schedule Dialog */}
      <CreateScheduleDialog open={isScheduleModalOpen} setOpen={setIsScheduleModalOpen} />

      {/* Upload File Modal */}
      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        setIsPageLoading={setIsPageLoading}
      />

      {/* Full Page Loader Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700">
            <CommonLoader size={56} text="Uploading files..." />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Please do not close this page</p>
          </div>
        </div>
      )}
    </div>
  );
}