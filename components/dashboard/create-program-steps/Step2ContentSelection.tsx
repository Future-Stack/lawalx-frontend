/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Search,
  CircleCheckBigIcon,
  AudioLines,
  Image as ImageIcon,
  ChevronRight,
  Trash2,
  Loader2,
  Plus,
} from "lucide-react";
import Dropdown from "@/common/Dropdown";
import Image from "next/image";
import folderIcon from "@/public/icons/folder.svg";
import { toast } from "sonner";

interface Step2ContentSelectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  setIsUploadModalOpen: (val: boolean) => void;
  filteredContent: any[];
  isContentLoading: boolean;
  isMounted: boolean;
  programData: {
    content_ids: string[];
  };
  setProgramData: React.Dispatch<React.SetStateAction<any>>;
  expandedFolders: Set<string>;
  setDeletedContentIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  deletingId: string | null;
  setDeletingId: (val: string | null) => void;
  toggleFolder: (e: React.MouseEvent, folderId: string) => void;
  toggleVideoSelection: (contentId: string) => void;
  selectableItems: any[];
  allFilteredSelected: boolean;
  handleSelectAll: () => void;
}

export default function Step2ContentSelection({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
  setIsUploadModalOpen,
  filteredContent,
  isContentLoading,
  isMounted,
  programData,
  setProgramData,
  expandedFolders,
  setDeletedContentIds,
  deletingId,
  setDeletingId,
  toggleFolder,
  toggleVideoSelection,
  selectableItems,
  allFilteredSelected,
  handleSelectAll,
}: Step2ContentSelectionProps) {
  
  const renderContentItem = (item: any, depth = 0) => {
    const isSelected = programData.content_ids.includes(item.id);
    const isExpanded = expandedFolders.has(item.id);

    const deleteFile = (id: any) => {
      setDeletingId(id);
      setTimeout(() => {
        setDeletedContentIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
        setProgramData((prev: any) => ({
          ...prev,
          content_ids: prev.content_ids.filter((contentId: string) => contentId !== id),
        }));
        setDeletingId(null);
        toast.success("Content removed from list");
      }, 500);
    };

    return (
      <div key={item.id} className="space-y-2">
        <div
          onClick={(e) => {
            if (item.type === "folder") toggleFolder(e, item.id);
            else toggleVideoSelection(item.id);
          }}
          className={`flex items-center gap-3 p-3 rounded-lg border border-borderGray dark:border-gray-700 bg-white dark:bg-gray-800 transition-all group ${
            isSelected
              ? "border-bgBlue bg-blue-50/50 dark:bg-blue-950/20"
              : "hover:border-bgBlue hover:bg-blue-50 dark:hover:bg-blue-950/20"
          } cursor-pointer`}
          style={{ marginLeft: depth > 0 ? `${depth * 1.5}rem` : 0 }}
        >
          <div className="flex-shrink-0">
            {item.type !== "folder" && (
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-bgBlue border-bgBlue text-white"
                    : "border-gray-300 dark:border-gray-600 group-hover:border-bgBlue"
                }`}
              >
                {isSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {item.type === "folder" && (
              <ChevronRight
                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              />
            )}

            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {item.type === "audio" ? (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-950/20">
                  <AudioLines className="w-5 h-5 text-bgBlue" />
                  <audio src={item.audio} muted={false} />
                </div>
              ) : item.type === "video" ? (
                <video src={item.video} className="w-full h-full object-cover" muted />
              ) : item.type === "folder" ? (
                <Image src={folderIcon} alt="folder" width={24} height={24} />
              ) : item.thumbnail ? (
                <Image src={item.thumbnail} alt={item.title} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-bgBlue" />
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white group-hover:text-bgBlue transition-colors truncate text-sm">
              {item.title}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
              {item.type === "folder" ? `${item.fileCount || 0} items` : `${item.size} ${item.duration ? `• ${item.duration}` : ""}`}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (deletingId) return;
              deleteFile(item.id);
            }}
            disabled={!!deletingId}
            className="hover:bg-red-100 p-2 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[36px] flex items-center justify-center"
          >
            {deletingId === item.id ? (
              <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5 text-red-500" />
            )}
          </button>
        </div>

        {item.type === "folder" && isExpanded && item.children && (
          <div className="space-y-2">
            {item.children.map((child: any) => renderContentItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search Content"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <div className="flex-1">
            <Dropdown
              options={[
                { value: "all", label: "All Content" },
                { value: "video", label: "Videos" },
                { value: "image", label: "Images" },
                { value: "audio", label: "Audio" },
              ]}
              value={selectedType}
              onChange={(value) => setSelectedType(String(value))}
              className="w-full cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-bgBlue hover:bg-blue-600 text-white rounded-lg font-medium transition-colors cursor-pointer shrink-0 shadow-customShadow"
          >
            <Plus className="w-5 h-5" />
            <span>Upload Content</span>
          </button>
        </div>
      </div>

      {filteredContent.length > 0 && !isContentLoading && (
        <div className="flex items-center justify-between px-1 py-1">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-bgBlue dark:hover:text-bgBlue transition-colors cursor-pointer select-none"
          >
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                allFilteredSelected
                  ? "bg-bgBlue border-bgBlue text-white"
                  : "border-gray-300 dark:border-gray-600 hover:border-bgBlue"
              }`}
            >
              {allFilteredSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
            </div>
            <span>Select All ({selectableItems.length})</span>
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Selected: {programData.content_ids.length}
          </span>
        </div>
      )}

      <div className="max-h-[350px] overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
        {isContentLoading || !isMounted ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span>Loading your content...</span>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No files found matching your search.
          </div>
        ) : (
          filteredContent.map((item) => renderContentItem(item))
        )}
      </div>
    </div>
  );
}
