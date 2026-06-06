/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Step1ProgramInfoProps {
  programData: {
    name: string;
    description: string;
    serene_size: string;
    status: any;
    content_ids: string[];
    device_ids: string[];
  };
  setProgramData: React.Dispatch<React.SetStateAction<any>>;
}

export default function Step1ProgramInfo({
  programData,
  setProgramData,
}: Step1ProgramInfoProps) {
  return (
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
        <Select
          value={programData.serene_size}
          onValueChange={(val: string) => setProgramData({ ...programData, serene_size: val })}
        >
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-borderGray dark:border-gray-600 py-2.5 md:py-3.5 h-auto rounded-lg">
            <SelectValue placeholder="Select screen size" />
          </SelectTrigger>
          <SelectContent className="z-[1000001]">
            <SelectItem value="1920x1080">Full HD (1920x1080)</SelectItem>
            <SelectItem value="1280x720">HD (1280x720)</SelectItem>
            <SelectItem value="3840x2160">4K (3840x2160)</SelectItem>
            <SelectItem value="1080x1920">Portrait (1080x1920)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
