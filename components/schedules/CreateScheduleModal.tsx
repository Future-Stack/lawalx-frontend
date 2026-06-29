/* eslint-disable @typescript-eslint/no-explicit-any */
// components/schedules/CreateScheduleModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  FileText,
  Video,
  Monitor,
  Clock,
  CircleCheckBigIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCreateLowerThirdMutation } from "@/redux/api/users/schedules/schedules.api";

// Step components (subfolder)
import ScheduleInfoStep from "./create-steps/ScheduleInfoStep";
import ContentSelectionStep from "./create-steps/ContentSelectionStep";
import LowerThirdStep from "./create-steps/LowerThirdStep";
import ScreenSelectionStep from "./create-steps/ScreenSelectionStep";
import TimingStep from "./create-steps/TimingStep";

// Import the exact same ContentItem type used in SchedulesPage
export interface ContentItem {
  id: string;
  type: "video" | "image" | "html" | "other";
  src?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

// Use the exact same Schedule shape as in SchedulesPage
export interface Schedule {
  id: string;
  name: string;
  description: string;
  content: ContentItem[];
  devices: string[];
  repeat: "once" | "daily" | "weekly" | "monthly";
  days?: string[];
  monthlyDays?: string[];
  playTime?: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  active: boolean;
  lowerThirdId?: string | null;
  lowerThird?: LowerThirdPayload;
}

// Form state interface – matches Schedule but without id/active
// interface ScheduleForm extends Omit<Schedule, "id" | "active"> {
//   lowerThirdId?: string | null;
// }

export type FontSize = "Small" | "Medium" | "Large";
export type AnimationType = "Left_to_Light" | "Right_to_Left" | "Fade" | "None";
export type PositionType = "Top" | "Middle" | "Bottom";

export interface LowerThirdPayload {
  text: string;
  textColor: string;
  font: string;
  fontSize: FontSize;
  duration: number;
  backgroundColor: string;
  backgroundOpacity: string;
  animation: AnimationType;
  loop: boolean;
  speed: number;
  position: PositionType;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Schedule>) => void; // <-- matches SchedulesPage
  editingSchedule?: Schedule | undefined;    // <-- exact type from parent
}

const steps = [
  { id: 1, title: "Schedule Info", icon: FileText },
  { id: 2, title: "Select Content", icon: Video },
  { id: 3, title: "Lower Third", icon: Video }, // Or Type icon if available
  { id: 4, title: "Select Screens", icon: Monitor },
  { id: 5, title: "Set Timing", icon: Clock },
];

// Local mock content (kept for demo)
interface BaseContent {
  id: string;
  type: "Video" | "Image" | "Playlist";
  name: string;
}

export interface VideoItem extends BaseContent {
  type: "Video";
  thumbnail: string;
  size: string;
  duration: string;
}

export interface ImageItem extends BaseContent {
  type: "Image";
  thumbnail: string;
  size: string;
}

export interface PlaylistItem extends BaseContent {
  type: "Playlist";
  items: string[];
}

export type LocalContentItem = VideoItem | ImageItem | PlaylistItem;

