/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { GalleryThumbnails } from "lucide-react";
import NextImage from "next/image";
import BaseSelect from "@/common/BaseSelect";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import { ContentItem } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Marquee from "react-fast-marquee";
import { Switch } from "@/components/ui/switch";
import { useCreateLowerThirdMutation } from "@/redux/api/users/schedules/schedules.api";
import { LowerThirdPayload } from "@/redux/api/users/schedules/schedules.type";
import { toast } from "sonner";

/* =====================
   Shared field sizing
===================== */
const FIELD_SIZE = "h-11 px-4 py-2 text-sm rounded-md";

interface Step2LowerThirdProps {
  data: {
    selectedContent: ContentItem | null;
    lowerThirdConfig: {
      backgroundColor: string;
      backgroundOpacity: number;
      enableAnimation: boolean;
      animationDirection: string;
      speed: string;
      enableLogo: boolean;
      position: string;
      textColor: string;
      fontSize: string;
      fontFamily: string;
      loop: boolean;
      message: string;
      video: string;
      duration: number;
    };
  };
  onChange: (data: any) => void;
  onLowerThirdCreated?: (id: string) => void;
  onContentTypeChange?: (type: string) => void;
  isAlreadyCreated?: boolean;
  onSubmitLowerThird?: (payload: LowerThirdPayload) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  loadingLabel?: string;
}

