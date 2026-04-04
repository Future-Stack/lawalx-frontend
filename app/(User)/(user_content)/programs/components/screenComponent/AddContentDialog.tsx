"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Search, Play, Loader2 } from "lucide-react";
import BaseDialog from "@/common/BaseDialog";
import BaseSelect from "@/common/BaseSelect";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useGetAllFilesQuery, useAssignProgramMutation } from "@/redux/api/users/content/content.api";
import { FileItem } from "@/redux/api/users/content/content.type";
import { getUrl } from "@/lib/content-utils";
import { toast } from "sonner";

interface AddContentDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  programId: string;
  onAdd: (selectedFiles: FileItem[]) => void;
}

const AddContentDialog = ({ open, setOpen, programId, onAdd }: AddContentDialogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { data, isLoading, isError } = useGetAllFilesQuery();
  const [assignProgram] = useAssignProgramMutation();

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
      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, selectedFilter]);

  const formatSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title="Add Content to Program"
      description="Select videos or images to add to your screen timeline."
      maxWidth="2xl"
      maxHeight="xl"
    >
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-input border border-border rounded-lg text-sm"
          />
        </div>
        <div className="w-full sm:w-40">
          <BaseSelect
            placeholder="All Content"
            options={filterOptions}
            value={selectedFilter}
            onChange={setSelectedFilter}
            showLabel={false}
            className="min-w-full sm:min-w-[150px]"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="divide-y divide-border overflow-y-auto pr-1 sm:pr-2" style={{ maxHeight: "calc(100vh - 400px)", minHeight: "200px" }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Loading files...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            <p>Failed to load content. Please try again.</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p>No content found matching your filters.</p>
          </div>
        ) : (
          filteredContent.map((item: FileItem) => {
            const isSelected = selectedItems.includes(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 py-3 px-2 sm:px-3 cursor-pointer transition-colors hover:bg-navbarBg/50 rounded-lg mb-1 ${isSelected ? "bg-navbarBg border-bgBlue" : ""
                  }`}
                onClick={() => handleSelectItem(item.id)}
              >
                <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelectItem(item.id)}
                    className="h-5 w-5 cursor-pointer data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue"
                  />
                </div>

                {/* Thumbnail */}
                <div className="relative w-16 h-12 sm:w-20 sm:h-16 bg-gray-200 rounded overflow-hidden shrink-0 border border-border">
                  {item.type === "IMAGE" ? (
                    <Image
                      src={getUrl(item.url) || ""}
                      alt={item.originalName}
                      width={80}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <video
                      src={getUrl(item.url)}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                      onError={(e: any) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-400">No Preview</div>';
                      }}
                    />
                  )}
                  {item.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                        <Play className="h-3 w-3 sm:h-4 sm:w-4 text-bgBlue ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h4 className="text-sm md:text-base font-semibold text-headings truncate">
                      {item.originalName}
                    </h4>
                    <span className="text-[10px] w-fit px-1.5 py-0.5 rounded-md text-muted border border-border bg-navbarBg font-medium uppercase">
                      {item.fileType.split("/")[1] || item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 sm:mt-1">
                    <p className="text-[10px] sm:text-xs text-muted">
                      {formatSize(item.size)}
                    </p>
                    {item.duration > 0 && (
                      <p className="text-[10px] sm:text-xs text-muted flex items-center gap-1 before:content-['•'] before:mr-1">
                        {item.duration}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t mt-4">
        <Button
          variant="outline"
          onClick={handleClearSelection}
          className="border-bgBlue/50 font-semibold text-sm sm:text-base hover:bg-bgBlue/10 text-bgBlue w-full sm:w-auto shadow-customShadow"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddContent}
          disabled={selectedItems.length === 0}
          className="bg-bgBlue hover:bg-blue-500 font-semibold text-sm sm:text-base text-white w-full sm:w-auto shadow-customShadow"
        >
          Add {selectedItems.length > 0 ? `(${selectedItems.length})` : ""} content
        </Button>
      </div>
    </BaseDialog>
  );
};

export default AddContentDialog;
