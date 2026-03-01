// components/CreateScreenModal.tsx
"use client";

import { useState } from "react";
import {
  X,
  FileText,
  Video,
  Monitor,
  CircleCheckBigIcon,
  Wifi,
  WifiOff,
  Search,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Dropdown from "@/common/Dropdown";
import Image from "next/image";
import QRCodeDialog from "./QRCodeDialog";
import { useGetAllFilesQuery } from "@/redux/api/users/content/content.api";
import { useMemo, useEffect } from "react";
import { transformFile } from "@/lib/content-utils";
import { useCreateProgramMutation } from "@/redux/api/users/programs/programs.api";
import { useGetMyDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { toast } from "sonner";

interface CreateScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateScreenModal({
  isOpen,
  onClose,
}: CreateScreenModalProps) {
  const { data: allFiles, isLoading: isFilesLoading } = useGetAllFilesQuery(undefined);
  const { data: devicesData, isLoading: isDevicesLoading } = useGetMyDevicesDataQuery(undefined);
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState("video");
  const [showQr, setShowQr] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    selectedVideos: string[];
    selectedDevices: string[];
  }>({
    name: "",
    description: "",
    selectedVideos: [],
    selectedDevices: [],
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const transformedFiles = useMemo(() => {
    if (!allFiles?.data) return [];
    return allFiles.data.map((file: any) => transformFile(file, isMounted));
  }, [allFiles, isMounted]);

  const filteredFiles = useMemo(() => {
    return transformedFiles.filter((file) => {
      const matchesSearch = file.title.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesType = true;
      if (selectedType === "video") matchesType = file.type === "video";
      else if (selectedType === "image") matchesType = file.type === "image";
      else if (selectedType === "audio") matchesType = file.type === "audio";

      return matchesSearch && matchesType;
    });
  }, [transformedFiles, searchQuery, selectedType]);

  const devices = useMemo(() => {
    if (!devicesData?.data) return [];
    return devicesData.data;
  }, [devicesData]);

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a program name");
      setCurrentStep(1);
      return;
    }

    if (formData.selectedVideos.length === 0) {
      toast.error("Please select at least one content");
      setCurrentStep(2);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        content_ids: formData.selectedVideos,
        device_ids: formData.selectedDevices,
      };

      const response = await createProgram(payload).unwrap();

      if (response.success) {
        toast.success(response.message || "Program created successfully");
        setCurrentStep(1);
        setFormData({ name: "", description: "", selectedVideos: [], selectedDevices: [] });
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create program");
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedVideos: prev.selectedVideos.includes(videoId)
        ? prev.selectedVideos.filter((id) => id !== videoId)
        : [...prev.selectedVideos, videoId],
    }));
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDevices: prev.selectedDevices.includes(deviceId)
        ? prev.selectedDevices.filter((id) => id !== deviceId)
        : [...prev.selectedDevices, deviceId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-bgGray dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-6 gap-4 sm:gap-0">
          <h2 className="text-xl sm:text-3xl font-bold text-Headings dark:text-white text-nowrap">
            Create New Program
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 dark:hover:text-gray-300 transition-colors self-end sm:self-auto cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center md:justify-between px-6 py-5 border-b border-borderGray dark:border-gray-700 gap-4">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= 1
                ? "bg-blue-50 dark:bg-blue-900/20 border border-bgBlue dark:border-blue-700"
                : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                } ${currentStep > 1 ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20" : ""}`}
            >
              {currentStep > 1 ? (
                <CircleCheckBigIcon className="w-6 h-6 text-bgGreen" />
              ) : (
                <FileText
                  className={`w-6 h-6 ${currentStep >= 1 ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"
                    }`}
                />
              )}
            </div>
            <div>
              <div className={`sm:font-semibold font-normal text-xs sm:text-base ${currentStep >= 1 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                Step 1
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Program Information
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= 2
                ? "bg-blue-50 dark:bg-blue-900/20 border border-bgBlue dark:border-blue-700"
                : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                } ${currentStep > 2 ? "border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-900/20" : ""}`}
            >
              {currentStep > 2 ? (
                <CircleCheckBigIcon className="w-6 h-6 text-bgGreen" />
              ) : (
                <Video
                  className={`w-6 h-6 ${currentStep >= 2 ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"
                    }`}
                />
              )}
            </div>
            <div>
              <div className={`sm:font-semibold font-normal text-xs sm:text-base ${currentStep >= 2 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                Step 2
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Content Selection
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep >= 3
                ? "bg-blue-50 dark:bg-blue-900/20 border border-bgBlue dark:border-blue-700"
                : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                }`}
            >
              <Monitor
                className={`w-6 h-6 ${currentStep >= 3 ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"
                  }`}
              />
            </div>
            <div>
              <div className={`sm:font-semibold font-normal text-xs sm:text-base ${currentStep >= 3 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                Step 3
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Device Selection
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Store A - NYC"
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter program description"
                  rows={6}
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search Content"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="w-full sm:w-[200px]">
                  <Dropdown
                    options={[
                      { value: "video", label: "Videos" },
                      { value: "image", label: "Images" },
                      { value: "audio", label: "Audio" },
                    ]}
                    value={selectedType}
                    onChange={(value) => setSelectedType(String(value))}
                    className="w-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="border border-borderGray dark:border-gray-600 rounded-lg max-h-76 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {isFilesLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <span>Loading files...</span>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No files found matching your search.
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => toggleVideoSelection(file.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedVideos.includes(file.id)}
                        onChange={() => toggleVideoSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {file.type === "image" && file.thumbnail ? (
                          <Image
                            src={file.thumbnail}
                            alt={file.title}
                            width={80}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : file.type === "video" && file.video ? (
                          <video
                            src={file.video}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <div className="text-xs text-gray-400">No Preview</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {file.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{file.size}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select Devices
                </label>
                <div className="border border-borderGray dark:border-gray-600 rounded-lg divide-y dark:divide-gray-700 max-h-64 overflow-y-auto">
                  {isDevicesLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span>Loading devices...</span>
                    </div>
                  ) : devices.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No devices found.
                    </div>
                  ) : (
                    devices.map((device: any) => (
                      <div
                        key={device.id}
                        className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        onClick={() => toggleDeviceSelection(device.id)}
                      >
                        <input
                          type="checkbox"
                          checked={formData.selectedDevices.includes(device.id)}
                          onChange={() => toggleDeviceSelection(device.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">
                              {device.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 border rounded-md flex items-center gap-1 ${device.status === "ONLINE"
                                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                                }`}
                            >
                              {device.status === "ONLINE" ? (
                                <Wifi className="w-3 h-3" />
                              ) : (
                                <WifiOff className="w-3 h-3" />
                              )}
                              {device.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {device.deviceSerial}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Add New Device
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-1 min-w-[200px] gap-2">
                    <input
                      type="text"
                      placeholder="Enter the PIN or scan the QR code"
                      className="flex-1 px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button
                      onClick={() => setShowQr(true)}
                      className="p-3 border border-borderGray dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0 shadow-customShadow cursor-pointer"
                    >
                      <QrCode className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>

                  <div className="w-full sm:w-auto flex justify-end">
                    <button className="px-6 py-3 bg-gray-900 dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium shadow-customShadow cursor-pointer">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center md:justify-between px-6 py-4 border-t border-borderGray dark:border-gray-700 gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 border border-borderGray dark:border-gray-600 rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer ${currentStep === 1
              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden md:block">Previous</span>
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of 3</div>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-bgBlue hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer"
            >
              <span className="hidden md:block">Next</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="px-6 py-2.5 bg-bgBlue hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create"}
            </button>
          )}
        </div>
      </div>
      <QRCodeDialog open={showQr} setOpen={setShowQr} />
    </div>
  );
}