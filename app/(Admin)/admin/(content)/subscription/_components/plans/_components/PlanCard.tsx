"use client";

import React from "react";
import {
  Monitor,
  HardDrive,
  FileVideo,
  Image as ImageIcon,
  Headphones,
  Check,
  Layout,
  SquarePen,
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
    <div className="flex h-full flex-col rounded-[24px] border border-border bg-navbarBg p-6 transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[24px] font-bold text-headings">{name}</h3>
        {discount && (
          <span className="bg-[#D4183D] text-white text-[12px] px-3 py-1 rounded-full">
            {discount}
          </span>
        )}
      </div>

      {/* Price Badge */}
      <div className="mb-6">
        <span className="rounded-lg bg-green-50 px-3 py-1 text-[14px] text-green-700 dark:bg-green-900/20 dark:text-green-300">
          {price}
        </span>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted">
            <Monitor className="w-4 h-4" />
            <span className="text-[14px]">Devices</span>
          </div>
          <p className="text-[18px] text-headings">{devices}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted">
            <HardDrive className="w-4 h-4" />
            <span className="text-[14px]">Storage</span>
          </div>
          <p className="text-[18px] text-headings">{storage}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <div className="flex items-center gap-2 text-muted">
            <Layout className="w-4 h-4" />
            <span className="text-[14px]">Templates</span>
          </div>
          <p className="text-[18px] text-headings">{templates}</p>
        </div>
      </div>

      <hr className="mb-6 border-border" />

      {/* Upload Limits */}
      <div className="space-y-3 mb-6">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted">
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

      <hr className="mb-6 border-border" />

      {/* Features */}
      <div className="space-y-3 mb-8 flex-1">
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-muted">
          Features
        </h4>
        <div className="space-y-3 rounded-xl border border-border bg-bgGray p-4 dark:bg-gray-800">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-[#12B76A]" strokeWidth={3} />
              </div>
              <span className="text-[14px] font-medium leading-tight text-body">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border py-2.5 text-[14px] font-bold text-headings transition-all hover:bg-bgGray dark:hover:bg-gray-800"
      >
        <SquarePen className="w-4 h-4" />
        Edit Plan
      </button>
    </div>
  );
};

export default PlanCard;
