/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import Dropdown from "@/components/shared/Dropdown";
import { Schedule, LocalContentItem } from "../CreateScheduleModal";

interface LowerThirdStepProps {
  form: Omit<Schedule, "id" | "active">;
  setForm: React.Dispatch<
    React.SetStateAction<Omit<Schedule, "id" | "active">>
  >;
  selectedMedia: LocalContentItem | undefined;
}

export default function LowerThirdStep({
  form,
  setForm,
  selectedMedia,
}: LowerThirdStepProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Configuration Inputs */}
      <div className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-4 text-bgBlue italic">
            <span className="font-bold">Text Configuration</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                Overlay Text
              </label>
              <input
                type="text"
                value={form.lowerThird?.text}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    lowerThird: { ...prev.lowerThird!, text: e.target.value },
                  }))
                }
                placeholder="Enter text to display..."
                className="w-full px-4 py-2 border border-border bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-headings dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Text Color
                </label>
                <input
                  type="color"
                  value={form.lowerThird?.textColor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      lowerThird: {
                        ...prev.lowerThird!,
                        textColor: e.target.value,
                      },
                    }))
                  }
                  className="w-full h-10 p-1 bg-white dark:bg-gray-900 border border-border rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  BG Color
                </label>
                <input
                  type="color"
                  value={form.lowerThird?.backgroundColor}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      lowerThird: {
                        ...prev.lowerThird!,
                        backgroundColor: e.target.value,
                      },
                    }))
                  }
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
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Animation
                </label>
                <Dropdown
                  value={form.lowerThird?.animation || "Fade"}
                  options={["Fade", "Left_to_Light", "Right_to_Left", "None"]}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      lowerThird: {
                        ...prev.lowerThird!,
                        animation: val as any,
                      },
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                  Position
                </label>
                <Dropdown
                  value={form.lowerThird?.position || "Bottom"}
                  options={["Top", "Middle", "Bottom"]}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      lowerThird: { ...prev.lowerThird!, position: val as any },
                    }))
                  }
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
                  <span className="font-bold text-lg mb-1 italic">
                    Playlist Selected
                  </span>
                  <span className="text-xs">
                    {(selectedMedia as any).items?.length} items in sequence
                  </span>
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
                [form.lowerThird.position.toLowerCase()]: "10%",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                className={`
                  ${
                    form.lowerThird.fontSize === "Small"
                      ? "text-lg"
                      : form.lowerThird.fontSize === "Large"
                        ? "text-4xl"
                        : "text-2xl"
                  }
                  font-bold tracking-tight
                `}
              >
                {form.lowerThird.text}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
          <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
            <strong>Note:</strong> Showing preview for:{" "}
            <span className="underline">{selectedMedia?.name || "None"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
