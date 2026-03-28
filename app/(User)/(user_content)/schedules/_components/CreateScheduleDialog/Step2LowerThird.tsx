/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Music } from "lucide-react";
import NextImage from "next/image";
import BaseSelect from "@/common/BaseSelect";
import BaseVideoPlayer from "@/common/BaseVideoPlayer";
import { ContentItem } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Marquee from "react-fast-marquee";
import { Switch } from "@/components/ui/switch";

/* =====================
   Shared field sizing
===================== */
const FIELD_SIZE = "h-11 px-4 py-2 text-sm rounded-md";

interface Step2LowerThirdProps {
    data: {
        selectedContent: ContentItem;
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
        };
    };
    onChange: (data: any) => void;
}

const Step2LowerThird: React.FC<Step2LowerThirdProps> = ({
    data,
    onChange,
}) => {
    const updateConfig = (key: string, value: any) => {
        onChange({
            ...data,
            lowerThirdConfig: {
                ...data.lowerThirdConfig,
                [key]: value,
            },
        });
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

    // const relatedContent = mockContent
    //     .filter((item) => item.id !== data.selectedContent.id)
    //     .slice(0, 6);

    // console.log(data);

    return (
        <div className="space-y-6">
            {/* Content Type */}
            <BaseSelect
                label="Content Type"
                options={[{ label: "Lower third", value: "lower-third" }]}
                value="lower-third"
                disabled
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
                            {data.selectedContent.type === "video" && data.selectedContent.video ? (
                                <BaseVideoPlayer
                                    src={data.selectedContent.video}
                                    poster={data.selectedContent.thumbnail}
                                    autoPlay={false}
                                    rounded="rounded-none"
                                />
                            ) : data.selectedContent.type === "audio" && data.selectedContent.audio ? (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Music className="w-16 h-16 text-white" />
                                </div>
                            ) : (
                                data.selectedContent.thumbnail && (
                                    <NextImage
                                        src={data.selectedContent.thumbnail}
                                        alt={data.selectedContent.title}
                                        width={1920}
                                        height={1080}
                                        className="w-full h-full object-cover"
                                    />
                                )
                            )}
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

                    {/* MESSAGE */}
                    <div className="space-y-2">
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
