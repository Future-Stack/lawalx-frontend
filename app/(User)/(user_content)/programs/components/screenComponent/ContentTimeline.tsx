"use client";
// Version: 1.0.2 - Shadcn/ui Dropdowns for better layering

import { Plus, GripVertical, Trash2, ChevronDown, FilePlay, CloudUpload } from "lucide-react";
import { useState, useEffect } from "react";
import AddContentDialog from "./AddContentDialog";
import UploadFileModal from "@/components/content/UploadFileModal";
import { Timeline } from "@/redux/api/users/programs/programs.type";
import { useDeleteFileMutation } from "@/redux/api/users/content/content.api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

type FileData = {
  id: string;
  duration?: number;
  originalName?: string;
  fileType?: string;
  url: string;
  [key: string]: any;
};

interface ContentTimelineProps {
  timeline: Timeline[];
  programId: string;
  onSelect?: (item: Timeline, index: number) => void;
  selectedId?: string;
  onChange?: (items: Timeline[]) => void;
}

const ContentTimeline: React.FC<ContentTimelineProps> = ({
  timeline,
  programId,
  onSelect,
  selectedId,
  onChange,
}) => {
  const [deleteFile] = useDeleteFileMutation();
  const [items, setItems] = useState<Timeline[]>([]);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  useEffect(() => {
    if (timeline) {
      setItems(timeline);
    }
  }, [timeline]);

  const calculateTotal = () => {
    const totalSeconds = items.reduce((sum, item) => sum + item.duration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} sec`;
  };

  const handleRemove = async (item: Timeline) => {
    try {
      // Calling the deleteFile API with the file's ID from content.api
      const res = await deleteFile({ id: item.fileId }).unwrap();
      toast.success(res?.message || "File deleted successfully");
      
      const updatedItems = items.filter((i) => i.id !== item.id);
      setItems(updatedItems);
      onChange?.(updatedItems);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete file");
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    onChange?.(newItems);
  };

  const formatStartTime = (timelineItems: Timeline[], index: number) => {
    let totalSeconds = 0;
    for (let i = 0; i < index; i++) {
      totalSeconds += timelineItems[i].duration;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleDurationChange = (index: number, value: string) => {
    const newDuration = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], duration: newDuration };
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  // Drag and Drop Logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(dragIndex) || dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleUploadSuccess = (uploadedFiles: any[]) => {
    const newTimelineItems: Timeline[] = uploadedFiles.map((file: FileData) => ({
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      fileId: file.id,
      duration: file.duration || 10,
      position: items.length,
      createdAt: new Date().toISOString(),
      programId: programId,
      file: file as any,
    }));

    const updatedItems = [...items, ...newTimelineItems];
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  const handleAppendExisting = (selectedFiles: any[]) => {
    const newTimelineItems: Timeline[] = selectedFiles.map((file) => ({
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      fileId: file.id,
      duration: file.duration || 10,
      position: items.length,
      createdAt: new Date().toISOString(),
      programId: programId,
      file: file,
    }));

    const updatedItems = [...items, ...newTimelineItems];
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  return (
    <div className="mx-auto">
      <div className="bg-navbarBg rounded-xl border border-border p-4 sm:p-6 overflow-visible shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h2 className="text-xl md:text-2xl font-semibold text-headings">Content Timeline</h2>
          <p className="text-sm text-muted">Total: {calculateTotal()}</p>
        </div>

        {/* Add Content Button with Dropdown (Portaled) */}
        <div className="w-full sm:w-auto mb-4 sm:mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-lg transition-all flex items-center justify-center gap-2 text-white py-2.5 px-4 cursor-pointer bg-bgBlue hover:bg-blue-500 w-full sm:w-auto font-semibold shadow-customShadow active:scale-95 outline-none"
              >
                <Plus className="w-5 h-5" />
                Add Content
                <ChevronDown className="w-4 h-4 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-full sm:w-48 bg-navbarBg border-border shadow-2xl z-[2147483647]">
              <DropdownMenuItem
                onClick={() => setIsAddExistingOpen(true)}
                className="px-4 py-2.5 text-sm font-medium text-body cursor-pointer flex items-center gap-2"
              >
                <FilePlay className="w-4 h-4 md:w-5 md:h-5 text-bgBlue" /> Add Existing
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2.5 text-sm font-medium text-body cursor-pointer flex items-center gap-2"
              >
                <CloudUpload className="w-4 h-4 md:w-5 md:h-5 text-bgBlue" /> Upload New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content List */}
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto p-1 custom-scrollbar">
          {items.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-border rounded-lg text-muted">
              No content added to timeline yet.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => onSelect?.(item, index)}
                className={`relative bg-navbarBg rounded-lg border p-3 sm:p-4 flex flex-row items-center gap-3 transition-all cursor-pointer ${
                  selectedId === item.id ? "border-bgBlue ring-1 ring-bgBlue bg-blue-50/5" : "border-border hover:border-blue-200"
                }`}
              >
                <GripVertical className="w-5 h-5 text-muted cursor-grab active:cursor-grabbing shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h3 className="font-semibold text-sm md:text-base text-headings truncate">
                      {item.file?.originalName || "Untitled Content"}
                    </h3>
                    {item.file?.fileType && (
                      <span className="text-[10px] px-1.5 py-0.5 border border-border text-muted rounded bg-navbarBg uppercase font-medium">
                        {item.file.fileType.split("/")[1] || item.file.fileType}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      Start: <span className="font-medium text-body">{formatStartTime(items, index)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      Duration: <span className="font-medium text-body">{item.duration}s</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.duration || ""}
                    onChange={(e) => handleDurationChange(index, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-14 text-sm font-semibold text-bgBlue bg-cardBackground px-2 py-1 rounded border border-border focus:ring-1 focus:ring-bgBlue outline-none text-center"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer outline-none active:scale-90"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <AddContentDialog
          open={isAddExistingOpen}
          setOpen={setIsAddExistingOpen}
          programId={programId}
          onAdd={handleAppendExisting}
        />

        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          setIsPageLoading={() => {}}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </div>
  );
};

export default ContentTimeline;