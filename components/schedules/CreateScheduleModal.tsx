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
  Calendar,
} from "lucide-react";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";
import Dropdown from "@/components/shared/Dropdown";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateLowerThirdMutation } from "@/redux/api/users/schedules/schedules.api";
import Image from "next/image";

// Import the exact same ContentItem type used in SchedulesPage
interface ContentItem {
  id: string;
  type: "video" | "image" | "html" | "other";
  src?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

// Use the exact same Schedule shape as in SchedulesPage
interface Schedule {
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
interface ScheduleForm extends Omit<Schedule, "id" | "active"> {
  lowerThirdId?: string | null;
}

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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

  const filteredContent = localContent.filter(item => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
    const filterMatch = filter === "All" || item.type === filter;
    return searchMatch && filterMatch;
  });

  const screens = [
    { name: "Main Lobby Display", status: "online" },
    { name: "Store Entrance TV", status: "online" },
    { name: "Conference Room", status: "offline" },
  ];

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
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Morning Welcome"
                  className="w-full px-4 py-3 border border-border bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter schedule description"
                  rows={6}
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue resize-none text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Step 2 – Content Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <input
                  type="text"
                  placeholder="Search Content"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white"
                />
                <Dropdown
                  value={filter}
                  options={["All", "Video", "Image", "Playlist"]}
                  onChange={setFilter}
                  className="w-full sm:w-48"
                />
              </div>

