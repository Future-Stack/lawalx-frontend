"use client";

import React from "react";
import {
  Monitor,
  HardDrive,
  FileVideo,
  Image as ImageIcon,
  Headphones,
  Check,
  PencilLine,
  Layout,
} from "lucide-react";

interface PlanCardProps {
  name: string;
  price: string;
  discount: string;
  devices: string;
  storage: string;
  templates: string;
  limits: {
    photo: string;
    audio: string;
    video: string;
  };
  features: string[];
  onEdit: () => void;
}

const PlanCard = ({
  name,
  price,
  discount,
  devices,
  storage,
  templates,
  limits,
  features,
  onEdit,
}: PlanCardProps) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border border-[#F2F4F7] dark:border-gray-800 rounded-[24px] p-6 hover:shadow-md transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[24px] font-bold text-headings">{name}</h3>
        <span className="bg-[#D4183D] text-white text-[12px] px-3 py-1 rounded-full">
          {discount}
        </span>
      </div>

      {/* Price Badge */}
      <div className="mb-6">
        <span className="bg-[#ECFDF3] text-[#039855] text-[14px] px-3 py-1 rounded-lg">
          {price}
        </span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#98A2B3]">
            <Monitor className="w-4 h-4" />
            <span className="text-[14px]">Devices</span>
          </div>
          <p className="text-[18px] text-[#0A0A0A]">{devices}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#98A2B3]">
            <HardDrive className="w-4 h-4" />
            <span className="text-[14px]">Storage</span>
          </div>
          <p className="text-[18px] text-[#0A0A0A]">{storage}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="flex items-center gap-2 text-[#98A2B3]">
            <Layout className="w-4 h-4" />
            <span className="text-[14px]">Templates</span>
          </div>
          <p className="text-[18px] text-[#0A0A0A]">{templates}</p>
        </div>
      </div>

      <hr className="border-[#F2F4F7] dark:border-gray-800 mb-6" />

      {/* Upload Limits */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[12px] font-bold text-[#98A2B3] uppercase tracking-wider">
          Upload Limits
        </h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-headings" />
            <span className="text-[14px] text-headings font-medium">
              {limits.photo} Photo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-headings" />
            <span className="text-[14px] text-headings font-medium">
              {limits.audio} Audio
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileVideo className="w-4 h-4 text-headings" />
            <span className="text-[14px] text-headings font-medium">
              {limits.video} Video
            </span>
          </div>
        </div>
      </div>

      <hr className="border-[#F2F4F7] dark:border-gray-800 mb-6" />

      {/* Features */}
      <div className="space-y-3 mb-8 flex-1">
        <h4 className="text-[12px] font-bold text-[#98A2B3] uppercase tracking-wider">
          Features
        </h4>
        <div className="bg-[#F9FAFB] dark:bg-gray-950 rounded-xl border p-4 space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-[#12B76A]" strokeWidth={3} />
              </div>
              <span className="text-[14px] text-[#667085] leading-tight font-medium">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-[#D0D5DD] dark:border-gray-700 font-bold text-[14px] text-headings hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
      >
        <PencilLine className="w-4 h-4" />
        Edit Plan
      </button>
    </div>
  );
};

export default PlanCard;
