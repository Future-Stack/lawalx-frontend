/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { AudioLines, FilePlay, GalleryThumbnails, Music } from "lucide-react";
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
}

const Step2LowerThird: React.FC<Step2LowerThirdProps> = ({
    data,
    onChange,
    onLowerThirdCreated,
    onContentTypeChange,
}) => {
    const [createLowerThird, { isLoading }] = useCreateLowerThirdMutation();

    const updateConfig = (key: string, value: any) => {
        onChange({
            ...data,
            lowerThirdConfig: {
                ...data.lowerThirdConfig,
                [key]: value,
            },
        });
    };

    const handleCreateLowerThird = async () => {
        const { lowerThirdConfig } = data;

        // Map UI values to backend types
        const mapFontSize = (size: string): "Small" | "Medium" | "Large" => {
            if (size === "14") return "Small";
            if (size === "16" || size === "20") return "Medium";
            return "Large";
        };

        const mapAnimation = (dir: string, enabled: boolean): "Left_to_Light" | "Right_to_Left" | "Fade" | "None" => {
            if (!enabled) return "None";
            if (dir === "left-to-right") return "Left_to_Light";
            return "Right_to_Left";
        };

        const mapPosition = (pos: string): "Top" | "Middle" | "Bottom" => {
            if (pos === "top") return "Top";
            return "Bottom";
        };

        const mapSpeed = (speed: string): number => {
            if (speed === "slow") return 20;
            if (speed === "medium") return 40;
            return 60;
        };

        const payload = {
            text: lowerThirdConfig.message,
            textColor: lowerThirdConfig.textColor,
            font: lowerThirdConfig.fontFamily,
            fontSize: mapFontSize(lowerThirdConfig.fontSize),
            duration: lowerThirdConfig.duration || 10,
            backgroundColor: lowerThirdConfig.backgroundColor,
            backgroundOpacity: String(lowerThirdConfig.backgroundOpacity),
            animation: mapAnimation(lowerThirdConfig.animationDirection, lowerThirdConfig.enableAnimation),
            loop: lowerThirdConfig.loop,
            speed: mapSpeed(lowerThirdConfig.speed),
            position: mapPosition(lowerThirdConfig.position),
        };

        try {
            const response = await createLowerThird(payload).unwrap();
            if (response.success) {
                toast.success("Lower Third created successfully!");
                if (onLowerThirdCreated && (response as any).data?.id) {
                    onLowerThirdCreated((response as any).data.id);
                }
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create Lower Third");
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
        { label: "Roboto", value: "Roboto" },
        { label: "Open Sans", value: "Open Sans" },
        { label: "Lato", value: "Lato" },
        { label: "Montserrat", value: "Montserrat" },
    ];

    const contentTypeOptions = [
        { label: "Select Content Type", value: "all", icon: <FilePlay className="w-5 h-5 text-muted" /> },
        { label: "Image or Video", value: "image-video", icon: <FilePlay className="w-5 h-5 text-muted" /> },
        { label: "Audio", value: "audio", icon: <AudioLines className="w-5 h-5 text-muted" /> },
        { label: "Lower Third", value: "lower-third", icon: <GalleryThumbnails className="w-5 h-5 text-muted" /> }
    ];

    // const relatedContent = mockContent
    //     .filter((item) => item.id !== data.selectedContent.id)
    //     .slice(0, 6);

    // console.log(data);

    return (
        <div className="space-y-6">
            {/* Content Type */}
            <BaseSelect
                label="Content Type"
                options={contentTypeOptions}
                value="lower-third"
                onChange={(v) => onContentTypeChange?.(v)}
                required
            />

            <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* LEFT */}
                <div className="space-y-4 lg:w-[70%]">
                    <div className="rounded-lg overflow-hidden border border-border bg-navbarBg shadow-sm">
                        {/* TOP TICKER */}
                        {data.lowerThirdConfig.position === "top" &&
                            data.lowerThirdConfig.message && (
                                <div
                                    className="py-2 overflow-hidden"
                                    style={{
                                        backgroundColor: `${data.lowerThirdConfig.backgroundColor}${Math.round(
                                            data.lowerThirdConfig.backgroundOpacity * 2.55
                                        )
                                            .toString(16)
                                            .padStart(2, "0")}`,
                                    }}
                                >
                                    <Marquee
                                        speed={
                                            data.lowerThirdConfig.speed === "slow"
                                                ? 20
                                                : data.lowerThirdConfig.speed === "medium"
                                                    ? 40
                                                    : 60
                                        }
                                        direction={
                                            data.lowerThirdConfig.animationDirection ===
                                                "left-to-right"
                                                ? "left"
                                                : "right"
                                        }
                                        gradient={false}
                                        loop={data.lowerThirdConfig.loop ? 0 : 1}
                                    >
                                        <p
                                            className="font-semibold px-4"
                                            style={{
                                                color: data.lowerThirdConfig.textColor,
                                                fontSize: `${data.lowerThirdConfig.fontSize}px`,
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
                            <BaseVideoPlayer
                                src="/detailsVideo.mp4"
                                poster=""
                                autoPlay={true}
                                rounded="rounded-none"
                            />
                        </div>

                        {/* BOTTOM TICKER */}
                        {data.lowerThirdConfig.position === "bottom" &&
                            data.lowerThirdConfig.message && (
                                <div
                                    className="py-2 overflow-hidden"
                                    style={{
                                        backgroundColor: `${data.lowerThirdConfig.backgroundColor}${Math.round(
                                            data.lowerThirdConfig.backgroundOpacity * 2.55
                                        )
                                            .toString(16)
                                            .padStart(2, "0")}`,
                                    }}
                                >
                                    <Marquee
                                        speed={
                                            data.lowerThirdConfig.speed === "slow"
                                                ? 20
                                                : data.lowerThirdConfig.speed === "medium"
                                                    ? 40
                                                    : 60
                                        }
                                        direction={
                                            data.lowerThirdConfig.animationDirection ===
                                                "left-to-right"
                                                ? "left"
                                                : "right"
                                        }
                                        gradient={false}
                                        loop={data.lowerThirdConfig.loop ? 0 : 1}
                                    >
                                        <p
                                            className="font-semibold px-4"
                                            style={{
                                                color: data.lowerThirdConfig.textColor,
                                                fontSize: `${data.lowerThirdConfig.fontSize}px`,
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
                                onChange={(e) =>
                                    updateConfig("message", e.target.value)
                                }
                                className={`bg-input border-borderGray text-headings ${FIELD_SIZE}`}
                            />
                        </div>
                        <div className="space-y-2 w-32">
                            <Label className="text-sm font-medium text-headings">
                                Duration (s)
                            </Label>
                            <Input
                                type="number"
                                placeholder="10"
                                value={data.lowerThirdConfig.duration}
                                onChange={(e) =>
                                    updateConfig("duration", Number(e.target.value))
                                }
                                className={`bg-input border-borderGray text-headings ${FIELD_SIZE}`}
                            />
                        </div>
                    </div>

                    {/* TEXT STYLE */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="space-y-2 w-1/3">
                            <Label className="text-sm text-headings">
                                Text Color
                            </Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={data.lowerThirdConfig.textColor}
                                    onChange={(e) =>
                                        updateConfig("textColor", e.target.value)
                                    }
                                    className="h-11 w-11 rounded border border-borderGray cursor-pointer"
                                />
                                <Input
                                    value={data.lowerThirdConfig.textColor}
                                    onChange={(e) =>
                                        updateConfig("textColor", e.target.value)
                                    }
                                    className={`flex-1 bg-input border-borderGray text-headings ${FIELD_SIZE}`}
                                />
                            </div>
                        </div>

                        <div className="w-1/3">
                            <BaseSelect
                                label="Font"
                                options={fontOptions}
                                value={data.lowerThirdConfig.fontFamily}
                                onChange={(v) => updateConfig("fontFamily", v)}
                            />
                        </div>

                        <div className="w-1/3">
                            <BaseSelect
                                label="Font Size"
                                options={fontSizeOptions}
                                value={data.lowerThirdConfig.fontSize}
                                onChange={(v) => updateConfig("fontSize", v)}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="space-y-4 lg:w-[30%]">
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
                                        updateConfig(
                                            "backgroundOpacity",
                                            Number(e.target.value)
                                        )
                                    }
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
                                onCheckedChange={(c) =>
                                    updateConfig("enableAnimation", c)
                                }
                            />
                        </div>

                        {data.lowerThirdConfig.enableAnimation && (
                            <div className="space-y-3 p-4">
                                <BaseSelect
                                    options={animationOptions}
                                    value={data.lowerThirdConfig.animationDirection}
                                    onChange={(v) =>
                                        updateConfig("animationDirection", v)
                                    }
                                />
                                <BaseSelect
                                    label="Speed"
                                    options={speedOptions}
                                    value={data.lowerThirdConfig.speed}
                                    onChange={(v) => updateConfig("speed", v)}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4">
                            <Label className="text-sm font-medium text-headings">
                                Loop
                            </Label>
                            <Switch
                                checked={data.lowerThirdConfig.loop}
                                onCheckedChange={(c) => updateConfig("loop", c)}
                            />
                        </div>
                    </div>

                    <BaseSelect
                        label="Position"
                        options={positionOptions}
                        value={data.lowerThirdConfig.position}
                        onChange={(v) => updateConfig("position", v)}
                    />

                    <button
                        onClick={handleCreateLowerThird}
                        disabled={isLoading || !data.lowerThirdConfig.message}
                        className="w-full h-11 bg-bgBlue text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4 shadow-customShadow cursor-pointer"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <GalleryThumbnails className="w-5 h-5" />
                        )}
                        {isLoading ? "Creating..." : "Add Lower Third"}
                    </button>
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