              <div className="border border-borderGray dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                {filteredContent.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-4 p-4 border-b border-borderGray dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={form.content.some(c => c.id === item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Convert local item to real ContentItem (you can adjust mapping as needed)
                          const newItem: ContentItem = {
                            id: item.id,
                            type: item.type === "Video" ? "video" : item.type === "Image" ? "image" : "other",
                          };
                          setForm({ ...form, content: [...form.content, newItem] });
                        } else {
                          setForm({ ...form, content: form.content.filter(c => c.id !== item.id) });
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-300 text-bgBlue focus:ring-bgBlue"
                    />
                    <div className="relative w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg border overflow-hidden flex items-center justify-center">
                      {item.type === "Video" && <video src={item.thumbnail} className="w-full h-full object-cover" />}
                      {item.type === "Image" && <Image src={item.thumbnail} fill className="object-cover" alt={item.name} />}
                      {item.type === "Playlist" && <div className="text-xs font-semibold text-gray-700 dark:text-gray-400">{item.items.length} items</div>}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.type === "Video" && `${item.size} • ${item.duration}`}
                        {item.type === "Image" && item.size}
                        {item.type === "Playlist" && `${item.items.length} items`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 – Lower Third */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Configuration Inputs */}
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-4 text-bgBlue italic">
                    <span className="font-bold">Text Configuration</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Overlay Text</label>
                      <input
                        type="text"
                        value={form.lowerThird?.text}
                        onChange={(e) => setForm({ 
                          ...form, 
                          lowerThird: { ...form.lowerThird!, text: e.target.value } 
                        })}
                        placeholder="Enter text to display..."
                        className="w-full px-4 py-2 border border-border bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-headings dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Text Color</label>
                        <input
                          type="color"
                          value={form.lowerThird?.textColor}
                          onChange={(e) => setForm({ 
                            ...form, 
                            lowerThird: { ...form.lowerThird!, textColor: e.target.value } 
                          })}
                          className="w-full h-10 p-1 bg-white dark:bg-gray-900 border border-border rounded-lg cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">BG Color</label>
                        <input
                          type="color"
                          value={form.lowerThird?.backgroundColor}
                          onChange={(e) => setForm({ 
                            ...form, 
                            lowerThird: { ...form.lowerThird!, backgroundColor: e.target.value } 
                          })}
                          className="w-full h-10 p-1 bg-white dark:bg-gray-900 border border-border rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-4 text-bgBlue font-bold italic">
                    <span>Animation & Layout</span>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Animation</label>
                        <Dropdown
                          value={form.lowerThird?.animation || "Fade"}
                          options={["Fade", "Left_to_Light", "Right_to_Left", "None"]}
                          onChange={(val) => setForm({ 
                            ...form, 
                            lowerThird: { ...form.lowerThird!, animation: val as any } 
                          })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Position</label>
                        <Dropdown
                          value={form.lowerThird?.position || "Bottom"}
                          options={["Top", "Middle", "Bottom"]}
                          onChange={(val) => setForm({ 
                            ...form, 
                            lowerThird: { ...form.lowerThird!, position: val as any } 
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Preview Side */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1 text-headings dark:text-white font-bold">
                  <h3>Actual Media Preview</h3>
                </div>
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-border group shadow-2xl">
                  {selectedMedia ? (
                    <div className="w-full h-full">
                       {selectedMedia.type === "Video" ? (
                         <video 
                           src={selectedMedia.thumbnail} 
                           autoPlay 
                           muted 
                           loop 
                           className="w-full h-full object-cover" 
                         />
                       ) : selectedMedia.type === "Image" ? (
                         <Image
                           src={selectedMedia.thumbnail} 
                           fill
                           className="object-cover" 
                           alt={selectedMedia.name || "Selection Preview"}
                         />
                       ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400">
                          <span className="font-bold text-lg mb-1 italic">Playlist Selected</span>
                          <span className="text-xs">{(selectedMedia as any).items?.length} items in sequence</span>
                        </div>
                       )}
                       
                       <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                       <span className="absolute top-4 left-4 text-[10px] text-white/70 uppercase tracking-widest font-bold bg-black/40 px-2 py-1 rounded">
                         Live Selection
                       </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 italic text-sm">
                      No media selected for preview
                    </div>
                  )}

                  {/* The Lower Third Overlay */}
                  {form.lowerThird?.text && (
                    <div 
                      className={`absolute left-0 right-0 p-4 transition-all duration-500 flex items-center`}
                      style={{
                        backgroundColor: `${form.lowerThird.backgroundColor}${form.lowerThird.backgroundOpacity}`,
                        color: form.lowerThird.textColor,
                        [form.lowerThird.position.toLowerCase()]: '10%',
                        justifyContent: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <div className={`
                        ${form.lowerThird.fontSize === 'Small' ? 'text-lg' : form.lowerThird.fontSize === 'Large' ? 'text-4xl' : 'text-2xl'}
                        font-bold tracking-tight
                      `}>
                        {form.lowerThird.text}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    <strong>Note:</strong> Showing preview for: <span className="underline">{selectedMedia?.name || 'None'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 – Screens */}
          {step === 4 && (
            <div className="space-y-5">
              <input
                type="text"
                placeholder="Search Screens"
                className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
              />
              <div className="border border-borderGray dark:border-gray-700 rounded-lg divide-y divide-borderGray dark:divide-gray-700 max-h-64 overflow-y-auto">
                {screens.map((screen) => (
                  <label
                    key={screen.name}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={form.devices.includes(screen.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setForm({ ...form, devices: [...form.devices, screen.name] });
                          } else {
                            setForm({ ...form, devices: form.devices.filter(d => d !== screen.name) });
                          }
                        }}
                        className="w-5 h-5 border-gray-300 data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">{screen.name}</span>
                    </div>

                    <DeviceStatusBadge status={screen.status} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 – Timing (unchanged, just formatting) */}
          {step === 4 && (
            <div className="space-y-8">
              {/* Repeat */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Repeat</label>
                <Dropdown
                  value={form.repeat}
                  options={["once", "daily", "weekly", "monthly"]}
                  onChange={(val) => setForm({ ...form, repeat: val as any })}
                  className="w-full"
                />
              </div>

              {/* Weekly Days */}
              {form.repeat === "weekly" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Days</label>
                  <div className="grid grid-cols-7 gap-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const days = form.days ?? [];
                          const updated = days.includes(day)
                            ? days.filter(d => d !== day)
                            : [...days, day];
                          setForm({ ...form, days: updated });
                        }}
                        className={`py-3 rounded-lg font-medium text-sm transition-all ${(form.days ?? []).includes(day)
                          ? "bg-bgBlue text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Days */}
              {form.repeat === "monthly" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Days</label>
                  <div className="grid grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => {
                      const day = num.toString();
                      const current = form.monthlyDays ?? [];
                      const selected = current.includes(day);
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            const updated = selected
                              ? current.filter(d => d !== day)
                              : [...current, day];
                            setForm({ ...form, monthlyDays: updated });
                          }}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${selected
                            ? "bg-bgBlue text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Play Time */}
              {(form.repeat === "daily" || form.repeat === "weekly" || form.repeat === "monthly") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Play Time</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.playTime}
                      onChange={(e) => setForm({ ...form, playTime: e.target.value })}
                      placeholder="09:00 AM"
                      className="w-full pl-4 pr-12 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Run Once */}
              {form.repeat === "once" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Select Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.startDate}
                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                        placeholder="MM/DD/YYYY"
                        className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Play Time</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.playTime}
                        onChange={(e) => setForm({ ...form, playTime: e.target.value })}
                        placeholder="09:00 AM"
                        className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Recurring Range */}
              {form.repeat !== "once" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Range</label>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">Start Date</label>
                      <div className="relative mt-2">
                        <input
                          type="text"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          placeholder="MM/DD/YYYY"
                          className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400">End Date</label>
                      <div className="relative mt-2">
                        <input
                          type="text"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          placeholder="MM/DD/YYYY"
                          className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