const Step2LowerThird: React.FC<Step2LowerThirdProps> = ({
  data,
  onChange,
  onLowerThirdCreated,
  isAlreadyCreated,
  onSubmitLowerThird,
  isSubmitting = false,
  submitLabel = "Add Text Section",
  loadingLabel = "Creating...",
}) => {
  const [createLowerThird, { isLoading }] = useCreateLowerThirdMutation();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isAlreadyCreated) {
      setIsAdded(true);
    }
  }, [isAlreadyCreated]);

  const updateConfig = (key: string, value: any) => {
    setIsAdded(false);
    onChange({
      ...data,
      lowerThirdConfig: {
        ...data.lowerThirdConfig,
        [key]: value,
      },
    });
  };

  const getPixelSize = (size: string): number => {
    const strSize = String(size);
    if (strSize === "Small" || strSize === "14") return 14;
    if (strSize === "Medium" || strSize === "16") return 16;
    if (strSize === "20") return 20;
    if (strSize === "Large" || strSize === "24") return 24;
    const parsed = parseInt(strSize, 10);
    return isNaN(parsed) ? 16 : parsed;
  };

  const handleCreateLowerThird = async () => {
    const { lowerThirdConfig } = data;

    // Map UI values to backend types
    const mapFontSize = (size: string): "Small" | "Medium" | "Large" => {
      const strSize = String(size);
      if (strSize === "14" || strSize === "Small" || strSize === "small")
        return "Small";
      if (
        strSize === "16" ||
        strSize === "20" ||
        strSize === "Medium" ||
        strSize === "medium"
      )
        return "Medium";
      return "Large";
    };

    const mapAnimation = (
      dir: string,
      enabled: boolean,
    ): "Left_to_Light" | "Right_to_Left" | "Fade" | "None" => {
      if (!enabled) return "None";
      const normalized = String(dir).toLowerCase();
      if (
        normalized === "left-to-right" ||
        normalized === "left_to_light" ||
        normalized === "right"
      )
        return "Left_to_Light";
      if (
        normalized === "right-to-left" ||
        normalized === "right_to_left" ||
        normalized === "left"
      )
        return "Right_to_Left";
      return "Left_to_Light";
    };

    const mapPosition = (pos: string): "Top" | "Middle" | "Bottom" => {
      if (pos === "top") return "Top";
      return "Bottom";
    };

    const mapSpeed = (speed: any): number => {
      if (typeof speed === "number") return speed;
      const parsed = parseInt(speed, 10);
      if (!isNaN(parsed)) return parsed;
      if (speed === "slow") return 20;
      if (speed === "medium") return 40;
      return 60;
    };

    const payload: any = {
      text: lowerThirdConfig.message,
      textColor: lowerThirdConfig.textColor,
      font: lowerThirdConfig.fontFamily,
      fontSize: mapFontSize(lowerThirdConfig.fontSize),
      backgroundColor: lowerThirdConfig.backgroundColor,
      backgroundOpacity: String(lowerThirdConfig.backgroundOpacity),
      animation: mapAnimation(
        lowerThirdConfig.animationDirection,
        lowerThirdConfig.enableAnimation,
      ),
      loop: lowerThirdConfig.loop,
      speed: mapSpeed(lowerThirdConfig.speed),
      position: mapPosition(lowerThirdConfig.position),
    };

    const parsedDuration = parseInt(String(lowerThirdConfig.duration), 10);
    const rawDuration = lowerThirdConfig.duration as any;
    if (
      rawDuration !== "" &&
      rawDuration !== undefined &&
      rawDuration !== null &&
      !isNaN(parsedDuration)
    ) {
      payload.duration = parsedDuration;
    }

    if (onSubmitLowerThird) {
      await onSubmitLowerThird(payload);
      setIsAdded(true);
      return;
    }

    try {
      const response = await createLowerThird(payload).unwrap();
      if (response.success) {
        toast.success("Text Section added successfully!");
        const createdId =
          (response as any).data?.id ||
          (response as any).id ||
          (response as any).data;
        if (onLowerThirdCreated && createdId) {
          onLowerThirdCreated(createdId);
          setIsAdded(true);
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to add Text Section");
    }
  };

  const animationOptions = [
    { label: "Left to right", value: "left-to-right" },
    { label: "Right to left", value: "right-to-left" },
  ];

  const speedOptions = [
    { label: "Slow", value: "slow" },
    { label: "Medium", value: "medium" },
    { label: "Fast", value: "fast" },
  ];

  const positionOptions = [
    { label: "Bottom", value: "bottom" },
    { label: "Top", value: "top" },
  ];

  const fontSizeOptions = [
    { label: "Small", value: "14" },
    { label: "Medium", value: "16" },
    { label: "Large", value: "20" },
    { label: "Extra Large", value: "24" },
  ];

  const fontOptions = [
    { label: "Inter", value: "Inter" },
    { label: "Roboto", value: "Roboto" }
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-col xl:flex-row gap-6 w-full">
        {/* LEFT */}
        <div className="space-y-4 xl:w-[65%]">
          <div className="rounded-lg overflow-hidden border border-border bg-navbarBg shadow-sm">
            {/* TOP TICKER */}
            {data.lowerThirdConfig.position === "top" &&
              data.lowerThirdConfig.message && (
                <div
                  className="py-2 overflow-hidden"
                  style={{
                    backgroundColor: `${data.lowerThirdConfig.backgroundColor}${Math.round(
                      data.lowerThirdConfig.backgroundOpacity * 2.55,
                    )
                      .toString(16)
                      .padStart(2, "0")}`,
                  }}
                >
                  <Marquee
                    speed={
                      typeof data.lowerThirdConfig.speed === "number"
                        ? data.lowerThirdConfig.speed
                        : data.lowerThirdConfig.speed === "slow"
                          ? 20
                          : data.lowerThirdConfig.speed === "medium"
                            ? 40
                            : 60
                    }
                    direction={
                      String(
                        data.lowerThirdConfig.animationDirection,
                      ).toLowerCase() === "left-to-right" ||
                      String(
                        data.lowerThirdConfig.animationDirection,
                      ).toLowerCase() === "left_to_light" ||
                      String(
                        data.lowerThirdConfig.animationDirection,
                      ).toLowerCase() === "right"
                        ? "right"
                        : "left"
                    }
                    gradient={false}
                    loop={data.lowerThirdConfig.loop ? 0 : 1}
                  >
                    <p
                      className="font-semibold px-4"
                      style={{
                        color: data.lowerThirdConfig.textColor,
                        fontSize: `${getPixelSize(data.lowerThirdConfig.fontSize)}px`,
                        fontFamily: data.lowerThirdConfig.fontFamily,
                      }}
                    >
                      {data.lowerThirdConfig.message}
                    </p>
                  </Marquee>
                </div>
              )}

            {/* MEDIA */}
            <div className="relative w-full aspect-video bg-gray-900 overflow-hidden">
              {data.selectedContent && data.selectedContent.type === "image" ? (
                <NextImage
                  src={data.selectedContent.thumbnail || ""}
                  alt={data.selectedContent.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <BaseVideoPlayer
                  src={
                    data.selectedContent?.video ||
                    data.selectedContent?.thumbnail ||
                    "/detailsVideo.mp4"
                  }
                  poster={data.selectedContent?.thumbnail || ""}
                  autoPlay={true}
                  rounded="rounded-none"
                />
              )}
            </div>

            {/* BOTTOM TICKER */}
            {data.lowerThirdConfig.position === "bottom" &&
              data.lowerThirdConfig.message && (
                <div
                  className="py-2 overflow-hidden"
                  style={{
                    backgroundColor: `${data.lowerThirdConfig.backgroundColor}${Math.round(
                      data.lowerThirdConfig.backgroundOpacity * 2.55,
                    )
                      .toString(16)
                      .padStart(2, "0")}`,
                  }}
                >
                  <Marquee
                    speed={
                      typeof data.lowerThirdConfig.speed === "number"
                        ? data.lowerThirdConfig.speed
                        : data.lowerThirdConfig.speed === "slow"
                          ? 20
                          : data.lowerThirdConfig.speed === "medium"
                            ? 40
                            : 60
                    }
                    direction={
                      String(
                        data.lowerThirdConfig.animationDirection,
                      ).toLowerCase() === "left-to-right" ||
                      String(
                        data.lowerThirdConfig.animationDirection,
                      ).toLowerCase() === "left_to_light" ||
                      String(
                        data.lowerThirdConfig.animationDirection,
                      ).toLowerCase() === "right"
                        ? "right"
                        : "left"
                    }
                    gradient={false}
                    loop={data.lowerThirdConfig.loop ? 0 : 1}
                  >
                    <p
                      className="font-semibold px-4"
                      style={{
                        color: data.lowerThirdConfig.textColor,
                        fontSize: `${getPixelSize(data.lowerThirdConfig.fontSize)}px`,
                        fontFamily: data.lowerThirdConfig.fontFamily,
                      }}
                    >
                      {data.lowerThirdConfig.message}
                    </p>
                  </Marquee>
                </div>
              )}
          </div>

          {/* MESSAGE & DURATION */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label className="text-sm font-medium text-headings">
                Message
              </Label>
              <Input
                placeholder="This is a demo text"
                value={data.lowerThirdConfig.message}
                onChange={(e) => updateConfig("message", e.target.value)}
                className={`bg-input border-borderGray text-headings ${FIELD_SIZE}`}
              />
            </div>
            <div className="space-y-2 w-32">
              <Label className="text-sm font-medium text-headings">
                Duration (s)
              </Label>
              <Input
                type="text"
                placeholder="10"
                value={data.lowerThirdConfig.duration ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    updateConfig("duration", "");
                  } else {
                    const parsed = parseInt(val, 10);
                    updateConfig("duration", isNaN(parsed) ? "" : parsed);
                  }
                }}
                className={`bg-input border-borderGray text-headings ${FIELD_SIZE}`}
              />
            </div>
          </div>

          {/* TEXT STYLE */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="space-y-2 flex-1 min-w-[140px]">
              <Label className="text-sm text-headings">Text Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.lowerThirdConfig.textColor}
                  onChange={(e) => updateConfig("textColor", e.target.value)}
                  className="h-11 w-11 rounded border border-borderGray cursor-pointer"
                />
                <Input
                  value={data.lowerThirdConfig.textColor}
                  onChange={(e) => updateConfig("textColor", e.target.value)}
                  className={`flex-1 bg-input border-borderGray text-headings ${FIELD_SIZE}`}
                />
              </div>
            </div>

            <div className="flex-1 min-w-[140px]">
              <BaseSelect
                label="Font"
                options={fontOptions}
                value={data.lowerThirdConfig.fontFamily}
                onChange={(v) => updateConfig("fontFamily", v)}
                className="[&>button]:cursor-pointer"
              />
            </div>

            <div className="flex-1 min-w-[140px]">
              <BaseSelect
                label="Font Size"
                options={fontSizeOptions}
                value={data.lowerThirdConfig.fontSize}
                onChange={(v) => updateConfig("fontSize", v)}
                className="[&>button]:cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4 xl:w-[35%]">
          {/* BACKGROUND */}
          <div className="rounded-lg border border-border bg-navbarBg shadow-sm">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Label className="text-sm font-medium text-headings">
                Background
              </Label>
              <Checkbox
                checked={data.lowerThirdConfig.backgroundOpacity > 0}
                onCheckedChange={(c) =>
                  updateConfig("backgroundOpacity", c ? 80 : 0)
                }
                className="data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue cursor-pointer"
              />
            </div>

            {data.lowerThirdConfig.backgroundOpacity > 0 && (
              <div className="space-y-3 p-4">
                <Label className="text-sm text-headings">
                  Background Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.lowerThirdConfig.backgroundColor}
                    onChange={(e) =>
                      updateConfig("backgroundColor", e.target.value)
                    }
                    className="h-11 w-11 rounded border border-borderGray cursor-pointer"
                  />
                  <Input
                    value={data.lowerThirdConfig.backgroundColor}
                    onChange={(e) =>
                      updateConfig("backgroundColor", e.target.value)
                    }
                    className={`flex-1 bg-input border-borderGray text-headings ${FIELD_SIZE}`}
                  />
                </div>

                <Label className="text-sm text-headings">
                  Opacity: {data.lowerThirdConfig.backgroundOpacity}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.lowerThirdConfig.backgroundOpacity}
                  onChange={(e) =>
                    updateConfig("backgroundOpacity", Number(e.target.value))
                  }
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* ANIMATION */}
          <div className="rounded-lg border border-border bg-navbarBg">
            <div className="flex items-center justify-between border-b border-border p-4">
              <Label className="text-sm font-medium text-headings">
                Animation
              </Label>
              <Checkbox
                checked={data.lowerThirdConfig.enableAnimation}
                onCheckedChange={(c) => updateConfig("enableAnimation", c)}
                className="data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue cursor-pointer"
              />
            </div>

            {data.lowerThirdConfig.enableAnimation && (
              <div className="space-y-3 p-4">
                <BaseSelect
                  options={animationOptions}
                  value={data.lowerThirdConfig.animationDirection}
                  onChange={(v) => updateConfig("animationDirection", v)}
                  className="[&>button]:cursor-pointer"
                />
                <BaseSelect
                  label="Speed"
                  options={speedOptions}
                  value={data.lowerThirdConfig.speed}
                  onChange={(v) => updateConfig("speed", v)}
                  className="[&>button]:cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4">
              <Label className="text-sm font-medium text-headings">Loop</Label>
              <Switch
                checked={data.lowerThirdConfig.loop}
                onCheckedChange={(c) => updateConfig("loop", c)}
                className="cursor-pointer"
              />
            </div>
          </div>

          <BaseSelect
            label="Position"
            options={positionOptions}
            value={data.lowerThirdConfig.position}
            onChange={(v) => updateConfig("position", v)}
            className="[&>button]:cursor-pointer"
          />

          <div className="mt-4">
            <button
              onClick={handleCreateLowerThird}
              disabled={
                isLoading || isSubmitting || !data.lowerThirdConfig.message
              }
              className={`w-full h-11 bg-bgBlue text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-customShadow cursor-pointer`}
            >
              {isLoading || isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <GalleryThumbnails className="w-5 h-5" />
              )}
              {isLoading || isSubmitting
                ? loadingLabel
                : isAdded
                  ? "Added ✓"
                  : submitLabel}
            </button>
          </div>
        </div>
      </div>

      {/* RELATED CONTENT */}
      {/* {relatedContent.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-headings">
            Related Content
          </Label>
          <div className="rounded-lg border border-borderGray bg-input/50 p-4">
            <Marquee speed={30} gradient={false}>
              {relatedContent.map((item) => (
                <div key={item.id} className="mx-2">
                  <div className="w-32 h-20 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                    {item.type === "audio" ? (
                      <Music className="w-8 h-8 text-bgBlue" />
                    ) : item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-bgBlue" />
                    )}
                  </div>
                  <p className="text-xs text-center mt-1 text-headings truncate w-32">
                    {item.name}
                  </p>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Step2LowerThird;
