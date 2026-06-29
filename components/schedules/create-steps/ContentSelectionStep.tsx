import React, { useState, useMemo } from "react";
import Image from "next/image";
import Dropdown from "@/components/shared/Dropdown";
import { Schedule, LocalContentItem, ContentItem } from "../CreateScheduleModal";

interface ContentSelectionStepProps {
  form: Omit<Schedule, "id" | "active">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Schedule, "id" | "active">>>;
  localContent: LocalContentItem[];
}

export default function ContentSelectionStep({
  form,
  setForm,
  localContent,
}: ContentSelectionStepProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredContent = useMemo(() => {
    return localContent.filter((item) => {
      const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());
      const filterMatch = filter === "All" || item.type === filter;
      return searchMatch && filterMatch;
    });
  }, [localContent, search, filter]);

  return (
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
              checked={form.content.some((c) => c.id === item.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  const newItem: ContentItem = {
                    id: item.id,
                    type:
                      item.type === "Video"
                        ? "video"
                        : item.type === "Image"
                        ? "image"
                        : "other",
                  };
                  setForm((prev) => ({ ...prev, content: [...prev.content, newItem] }));
                } else {
                  setForm((prev) => ({
                    ...prev,
                    content: prev.content.filter((c) => c.id !== item.id),
                  }));
                }
              }}
              className="w-5 h-5 rounded border-gray-300 text-bgBlue focus:ring-bgBlue"
            />
            <div className="relative w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg border overflow-hidden flex items-center justify-center">
              {item.type === "Video" && (
                <video src={item.thumbnail} className="w-full h-full object-cover" />
              )}
              {item.type === "Image" && (
                <Image src={item.thumbnail} fill className="object-cover" alt={item.name} />
              )}
              {item.type === "Playlist" && (
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-400">
                  {item.items.length} items
                </div>
              )}
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
  );
}
