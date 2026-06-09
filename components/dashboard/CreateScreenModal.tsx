/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  X,
  FileText,
  Video,
  Monitor,
  CircleCheckBigIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useGetAllContentDataQuery } from "@/redux/api/users/content/content.api";
import { transformFile, transformFolder } from "@/lib/content-utils";
import { useCreateProgramMutation } from "@/redux/api/users/programs/programs.api";
import { useGetMyAllDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { WorkoutStatus } from "@/redux/api/users/programs/programs.type";
import UploadFileModal from "@/components/content/UploadFileModal";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import Step1ProgramInfo from "./create-program-steps/Step1ProgramInfo";
import Step2ContentSelection from "./create-program-steps/Step2ContentSelection";
import Step3DeviceSelection from "./create-program-steps/Step3DeviceSelection";

interface CreateScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateScreenModal({ isOpen, onClose, onSuccess }: CreateScreenModalProps) {
  const { data: allContentData, isLoading: isContentLoading } = useGetAllContentDataQuery(undefined);
  const { data: devicesData, isLoading: isDevicesLoading } = useGetMyAllDevicesDataQuery(undefined);
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [deletedContentIds, setDeletedContentIds] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
  }, []);

  const transformedContent = useMemo(() => {
    if (!allContentData?.data) return [];

    const folders = allContentData.data.folders
      .filter((folder: any) => !deletedContentIds.has(folder.id))
      .map((folder: any) => {
        const transFolder = transformFolder(folder, isMounted);
        if (transFolder.children) {
          transFolder.children = transFolder.children.filter((child: any) => !deletedContentIds.has(child.id));
        }
        return transFolder;
      });

    const rootFiles = allContentData.data.rootFiles
      .filter((file: any) => !deletedContentIds.has(file.id))
      .map((file: any) => transformFile(file, isMounted));

    return [...folders, ...rootFiles];
  }, [allContentData, isMounted, deletedContentIds]);

  const filteredContent = useMemo(() => {
    return transformedContent.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesType = true;
      if (selectedType === "video") matchesType = item.type === "video" || item.type === "folder";
      else if (selectedType === "image") matchesType = item.type === "image" || item.type === "folder";
      else if (selectedType === "audio") matchesType = item.type === "audio" || item.type === "folder";
      return matchesSearch && matchesType;
    });
  }, [transformedContent, searchQuery, selectedType]);

  const toggleFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const devices = useMemo(() => {
    if (!devicesData?.data) return [];
    return devicesData.data;
  }, [devicesData]);

  const selectableItems = useMemo(() => {
    if (isContentLoading || !isMounted || filteredContent.length === 0) return [];

    const itemMatchesFilter = (item: any) => {
      if (item.type === "folder") return false;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesType = true;
      if (selectedType === "video") matchesType = item.type === "video";
      else if (selectedType === "image") matchesType = item.type === "image";
      else if (selectedType === "audio") matchesType = item.type === "audio";
      return matchesSearch && matchesType;
    };

    const getFilteredSelectableItems = (items: any[]): any[] => {
      const result: any[] = [];
      items.forEach((item) => {
        if (item.type !== "folder") {
          result.push(item);
        } else if (item.children) {
          item.children.forEach((child: any) => {
            if (itemMatchesFilter(child)) {
              result.push(child);
            }
          });
        }
      });
      return result;
    };

    return getFilteredSelectableItems(filteredContent);
  }, [filteredContent, searchQuery, selectedType, isContentLoading, isMounted]);

  const allFilteredSelected = useMemo(() => {
    if (selectableItems.length === 0) return false;
    return selectableItems.every((item) => programData.content_ids.includes(item.id));
  }, [selectableItems, programData.content_ids]);

  const handleSelectAll = () => {
    const selectableIds = selectableItems.map((item) => item.id);
    if (selectableIds.length === 0) return;

    if (allFilteredSelected) {
      setProgramData((prev) => ({
        ...prev,
        content_ids: prev.content_ids.filter((id) => !selectableIds.includes(id)),
      }));
    } else {
      setProgramData((prev) => {
        const newIds = new Set([...prev.content_ids, ...selectableIds]);
        return {
          ...prev,
          content_ids: Array.from(newIds),
        };
      });
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSearchQuery("");
    setSelectedType("all");
    setDeletedContentIds(new Set());
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

  const toggleVideoSelection = (contentId: string) => {
    setProgramData((prev) => ({
      ...prev,
      content_ids: prev.content_ids.includes(contentId)
        ? prev.content_ids.filter((id) => id !== contentId)
        : [...prev.content_ids, contentId],
    }));
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setProgramData((prev) => ({
      ...prev,
      device_ids: prev.device_ids.includes(deviceId)
        ? prev.device_ids.filter((id) => id !== deviceId)
        : [...prev.device_ids, deviceId],
    }));
  };

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
      const response = await createProgram(programData).unwrap();
      if (response.success) {
        toast.success(response.message || "Program created successfully");
        if (onSuccess) onSuccess();
        handleClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create program");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent 
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-bgGray dark:border-gray-700 sm:max-w-[896px] w-[95vw] lg:w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl p-0 outline-none"
      >
        <DialogTitle className="sr-only">Create New Program</DialogTitle>
        <DialogDescription className="sr-only">Modal for creating a new program</DialogDescription>

        {/* Header matches original style exactly */}
        <div className="flex items-start sm:items-center justify-between p-6 gap-4 sm:gap-0">
          <h2 className="text-xl sm:text-3xl font-bold text-Headings dark:text-white text-nowrap">
            Create New Program
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-red-500 hover:bg-gray-100 md:p-2 p-1 rounded-full dark:hover:text-gray-300 transition-all self-end sm:self-auto cursor-pointer group">
            <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
          </button>
        </div>

        {/* Steps Indicator matches original style exactly */}
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

        {/* Content Area matches original style exactly */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <Step1ProgramInfo
              programData={programData}
              setProgramData={setProgramData}
            />
          )}

          {currentStep === 2 && (
            <Step2ContentSelection
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              setIsUploadModalOpen={setIsUploadModalOpen}
              filteredContent={filteredContent}
              isContentLoading={isContentLoading}
              isMounted={isMounted}
              programData={programData}
              setProgramData={setProgramData}
              expandedFolders={expandedFolders}
              setDeletedContentIds={setDeletedContentIds}
              deletingId={deletingId}
              setDeletingId={setDeletingId}
              toggleFolder={toggleFolder}
              toggleVideoSelection={toggleVideoSelection}
              selectableItems={selectableItems}
              allFilteredSelected={allFilteredSelected}
              handleSelectAll={handleSelectAll}
            />
          )}

          {currentStep === 3 && (
            <Step3DeviceSelection
              isDevicesLoading={isDevicesLoading}
              devices={devices}
              programData={programData}
              toggleDeviceSelection={toggleDeviceSelection}
            />
          )}
        </div>

        {/* Footer matches original style exactly */}
        <div className="flex items-center justify-center md:justify-between px-6 py-4 border-t border-borderGray dark:border-gray-700 gap-3">
          <button
            onClick={handlePrevious}
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
              className="px-6 py-2.5 bg-bgBlue hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-customShadow cursor-pointer flex items-center gap-2"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create"}
            </button>
          )}
        </div>
      </DialogContent>

      <UploadFileModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        setIsPageLoading={setIsPageLoading}
      />

      {/* Full Page Loader Overlay matches original style exactly */}
      {isPageLoading && (
        <div className="fixed inset-0 z-[3200] flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700">
            <Loader2 className="w-14 h-14 animate-spin text-bgBlue mb-2" />
            <p className="text-xl font-bold text-Headings dark:text-white">Uploading files...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Please do not close this page</p>
          </div>
        </div>
      )}
    </Dialog>
  );
}