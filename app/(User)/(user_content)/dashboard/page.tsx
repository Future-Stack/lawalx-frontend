"use client";

import { useState } from "react";
import {
  Monitor,
  Wifi,
  HardDrive,
  Calendar,
  TrendingUp,
  Bell,
  Tv,
  Video,
  ArrowUpRight,
  ScreenShare,
  WifiOff,
  TriangleAlertIcon,
  Plus,
  CloudUpload,
  Activity,
} from "lucide-react";

import ActionCardButton from "@/common/ActionCardButton";
import CreateScreenModal from "@/components/dashboard/CreateScreenModal";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";
import Link from "next/link";
import ScheduleModal from "@/components/schedules/CreateScheduleModal";
import DashboardBannerSystem from "@/components/dashboard/DashboardBannerSystem";
import { formatDistanceToNow } from "date-fns";
import { useGetAllActivitiesQuery, useGetAllStatsQuery, useGetAllDevicesQuery } from "@/redux/api/users/dashboard/activityApi";

export default function Dashboard() {
  const { data: statsData } = useGetAllStatsQuery(undefined);
  const { data: devicesData } = useGetAllDevicesQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  console.log("statsData", statsData);

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
            title="Create Screen"
            // subtitle="Create a new screen to play on your devices"
            active
          />
          <button
            onClick={() => setIsAddDeviceModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-navbarBg cursor-pointer transition-colors hover:shadow-md"
          >
            <Tv className="w-8 h-8 text-[#155DFC] p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Add Device</div>
            </div>
            <span className="ml-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-full"><Plus className="w-4 h-4 text-bgBlue" /></span>
          </button>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-navbarBg cursor-pointer transition-colors hover:shadow-md">
            <Video className="w-8 h-8 text-[#155DFC] p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Upload Content</div>
            </div>
            <span className="ml-auto bg-gray-50 dark:bg-gray-800 p-2 rounded-full"><CloudUpload className="w-4 h-4 text-bgBlue" /></span>
          </button>
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-navbarBg cursor-pointer transition-colors hover:shadow-md"
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
        <div className="bg-navbarBg rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between p-6 border-b border-borderGray dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Devices
            </h2>
            <Link href="/devices" className="text-sm text-bgBlue hover:text-blue-400 cursor-pointer">
              View All
            </Link>
          </div>

          <div className="space-y-3 p-6">
            {devices.length === 0 ? (
              <div className="text-center text-gray-500 py-4 dark:text-gray-400">No recent devices</div>
            ) : (
              devices.map((device, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-navbarBg"
                >
                  <span className="mt-0.5 p-2.5 border rounded-sm border-gray-200 dark:border-gray-600">
                    <Monitor className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {device.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md border flex items-center gap-1 ${device.status === "ONLINE"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                          }`}
                      >
                        {device.status === "ONLINE" ? (
                          <>
                            <Wifi className="w-3 h-3" />
                            Online
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-3 h-3" />
                            Offline
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{device.location || "No location"}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {device.updatedAt ? formatDistanceToNow(new Date(device.updatedAt), { addSuffix: true }) : ""}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-navbarBg rounded-xl shadow-sm border border-border">
          <div className="flex items-center justify-between border-b p-6 border-borderGray dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activities
            </h2>
            <Link href="/activity" className="text-sm text-bgBlue hover:text-blue-400 cursor-pointer">
              View All
            </Link>
          </div>

          <div className="space-y-3 p-6">
            {activities.length === 0 ? (
              <div className="text-center text-gray-500 py-4 dark:text-gray-400">No recent activities</div>
            ) : (
              activities.map((activity: any, index: number) => (
                <div
                  key={`${activity.id}-${index}`}
                  className="flex items-start gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-navbarBg"
                >
                  <span className="mt-0.5 p-2.5 border rounded-full border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                    <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {activity.actionType}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
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
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={handleSaveSchedule}
      />
    </div>
  );
}