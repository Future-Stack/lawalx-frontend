/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X, FileText, Video, Monitor, CircleCheckBigIcon,
  Wifi, WifiOff, Search, ChevronLeft, ChevronRight, Loader2, Headphones, Plus,
} from "lucide-react";
import Dropdown from "@/common/Dropdown";
import Image from "next/image";
import { useGetAllFilesQuery } from "@/redux/api/users/content/content.api";
import { transformFile } from "@/lib/content-utils";
import { useCreateProgramMutation } from "@/redux/api/users/programs/programs.api";
import { useGetMyDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { WorkoutStatus } from "@/redux/api/users/programs/programs.type";
import UploadFileModal from "@/components/content/UploadFileModal";
import { toast } from "sonner";

interface CreateScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateScreenModal({ isOpen, onClose }: CreateScreenModalProps) {
  const { data: allFiles, isLoading: isFilesLoading } = useGetAllFilesQuery(undefined);
  const { data: devicesData, isLoading: isDevicesLoading } = useGetMyDevicesDataQuery(undefined);
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [programData, setProgramData] = useState<{
    name: string;
    description: string;
    serene_size: string;
    status: WorkoutStatus;
    content_ids: string[];
    device_ids: string[];
  }>({
    name: "",
    description: "",
    serene_size: "1920x1080",
    status: WorkoutStatus.DRAFT,
    content_ids: [],
    device_ids: [],
  });

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
    };
  }, [isOpen]);

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
      else if (selectedType === "all") matchesType = true;
      return matchesSearch && matchesType;
    });
  }, [transformedFiles, searchQuery, selectedType]);

  const devices = useMemo(() => {
    if (!devicesData?.data) return [];
    return devicesData.data;
  }, [devicesData]);

  // ─── Reset modal state when closed ───────────────────────────────────────────
  const handleClose = () => {
    setCurrentStep(1);
    setSearchQuery("");
    setSelectedType("all");
    setProgramData({
      name: "",
      description: "",
      serene_size: "1920x1080",
      status: WorkoutStatus.DRAFT,
      content_ids: [],
      device_ids: []
    });
    onClose();
  };

  const handleNext = () => {
    // Validate before moving forward
    if (currentStep === 1) {
      if (!programData.name.trim()) {
        toast.error("Please enter a program name");
        return;
      }
    }
    if (currentStep === 2) {
      if (programData.content_ids.length === 0) {
        toast.error("Please select at least one content");
        return;
      }
    }
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  // ─── Toggle content selection (step 2) ───────────────────────────────────────
  const toggleVideoSelection = (contentId: string) => {
    setProgramData((prev) => ({
      ...prev,
      content_ids: prev.content_ids.includes(contentId)
        ? prev.content_ids.filter((id) => id !== contentId)
        : [...prev.content_ids, contentId],
    }));
  };

  // ─── Toggle device selection (step 3) ────────────────────────────────────────
  const toggleDeviceSelection = (deviceId: string) => {
    setProgramData((prev) => ({
      ...prev,
      device_ids: prev.device_ids.includes(deviceId)
        ? prev.device_ids.filter((id) => id !== deviceId)
        : [...prev.device_ids, deviceId],
    }));
  };

  // ─── Final submit ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!programData.name.trim()) {
      toast.error("Please enter a program name");
      setCurrentStep(1);
      return;
    }
    if (programData.content_ids.length === 0) {
      toast.error("Please select at least one content");
      setCurrentStep(2);
      return;
    }

    try {
      console.log("Program Payload:", programData);
      const response = await createProgram(programData).unwrap();
      console.log("api response data", response);

      if (response.success) {
        toast.success(response.message || "Program created successfully");
        handleClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create program");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-bgGray dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-6 gap-4 sm:gap-0">
          <h2 className="text-xl sm:text-3xl font-bold text-Headings dark:text-white text-nowrap">
            Create New Program
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 hover:bg-gray-100 md:p-2 p-1 rounded-full dark:hover:text-gray-300 transition-colors self-end sm:self-auto cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center md:justify-between px-6 py-5 border-b border-borderGray dark:border-gray-700 gap-4">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep > 1
              ? "bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800"
              : currentStep === 1
                ? "bg-blue-50 dark:bg-blue-900/20 border border-bgBlue dark:border-blue-700"
                : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
              }`}>
              {currentStep > 1
                ? <CircleCheckBigIcon className="w-6 h-6 text-bgGreen" />
                : <FileText className={`w-6 h-6 ${currentStep >= 1 ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"}`} />
              }
            </div>
            <div>
              <div className={`sm:font-semibold font-normal text-xs sm:text-base ${currentStep >= 1 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>Step 1</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Program Information</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep > 2
              ? "bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800"
              : currentStep === 2
                ? "bg-blue-50 dark:bg-blue-900/20 border border-bgBlue dark:border-blue-700"
                : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
              }`}>
              {currentStep > 2
                ? <CircleCheckBigIcon className="w-6 h-6 text-bgGreen" />
                : <Video className={`w-6 h-6 ${currentStep >= 2 ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"}`} />
              }
            </div>
            <div>
              <div className={`sm:font-semibold font-normal text-xs sm:text-base ${currentStep >= 2 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>Step 2</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Content Selection</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep === 3
              ? "bg-blue-50 dark:bg-blue-900/20 border border-bgBlue dark:border-blue-700"
              : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
              }`}>
              <Monitor className={`w-6 h-6 ${currentStep >= 3 ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"}`} />
            </div>
            <div>
              <div className={`sm:font-semibold font-normal text-xs sm:text-base ${currentStep >= 3 ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>Step 3</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Device Selection</div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Step 1: Program Info ─────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Name</label>
                <input
                  type="text"
                  value={programData.name}
                  onChange={(e) => setProgramData({ ...programData, name: e.target.value })}
                  placeholder="Store A - NYC"
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
                <textarea
                  value={programData.description}
                  onChange={(e) => setProgramData({ ...programData, description: e.target.value })}
                  placeholder="Enter program description"
                  rows={6}
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Screen Size</label>
                <Dropdown
                  options={[
                    { value: "1920x1080", label: "Full HD (1920x1080)" },
                    { value: "1280x720", label: "HD (1280x720)" },
                    { value: "3840x2160", label: "4K (3840x2160)" },
                    { value: "1080x1920", label: "Portrait (1080x1920)" },
                  ]}
                  value={programData.serene_size}
                  onChange={(value) => setProgramData({ ...programData, serene_size: String(value) })}
                  className="w-full cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Content Selection ────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Selected count badge */}
              {/* {programData.content_ids.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <CircleCheckBigIcon className="w-4 h-4" />
                  {programData.content_ids.length} content{programData.content_ids.length > 1 ? "s" : ""} selected
                </div>
              )} */}

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                <div className="relative w-full sm:w-1/2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search Content"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-1/2">
                  <div className="flex-1">
                    <Dropdown
                      options={[
                        { value: "all", label: "All Content" },
                        { value: "video", label: "Videos" },
                        { value: "image", label: "Images" },
                        { value: "audio", label: "Audio" },
                      ]}
                      value={selectedType}
                      onChange={(value) => setSelectedType(String(value))}
                      className="w-full cursor-pointer"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-bgBlue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer shrink-0 shadow-customShadow"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Upload Content</span>
                  </button>
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
                      className={`flex items-center gap-4 p-4 border-b last:border-b-0 cursor-pointer transition-colors ${programData.content_ids.includes(file.id)
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                      onClick={() => toggleVideoSelection(file.id)}
                    >
                      <input
                        type="checkbox"
                        checked={programData.content_ids.includes(file.id)}
                        onChange={() => toggleVideoSelection(file.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {file.type === "image" && file.thumbnail ? (
                          <Image src={file.thumbnail} alt={file.title} width={80} height={56} className="w-full h-full object-cover" />
                        ) : file.type === "video" && file.video ? (
                          <video src={file.video} className="w-full h-full object-cover" muted />
                        ) : file.type === "audio" ? (
                          <Headphones className="w-8 h-8 text-blue-500" />
                        ) : (
                          <div className="text-xs text-gray-400">No Preview</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">{file.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{file.size}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Device Selection ─────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Selected count badge */}
              {/* {programData.device_ids.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium">
                  <CircleCheckBigIcon className="w-4 h-4" />
                  {programData.device_ids.length} device{programData.device_ids.length > 1 ? "s" : ""} selected
                </div>
              )} */}

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Select Devices <span className="text-gray-400 font-normal">(optional)</span>
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
                        className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${programData.device_ids.includes(device.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        onClick={() => toggleDeviceSelection(device.id)}
                      >
                        <input
                          type="checkbox"
                          checked={programData.device_ids.includes(device.id)}
                          onChange={() => toggleDeviceSelection(device.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white truncate">{device.name}</span>
                            <span className={`text-xs px-2 py-1 border rounded-md flex items-center gap-1 flex-shrink-0 ${device.status === "ONLINE"
                              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                              : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                              }`}>
                              {device.status === "ONLINE" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                              {device.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{device.deviceSerial}</div>
                        </div>
                      </div>
                    ))
                  )}
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
            className={`flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 border border-borderGray dark:border-gray-600 rounded-lg font-medium transition-colors shadow-customShadow ${currentStep === 1
              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50"
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
              className="px-6 py-2.5 bg-bgBlue hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create"}
            </button>
          )}
        </div>

      </div>

      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        setIsPageLoading={setIsPageLoading}
      />

      {/* Full Page Loader Overlay */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-14 h-14 animate-spin text-bgBlue mb-2" />
            <p className="text-xl font-bold text-Headings dark:text-white">Uploading files...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Please do not close this page</p>
          </div>
        </div>
      )}
    </div>
  );
}