export default function ScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
}: ScheduleModalProps) {
  const [step, setStep] = useState(1);
  const [localContent, setLocalContent] = useState<LocalContentItem[]>([]);

  // Form state – matches Schedule but without id/active
  const [form, setForm] = useState<Omit<Schedule, "id" | "active">>({
    name: "",
    description: "",
    content: [],
    devices: [],
    repeat: "daily",
    days: [],
    monthlyDays: [],
    playTime: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    lowerThirdId: null,
    lowerThird: {
      text: "",
      textColor: "#FFFFFF",
      font: "Inter",
      fontSize: "Medium",
      duration: 10,
      backgroundColor: "#000000",
      backgroundOpacity: "80",
      animation: "Fade",
      loop: true,
      speed: 1,
      position: "Bottom",
    },
  });

  // Load mock content
  useEffect(() => {
    const staticContent: LocalContentItem[] = [
      { id: "v1", type: "Video", name: "Promo Video", thumbnail: "/static/videos/video1.mp4", size: "40 MB", duration: "1:20" },
      { id: "v2", type: "Video", name: "Ad Video", thumbnail: "/static/videos/video2.mp4", size: "55 MB", duration: "2:05" },
      { id: "i1", type: "Image", name: "Banner Image", thumbnail: "/static/images/img1.jpg", size: "2 MB" },
      { id: "i2", type: "Image", name: "Product Image", thumbnail: "/static/images/img2.jpg", size: "3 MB" },
      { id: "t1", type: "Video", name: "Text/Lower Third Overlay", thumbnail: "", size: "0 KB", duration: "N/A" },
      { id: "p1", type: "Playlist", name: "Morning Playlist", items: ["v1", "i1", "v2"] },
      { id: "p2", type: "Playlist", name: "Evening Playlist", items: ["i2", "v1"] },
    ];
    setLocalContent(staticContent);
  }, []);

  // Reset form when modal opens or editingSchedule changes
  useEffect(() => {
    if (editingSchedule) {
      setForm({
        name: editingSchedule.name || "",
        description: editingSchedule.description || "",
        content: editingSchedule.content || [],
        devices: editingSchedule.devices || [],
        repeat: editingSchedule.repeat || "daily",
        days: editingSchedule.days || [],
        monthlyDays: editingSchedule.monthlyDays || [],
        playTime: editingSchedule.playTime || "",
        startDate: editingSchedule.startDate || "",
        startTime: editingSchedule.startTime || "",
        endDate: editingSchedule.endDate || "",
        endTime: editingSchedule.endTime || "",
        lowerThirdId: editingSchedule.lowerThirdId || null,
        lowerThird: editingSchedule.lowerThird || {
          text: "",
          textColor: "#FFFFFF",
          font: "Inter",
          fontSize: "Medium",
          duration: 10,
          backgroundColor: "#000000",
          backgroundOpacity: "80",
          animation: "Fade",
          loop: true,
          speed: 1,
          position: "Bottom",
        },
      });
    } else {
      setForm({
        name: "", description: "", content: [], devices: [], repeat: "daily",
        days: [], monthlyDays: [], playTime: "", startDate: "", startTime: "",
        endDate: "", endTime: "",
        lowerThird: {
          text: "",
          textColor: "#FFFFFF",
          font: "Inter",
          fontSize: "Medium",
          duration: 10,
          backgroundColor: "#000000",
          backgroundOpacity: "80",
          animation: "Fade",
          loop: true,
          speed: 1,
          position: "Bottom",
        },
      });
    }
    setStep(1);
  }, [editingSchedule, isOpen]);



  const [createLowerThird, { isLoading: isCreatingLowerThird }] = useCreateLowerThirdMutation();

  const next = async () => {
    // If we're at Step 2, decide whether to go to Lower Third (Step 3) or Screens (Step 4)
    if (step === 2) {
      const hasContent = form.content.length > 0;
      if (hasContent) {
        setStep(3);
      } else {
        setStep(4);
      }
      return;
    }

    // Step 3 API Logic: Create Lower Third before proceeding
    if (step === 3 && form.lowerThird?.text) {
      try {
        const res = await createLowerThird(form.lowerThird).unwrap();
        if (res.success) {
          toast.success("Lower Third configured successfully");
          // Store the ID (assuming it's in res.data.id based on typical pattern)
          const lowerThirdId = (res as any).data?.id;
          setForm({ ...form, lowerThirdId });
          setStep(4);
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to save Lower Third");
      }
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const prev = () => {
    if (step === 4) {
      const hasTextOrPrompt = form.content.length > 0;
      if (hasTextOrPrompt) {
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step > 1) {
      setStep(step - 1);
    }
  };
  const save = () => {
    onSave(form); // form matches Partial<Schedule>
    onClose();
  };

  if (!isOpen) return null;

  // Helper to find the thumbnail of the first selected item
  const selectedMedia = localContent.find(lc => form.content[0]?.id === lc.id);

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-navbarBg rounded-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between p-6 gap-4 sm:gap-0">
          <h2 className="text-xl sm:text-3xl font-bold text-Headings dark:text-white text-nowrap">
            {editingSchedule ? "Edit Schedule" : "Create New Schedule"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors self-end sm:self-auto"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center md:justify-between px-6 py-5 border-b border-border gap-4">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step > s.id
                    ? "bg-green-50 dark:bg-green-900/30 border border-green-300 dark:border-green-800"
                    : step === s.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border border-bgBlue"
                      : "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                    }`}
                >
                  {step > s.id ? (
                    <CircleCheckBigIcon className="w-6 h-6 text-bgGreen" />
                  ) : (
                    <s.icon
                      className={`w-6 h-6 ${step >= s.id ? "text-bgBlue" : "text-gray-400 dark:text-gray-500"
                        }`}
                    />
                  )}
                </div>
                <div>
                  <div className={`sm:font-semibold font-normal text-xs sm:text-base ${step >= s.id ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                    Step {s.id}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    {s.title}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`hidden md:block flex-1 h-0.5 mx-4 ${step > s.id + 1 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <ScheduleInfoStep form={form} setForm={setForm} />
          )}

          {step === 2 && (
            <ContentSelectionStep
              form={form}
              setForm={setForm}
              localContent={localContent}
            />
          )}

          {step === 3 && (
            <LowerThirdStep
              form={form}
              setForm={setForm}
              selectedMedia={selectedMedia}
            />
          )}

          {step === 4 && (
            <ScreenSelectionStep form={form} setForm={setForm} />
          )}

          {step === 5 && (
            <TimingStep form={form} setForm={setForm} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center md:justify-between px-6 py-4 border-t border-borderGray dark:border-gray-700 gap-3">
          <button
            onClick={prev}
            disabled={step === 1}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 border border-borderGray dark:border-gray-600 rounded-lg font-medium transition-colors ${step === 1
              ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "text-gray-700 dark:text-gray-300 hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden md:block">Previous</span>
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">Step {step} of 5</div>

          {step < 5 ? (
            <button
              onClick={next}
              disabled={isCreatingLowerThird}
              className="flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-bgBlue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isCreatingLowerThird ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden md:block">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={save}
              className="px-6 py-2.5 bg-bgBlue text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              {editingSchedule ? "Update Schedule" : "Create Schedule"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
