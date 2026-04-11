"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Play, Loader2, X, CircleCheckBigIcon } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import BlueSelect from "@/common/BlueSelect";
import Image from "next/image";
import { useGetAllFilesQuery, useAssignProgramMutation } from "@/redux/api/users/content/content.api";
import { FileItem } from "@/redux/api/users/content/content.type";
import { getUrl, formatBytes } from "@/lib/content-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddContentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  programId: string;
  programName: string;
  existingFileIds: string[];
  onAdd: (selectedFiles: FileItem[]) => void;
}

const AddContentDialog = ({ open, setOpen, programId, programName, existingFileIds, onAdd }: AddContentDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { data, isLoading, isError } = useGetAllFilesQuery();
  const [assignProgram] = useAssignProgramMutation();

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedItems([]);
      setSearchQuery("");
      setSelectedFilter("all");
    }
  }, [open]);

  const filterOptions = [
    { label: "All Content", value: "all" },
    { label: "Video", value: "video" },
    { label: "Image", value: "image" },
  ];

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setOpen(false);
  };

  const handleAddContent = async () => {
    if (!data?.data) return;
    const selectedFiles = (data.data as FileItem[]).filter((file: FileItem) => selectedItems.includes(file.id));

    try {
      // Call assignProgram for each selected item
      await Promise.all(
        selectedFiles.map((file: FileItem) =>
          assignProgram({ id: file.id, programId }).unwrap()
        )
      );
      toast.success("Content assigned to program successfully");
      onAdd(selectedFiles);
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to assign content to program");
    }
  };

  const filteredContent = useMemo(() => {
    if (!data?.data) return [];
    return (data.data as FileItem[]).filter((item: FileItem) => {
      const matchesSearch = item.originalName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === "all" || item.type === selectedFilter;
      const isNotAlreadyAssigned = !existingFileIds.includes(item.id);
      return matchesSearch && matchesFilter && isNotAlreadyAssigned;
    });
  }, [data, searchQuery, selectedFilter, existingFileIds]);


  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[2147483647] bg-black/50 animate-in fade-in duration-200" />
        <DialogPrimitive.Content
          className="fixed top-[50%] left-[50%] z-[2147483647] w-full max-w-[640px] translate-x-[-50%] translate-y-[-50%] outline-none animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                  Add Content to the {programName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Select videos or images to add to your screen timeline.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Section (Fixed below header) */}
            <div className="px-5 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-800/20">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 h-[46px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-bgBlue/20 outline-none transition-all"
                  />
                </div>
                <div className="w-full sm:w-44">
                  <BlueSelect
                    placeholder="All Content"
                    options={filterOptions}
                    value={selectedFilter}
                    onChange={setSelectedFilter}
                    showLabel={false}
                    className="h-[46px] shadow-none"
                  />
                </div>
              </div>
            </div>

            {/* Content List (Scrollable Body) */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 scrollbar-hide">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin text-bgBlue" />
                  <p className="text-sm font-medium">Loading your content...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-20 text-red-500 bg-red-50/50 rounded-xl border border-red-100">
                  <p className="font-medium">Failed to load content. Please try again.</p>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500">No content found matching your filters.</p>
                </div>
              ) : (
                <div className="grid gap-2 w-full overflow-x-hidden">
                  {filteredContent.map((item: FileItem) => {
                    const isSelected = selectedItems.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectItem(item.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer group w-full",
                          isSelected
                            ? "border-bgBlue bg-blue-50/50 dark:bg-blue-950/20"
                            : "border-borderGray dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-bgBlue hover:bg-blue-50 dark:hover:bg-blue-950/20"
                        )}
                      >
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                          <div
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all",
                              isSelected
                                ? "bg-bgBlue border-bgBlue text-white"
                                : "border-gray-300 dark:border-gray-600 group-hover:border-bgBlue"
                            )}
                          >
                            {isSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                          </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-gray-700">
                          {item.type === "IMAGE" ? (
                            <Image
                              src={getUrl(item.url) || ""}
                              alt={item.originalName}
                              fill
                              className="object-cover"
                              unoptimized={true}
                            />
                          ) : (
                            <video
                              src={getUrl(item.url)}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                          )}
                          {item.type === "VIDEO" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
                              <Play className="h-3 w-3 text-white fill-current opacity-80" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-bgBlue transition-colors line-clamp-1 break-all mb-0.5">
                            {item.originalName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                              {formatBytes(item.size)}
                              {item.duration > 0 && ` • ${item.duration}s`}
                            </p>
                            <span className="text-[9px] px-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 uppercase font-bold tracking-tighter">
                              {item.fileType.split("/")[1] || item.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer (Fixed Section) */}
            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 px-5 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                onClick={() => setOpen(false)}
                className="w-full sm:flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                disabled={selectedItems.length === 0}
                className={cn(
                  "w-full sm:flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-customShadow",
                  selectedItems.length === 0
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-bgBlue hover:bg-blue-600 active:scale-[0.98] cursor-pointer"
                )}
              >
                Add {selectedItems.length > 0 ? `(${selectedItems.length})` : ""} content
              </button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default AddContentDialog;
