"use client";
// Version: 1.0.2 - Shadcn/ui Dropdowns for better layering

import { Plus, GripVertical, Trash2, ChevronDown, FilePlay, CloudUpload, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import AddContentDialog from "./AddContentDialog";
import UploadFileModal from "@/components/content/UploadFileModal";
import { Timeline } from "@/redux/api/users/programs/programs.type";
import { useDeleteFileMutation } from "@/redux/api/users/content/content.api";
import { toast } from "sonner";

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
  programName: string;
  onSelect?: (item: Timeline, index: number) => void;
  selectedId?: string;
  onChange?: (items: Timeline[]) => void;
}

const ContentTimeline: React.FC<ContentTimelineProps> = ({
  timeline,
  programId,
  programName,
  onSelect,
  selectedId,
  onChange,
}) => {
  const [deleteFile] = useDeleteFileMutation();
  const [items, setItems] = useState<Timeline[]>([]);
  const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorId, setErrorId] = useState<string | null>(null);

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
    let newDuration = value === "" ? 0 : Math.max(1, parseInt(value) || 1);
    const item = items[index];
    if (!item) return;

    const file = item.file;

    // Check if file is video or audio and cap duration at its original length
    if (file && (file.type === "VIDEO" || file.type === "AUDIO")) {
      const maxDuration = Math.ceil(file.duration || 0);
      if (newDuration > maxDuration) {
        newDuration = maxDuration;
        // Set local error state instead of toast
        setErrorId(item.id);
        const timer = setTimeout(() => setErrorId(null), 3000);
        return () => clearTimeout(timer);
      }
    }

    // Use map to ensure we create a new array and new object for the target item only
    const updatedItems = items.map((it, i) =>
      i === index ? { ...it, duration: newDuration } : it
    );

    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  const handleIncrement = (index: number, delta: number) => {
    const item = items[index];
    if (!item) return;
    const currentDuration = item.duration || 1;
    handleDurationChange(index, (currentDuration + delta).toString());
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
    setIsUploadModalOpen(false);
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

        {/* Add Content Button with Manual Dropdown */}
        <div className="relative w-full sm:w-auto mb-4 sm:mb-6">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-lg transition-all flex items-center justify-center gap-2 text-white py-2.5 px-4 cursor-pointer bg-bgBlue hover:bg-blue-600 w-full sm:w-auto font-semibold shadow-customShadow outline-none"
          >
            <Plus className="w-5 h-5" />
            <span>Add Content</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <>
              {/* Overlay to close dropdown */}
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setIsDropdownOpen(false)}
              />

              <div className="absolute left-0 mt-2 w-full sm:w-56 bg-navbarBg border border-border rounded-xl shadow-2xl z-[70] py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setIsAddExistingOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-headings hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <FilePlay className="w-5 h-5 text-bgBlue" />
                  Add Existing
                </button>

                <div className="h-[1px] bg-border mx-2" />

                <button
                  onClick={() => {
                    setIsUploadModalOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-sm font-medium text-headings hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left flex items-center gap-3 transition-colors cursor-pointer"
                >
                  <CloudUpload className="w-5 h-5 text-bgBlue" />
                  Upload New
                </button>
              </div>
            </>
          )}
        </div>

        {/* Content List */}
        <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto p-1 scrollbar-hide">
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
                className={`relative bg-navbarBg rounded-lg border p-3 sm:p-4 flex flex-row items-center gap-3 transition-all cursor-pointer ${selectedId === item.id ? "border-bgBlue ring-1 ring-bgBlue bg-blue-50/5" : "border-border hover:border-blue-200"
                  }`}
              >
                <GripVertical className="w-5 h-5 text-muted cursor-grab active:cursor-grabbing shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <h3 className="font-semibold text-sm md:text-base text-headings line-clamp-1 truncate">
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

                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-cardBackground border border-border rounded-lg px-1 shadow-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrement(index, -1);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-muted transition-colors cursor-pointer outline-none"
                        title="Decrease duration"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min="1"
                        max={
                          (item.file?.type === "VIDEO" || item.file?.type === "AUDIO")
                            ? Math.ceil(item.file.duration || 0)
                            : undefined
                        }
                        value={item.duration || ""}
                        onChange={(e) => handleDurationChange(index, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 text-[11px] font-bold text-bgBlue bg-transparent border-none outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIncrement(index, 1);
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-muted transition-colors cursor-pointer outline-none"
                        title="Increase duration"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer outline-none"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {errorId === item.id && (
                    <span className="text-[9px] text-red-500 font-semibold animate-transition-in px-1 text-right">
                      Max duration exceeded!
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <AddContentDialog
          open={isAddExistingOpen}
          setOpen={setIsAddExistingOpen}
          programId={programId}
          programName={programName}
          existingFileIds={items.map((t) => t.fileId)}
          onAdd={handleAppendExisting}
        />

        <UploadFileModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          setIsPageLoading={() => { }}
          onSuccess={handleUploadSuccess}
          programId={programId}
        />
      </div>
    </div>
  );
};

export default ContentTimeline;