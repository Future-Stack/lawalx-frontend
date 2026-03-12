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
import Image from "next/image";
import Link from "next/link";
import ScheduleModal from "@/components/schedules/CreateScheduleModal";
import { formatDistanceToNow } from "date-fns";
import { useGetAllActivitiesQuery } from "@/redux/api/users/dashboard/activityApi";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const devices = [
    { name: "Lobby Screen", online: true, location: "Head Office", screen: "Screen 1" },
    { name: "Conference Room", online: false, location: "Floor 2", screen: "Screen 2" },
    { name: "Reception Display", online: true, location: "USA Branch", screen: "Screen 5" },
    { name: "Meeting Room", online: false, location: "California Branch", screen: "Screen 1" },
  ];

  const { data: activityData } = useGetAllActivitiesQuery();
  const activities = activityData?.data?.slice(0, 4) || [];

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.online).length;
  const offlineDevices = devices.filter((d) => !d.online).length;

  function handleSaveSchedule(data: unknown): void {
    console.log("Saved schedule:", data);
    setIsScheduleModalOpen(false);
  }

  return (
    <div className="min-h-screen">
      {/* Header Section - Keeps your gradient & images */}
      <div className="flex items-center justify-center md:justify-between mb-6 dashboard-header-bg p-6 rounded-xl">
        <div className="ml-0 space-y-1.5 md:ml-0 lg:ml-10">
          <h1 className="text-2xl font-bold text-white">
            Go Live on Any Screen Instantly
          </h1>
          <p className="text-sm text-gray-200">
            Create your first screen and start displaying your content in minutes.
          </p>
          <button className="bg-bgBlue shadow-customShadow px-4 py-2 rounded-lg text-white mt-4 hover:bg-gray-400 transition-colors text-sm font-medium cursor-pointer flex items-center gap-2">
            Upload Content
          </button>
        </div>
        <div className="md:mr-2 lg:mr-4 xl:mr-10 md:block hidden">
          <Image
            src="/userDashboard/img3.webp"
            alt="Dashboard Header"
            height={165}
            width={165}
            style={{ transform: "scale(1.25)" }}
          />
        </div>
      </div>

      {/* Stats Cards - Same colors in light, dark-adapted */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-info-bg border border-border rounded-xl shadow-sm p-4 flex flex-col gap-6 justify-between">
          <div className="flex items-center mb-2">
            <span className="mt-0.5 p-2.5 border rounded-full border-bgBlue mr-2 bg-white dark:bg-gray-800">
              <Monitor className="w-7 h-7 text-bgBlue" />
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Total Devices</span>
          </div>
          <div className="flex items-center justify-between text-gray-900 dark:text-white mb-2">
            <span className="text-2xl font-semibold">{totalDevices}</span>
            <div className="text-sm text-green-500 dark:text-green-400 flex items-center gap-1 mb-2">
              <TrendingUp className="w-4 h-4" />
              {totalDevices > 0 ? `${totalDevices} New This Week` : "0 New This Week"}
            </div>
          </div>
        </div>

        <div className="bg-success-bg rounded-xl shadow-sm border border-border p-4 flex flex-col gap-6 justify-between">
          <div className="flex items-center mb-2">
            <span className="mt-0.5 p-2.5 border rounded-full border-bgGreen mr-2 bg-white dark:bg-gray-800">
              <Wifi className="w-7 h-7 text-bgGreen" />
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Online Status</span>
          </div>
          <div className="flex items-center justify-between text-gray-900 dark:text-white mb-1">
            <span className="text-2xl font-semibold">{onlineDevices}</span>
            <div className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              {offlineDevices} Offline <TriangleAlertIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-destructive-bg shadow-sm border border-border rounded-xl p-4 flex flex-col gap-6 justify-between">
          <div className="flex items-center mb-2">
            <span className="mt-0.5 p-2.5 border rounded-full border-bgRed mr-2 bg-white dark:bg-gray-800">
              <WifiOff className="w-7 h-7 text-bgRed" />
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Offline Status</span>
          </div>
          <div className="flex items-center justify-between text-gray-900 dark:text-white mb-1">
            <span className="text-2xl font-semibold">{onlineDevices}</span>
            <div className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
              {offlineDevices} Offline <TriangleAlertIcon className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-card-bg shadow-sm border border-border dark:border-gray-700 rounded-xl p-4 flex flex-col gap-6 justify-between">
          <div className="flex items-center mb-2">
            <span className="mt-0.5 p-2.5 border rounded-full border-gray-600 dark:border-gray-500 mr-2 bg-white dark:bg-gray-800">
              <HardDrive className="w-7 h-7 text-gray-600 dark:text-gray-400" />
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">Storage</span>
          </div>
          <div className="flex items-center justify-between text-gray-900 dark:text-white mb-1">
            <span className="text-xl font-semibold">5.0/10 GB</span>
            <Link href="/choose-plan" className="text-sm text-bgBlue hover:text-blue-400">
              Upgrade <ArrowUpRight className="w-4 h-4 inline-block" />
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
            <button className="text-sm text-bgBlue hover:text-blue-400 cursor-pointer">
              View All
            </button>
          </div>

          <div className="space-y-3 p-6">
            {devices.map((device, index) => (
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
                      className={`text-xs px-2 py-0.5 rounded-md border flex items-center gap-1 ${device.online
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        }`}
                    >
                      {device.online ? (
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
                  <div className="text-sm text-gray-600 dark:text-gray-400">{device.location}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{device.screen}</div>
                </div>
              </div>
            ))}
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