"use client";

import { Plus, GripVertical, MoreVertical, Trash2, ArrowUp, ArrowDown, ChevronDown, FilePlay, CloudUpload } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import AddContentDialog from "./AddContentDialog";

import { Timeline, FileData } from "@/redux/api/users/programs/programs.type";
import { useDeleteProgramMutation } from "@/redux/api/users/programs/programs.api";
import { toast } from "sonner";
import { useUploadFileMutation } from "@/redux/api/users/content/content.api";

interface ContentTimelineProps {
  timeline: Timeline[];
  programId: string;
  onSelect?: (item: Timeline, index: number) => void;
  selectedId?: string;
  onChange?: (items: Timeline[]) => void;
}
const ContentTimeline: React.FC<ContentTimelineProps> = ({ timeline, programId, onSelect, selectedId, onChange }) => {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [contentDelete] = useDeleteProgramMutation();
  const [items, setItems] = useState<Timeline[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (timeline) {
      setItems(timeline);
    }
  }, [timeline]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }

      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId, isDropdownOpen]);

  const calculateTotal = () => {
    const totalSeconds = items.reduce((sum, item) => sum + item.duration, 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} sec`;
  };

  const handleRemove = async (id: string) => {
    try {
      const res = await contentDelete({ id });
      if (res) {
        toast.success(res.data?.message || "Content deleted successfully");
        const updatedItems = items.filter(item => item.id !== id);
        setItems(updatedItems);
        onChange?.(updatedItems);
        setOpenMenuId(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    onChange?.(newItems);
    setOpenMenuId(null);
  };

  const formatStartTime = (items: Timeline[], index: number) => {
    let totalSeconds = 0;
    for (let i = 0; i < index; i++) {
      totalSeconds += items[i].duration;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());

    const dragElement = e.currentTarget as HTMLElement;
    const clone = dragElement.cloneNode(true) as HTMLElement;
    clone.style.position = 'absolute';
    clone.style.top = '-9999px';
    clone.style.width = dragElement.offsetWidth + 'px';
    clone.style.backgroundColor = 'white';
    clone.style.opacity = '0.9';
    document.body.appendChild(clone);
    e.dataTransfer.setDragImage(clone, 0, 0);

    setTimeout(() => {
      document.body.removeChild(clone);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    setItems(newItems);
    onChange?.(newItems);
  };

  const handleDurationChange = (index: number, value: string) => {
    const newDuration = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], duration: newDuration };
    setItems(updatedItems);
    onChange?.(updatedItems);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await uploadFile(formData).unwrap();
      const uploadedFiles = Array.isArray(res.data) ? res.data : [res.data];

      const newTimelineItems: Timeline[] = uploadedFiles.map((file: FileData) => ({
        id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        fileId: file.id,
        duration: file.duration || 10,
        position: items.length,
        createdAt: new Date().toISOString(),
        programId: "",
        file: file
      }));

      const updatedItems = [...items, ...newTimelineItems];
      setItems(updatedItems);
      onChange?.(updatedItems);

      toast.success(res?.message || "File(s) uploaded and added to timeline");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      console.error("Upload failed:", err);
      toast.error(error?.data?.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="mx-auto">
      {/* overflow-visible ensures the dropdown is never clipped by this container */}
      <div className="bg-navbarBg rounded-xl border border-border p-4 sm:p-6 overflow-visible">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h2 className="text-xl md:text-2xl font-semibold text-headings">Content Timeline</h2>
          <p className="text-sm text-muted">Total: {items.length ? calculateTotal() : "00 min 00 sec"}</p>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        {/* Add Content Button with Dropdown */}
        {/* position:relative here + z-[999] on the dropdown menu lets it escape the overflow-y-auto scroll container below */}
        <div className="relative w-full sm:w-auto mb-4 sm:mb-6" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-lg transition-all flex items-center justify-center gap-2 text-white py-2.5 px-4 cursor-pointer bg-bgBlue hover:bg-blue-500 w-full sm:w-auto font-semibold shadow-customShadow"
          >
            <Plus className="w-5 h-5" />
            Add Content
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 z-[999] bg-navbarBg rounded-lg shadow-xl border border-border py-2 w-full sm:w-48">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setOpen(true);
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue transition-colors cursor-pointer flex items-center gap-2"
              >
                <FilePlay className="w-4 h-4 md:w-5 md:h-5" /> Add Existing
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleUploadClick();
                }}
                className={`w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue transition-colors cursor-pointer flex items-center gap-2 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isUploading}
              >
                <CloudUpload className={`w-4 h-4 md:w-5 md:h-5 ${isUploading ? "animate-bounce" : ""}`} />
                {isUploading ? "Uploading..." : "Upload New"}
              </button>
            </div>
          )}
        </div>

        {/* Content List — overflow-y-auto is scoped only to this inner div, not the card */}
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto p-1">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onSelect && onSelect(item, index)}
              className={`relative bg-navbarBg rounded-lg border p-3 sm:p-4 flex flex-row items-start sm:items-center gap-3 sm:gap-3 transition-colors cursor-pointer ${selectedId === item.id ? "border-bgBlue ring-1 ring-bgBlue" : "border-border hover:border-blue-200"
                }`}
            >
              <GripVertical className="w-5 h-5 text-muted cursor-grab active:cursor-grabbing shrink-0" />

              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-sm md:text-lg text-headings">{item.file?.originalName}</h3>
                  {item.file?.fileType && (
                    <span className="text-xs w-fit px-2 py-0.5 border border-border text-muted rounded-lg whitespace-nowrap uppercase">
                      {item.file.fileType.split('/')[1] || item.file.fileType}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1 text-sm text-muted">
                  <span>Start: {formatStartTime(items, index)}</span>
                  <span>Duration: {item.duration} Sec</span>
                </div>
              </div>

              <div className="shrink-0 text-right mt-2 sm:mt-0 sm:mr-2">
                <input
                  type="number"
                  min="0"
                  value={item.duration === 0 ? "" : item.duration}
                  onChange={(e) => handleDurationChange(index, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onDragStart={(e) => e.stopPropagation()}
                  className="w-15 text-lg font-medium text-bgBlue bg-cardBackground px-3 py-1 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-bgBlue/20 text-center cursor-text shadow-customShadow"
                />
              </div>

              <div
                className="relative shrink-0 mt-2 sm:mt-0"
                ref={(el) => {
                  if (el) menuRefs.current[item.id] = el;
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === item.id ? null : item.id);
                  }}
                  className="rounded transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-muted cursor-pointer hover:text-bgBlue" />
                </button>

                {openMenuId === item.id && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-navbarBg rounded-lg shadow-xl border border-border py-1 w-40">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:text-bgBlue flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, "up");
                      }}
                      disabled={index === 0}
                      className="w-full px-4 py-2 text-left text-sm text-body hover:text-bgBlue flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" /> Move Up
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, "down");
                      }}
                      disabled={index === items.length - 1}
                      className="w-full px-4 py-2 text-left text-sm text-body hover:text-bgBlue flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" /> Move Down
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      {open && (
        <AddContentDialog
          open={open}
          setOpen={setOpen}
          programId={programId}
          onAdd={(selectedFiles) => {
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
          }}
        />
      )}
    </div>
  );
};

export default ContentTimeline;



// "use client";

// import { Plus, GripVertical, MoreVertical, Trash2, ArrowUp, ArrowDown, ChevronDown, FilePlay, CloudUpload } from "lucide-react";
// import { useState, useRef, useEffect } from "react";
// import AddContentDialog from "./AddContentDialog";

// import { Timeline, FileData } from "@/redux/api/users/programs/programs.type";
// import { useDeleteProgramMutation } from "@/redux/api/users/programs/programs.api";
// import { toast } from "sonner";
// import { useUploadFileMutation } from "@/redux/api/users/content/content.api";

// interface ContentTimelineProps {
//   timeline: Timeline[];
//   onSelect?: (item: Timeline, index: number) => void;
//   selectedId?: string;
//   onChange?: (items: Timeline[]) => void;
// }

// const ContentTimeline: React.FC<ContentTimelineProps> = ({ timeline, onSelect, selectedId, onChange }) => {
//   const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
//   const [contentDelete] = useDeleteProgramMutation();
//   const [items, setItems] = useState<Timeline[]>([]);
//   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     if (timeline) {
//       setItems(timeline);
//     }
//   }, [timeline]);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }

//       if (openMenuId !== null) {
//         const menuElement = menuRefs.current[openMenuId];
//         if (menuElement && !menuElement.contains(event.target as Node)) {
//           setOpenMenuId(null);
//         }
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [openMenuId, isDropdownOpen]);

//   const calculateTotal = () => {
//     const totalSeconds = items.reduce((sum, item) => sum + item.duration, 0);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${String(minutes).padStart(2, "0")} min ${String(seconds).padStart(2, "0")} sec`;
//   };

//   const handleRemove = async (id: string) => {
//     try {
//       const res = await contentDelete({ id });
//       if (res) {
//         toast.success(res.data?.message || "Content deleted successfully");
//         const updatedItems = items.filter(item => item.id !== id);
//         setItems(updatedItems);
//         onChange?.(updatedItems);
//         setOpenMenuId(null);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleMove = (index: number, direction: "up" | "down") => {
//     const newItems = [...items];
//     const targetIndex = direction === "up" ? index - 1 : index + 1;
//     if (targetIndex < 0 || targetIndex >= items.length) return;
//     [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
//     setItems(newItems);
//     onChange?.(newItems);
//     setOpenMenuId(null);
//   };

//   const formatStartTime = (items: Timeline[], index: number) => {
//     let totalSeconds = 0;
//     for (let i = 0; i < index; i++) {
//       totalSeconds += items[i].duration;
//     }
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
//   };

//   const handleDragStart = (e: React.DragEvent, index: number) => {
//     e.dataTransfer.effectAllowed = 'move';
//     e.dataTransfer.setData('text/html', index.toString());

//     // Create a visible drag image
//     const dragElement = e.currentTarget as HTMLElement;
//     const clone = dragElement.cloneNode(true) as HTMLElement;
//     clone.style.position = 'absolute';
//     clone.style.top = '-9999px';
//     clone.style.width = dragElement.offsetWidth + 'px';
//     clone.style.backgroundColor = 'white';
//     clone.style.opacity = '0.9';
//     document.body.appendChild(clone);
//     e.dataTransfer.setDragImage(clone, 0, 0);

//     setTimeout(() => {
//       document.body.removeChild(clone);
//     }, 0);
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = 'move';
//   };

//   const handleDrop = (e: React.DragEvent, dropIndex: number) => {
//     e.preventDefault();
//     const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
//     if (dragIndex === dropIndex) return;

//     const newItems = [...items];
//     const [draggedItem] = newItems.splice(dragIndex, 1);
//     newItems.splice(dropIndex, 0, draggedItem);
//     setItems(newItems);
//     onChange?.(newItems);
//   };

//   const handleDurationChange = (index: number, value: string) => {
//     const newDuration = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
//     const updatedItems = [...items];
//     updatedItems[index] = { ...updatedItems[index], duration: newDuration };
//     setItems(updatedItems);
//     onChange?.(updatedItems);
//   };

//   const handleUploadClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files;
//     if (!files || files.length === 0) return;

//     const formData = new FormData();
//     for (let i = 0; i < files.length; i++) {
//       formData.append("file", files[i]);
//     }

//     try {
//       const res = await uploadFile(formData).unwrap();
//       const uploadedFiles = Array.isArray(res.data) ? res.data : [res.data];

//       const newTimelineItems: Timeline[] = uploadedFiles.map((file: FileData) => ({
//         id: `temp-${Math.random().toString(36).substr(2, 9)}`,
//         fileId: file.id,
//         duration: file.duration || 10, // Default 10s for images if not specified
//         position: items.length,
//         createdAt: new Date().toISOString(),
//         programId: "", // Will be assigned on save
//         file: file
//       }));

//       const updatedItems = [...items, ...newTimelineItems];
//       setItems(updatedItems);
//       onChange?.(updatedItems);

//       toast.success(res?.message || "File(s) uploaded and added to timeline");
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     } catch (err: unknown) {
//       const error = err as { data?: { message?: string } };
//       console.error("Upload failed:", err);
//       toast.error(error?.data?.message || "Upload failed. Please try again.");
//     }
//   };

//   return (
//     <div className="mx-auto">
//       <div className="bg-navbarBg rounded-xl border border-border p-4 sm:p-6">
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
//           <h2 className="text-xl md:text-2xl font-semibold text-headings">Content Timeline</h2>
//           <p className="text-sm text-muted">Total: {items.length ? calculateTotal() : "00 min 00 sec"}</p>
//         </div>

//         {/* Hidden File Input */}
//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           className="hidden"
//           multiple
//         />

//         {/* Add Schedule Button with Dropdown */}
//         <div className="relative w-full sm:w-auto mb-4 sm:mb-6" ref={dropdownRef}>
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="rounded-lg transition-all flex items-center justify-center gap-2 text-white py-2.5 px-4 cursor-pointer bg-bgBlue hover:bg-blue-500 w-full sm:w-auto font-semibold shadow-customShadow"
//           >
//             <Plus className="w-5 h-5" />
//             Add Content
//             <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 z-50 bg-navbarBg rounded-lg shadow-xl border border-border py-2 w-full sm:w-48">
//               <button
//                 onClick={() => {
//                   setIsDropdownOpen(false);
//                   setOpen(true);
//                 }}
//                 className="w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue transition-colors cursor-pointer flex items-center gap-2 "
//               >
//                 <FilePlay className="w-4 h-4 md:w-5 md:h-5" /> Add Existing
//               </button>
//               <div className="border-t border-border my-1" />
//               <button
//                 onClick={() => {
//                   setIsDropdownOpen(false);
//                   handleUploadClick();
//                 }}
//                 className={`w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue transition-colors cursor-pointer flex items-center gap-2 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
//                 disabled={isUploading}
//               >
//                 <CloudUpload className={`w-4 h-4 md:w-5 md:h-5 ${isUploading ? "animate-bounce" : ""}`} />
//                 {isUploading ? "Uploading..." : "Upload New"}
//               </button>
//             </div>
//           )}
//         </div>
//         {/* Content List */}
//         <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto p-1">
//           {items.map((item, index) => (
//             <div
//               key={item.id}
//               draggable
//               onDragStart={(e) => handleDragStart(e, index)}
//               onDragOver={handleDragOver}
//               onDrop={(e) => handleDrop(e, index)}
//               onClick={() => onSelect && onSelect(item, index)}
//               className={`relative bg-navbarBg rounded-lg border p-3 sm:p-4 flex flex-row items-start sm:items-center gap-3 sm:gap-3 transition-colors cursor-pointer ${selectedId === item.id ? "border-bgBlue ring-1 ring-bgBlue" : "border-border hover:border-blue-200"
//                 }`}
//             >
//               <GripVertical className="w-5 h-5 text-muted cursor-grab active:cursor-grabbing shrink-0" />

//               <div className="flex-1 min-w-0 w-full sm:w-auto">
//                 <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 flex-wrap">
//                   <h3 className="font-semibold text-sm md:text-lg text-headings">{item.file?.originalName}</h3>
//                   {item.file?.fileType && (
//                     <span className="text-xs w-fit px-2 py-0.5 border border-border text-muted rounded-lg whitespace-nowrap uppercase">
//                       {item.file.fileType.split('/')[1] || item.file.fileType}
//                     </span>
//                   )}
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-1 text-sm text-muted">
//                   <span>Start: {formatStartTime(items, index)}</span>
//                   <span>Duration: {item.duration} Sec</span>
//                 </div>
//               </div>

//               <div className="shrink-0 text-right mt-2 sm:mt-0 sm:mr-2">
//                 <input
//                   type="number"
//                   min="0"
//                   value={item.duration === 0 ? "" : item.duration}
//                   onChange={(e) => handleDurationChange(index, e.target.value)}
//                   onClick={(e) => e.stopPropagation()}
//                   onMouseDown={(e) => e.stopPropagation()}
//                   onDragStart={(e) => e.stopPropagation()}
//                   className="w-15 text-lg font-medium text-bgBlue bg-cardBackground px-3 py-1 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-bgBlue/20 text-center cursor-text shadow-customShadow"
//                 />
//               </div>

//               <div
//                 className="relative shrink-0 mt-2 sm:mt-0"
//                 ref={(el) => {
//                   if (el) menuRefs.current[item.id] = el;
//                 }}
//               >
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setOpenMenuId(openMenuId === item.id ? null : item.id);
//                   }}
//                   className="rounded transition-colors"
//                 >
//                   <MoreVertical className="w-5 h-5 text-muted cursor-pointer hover:text-bgBlue" />
//                 </button>

//                 {openMenuId === item.id && (
//                   <div className="absolute right-0 top-full mt-1 z-50 bg-navbarBg rounded-lg shadow-xl border border-border py-1 w-40">
//                     <button

//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleRemove(item.id);
//                       }}
//                       className="w-full px-4 py-2 text-left text-sm text-red-500 hover:text-bgBlue flex items-center gap-2 cursor-pointer"
//                     >
//                       <Trash2 className="w-4 h-4" /> Remove
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMove(index, "up");
//                       }}
//                       disabled={index === 0}
//                       className="w-full px-4 py-2 text-left text-sm text-body hover:text-bgBlue flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
//                     >
//                       <ArrowUp className="w-4 h-4" /> Move Up
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleMove(index, "down");
//                       }}
//                       disabled={index === items.length - 1}
//                       className="w-full px-4 py-2 text-left text-sm text-body hover:text-bgBlue flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
//                     >
//                       <ArrowDown className="w-4 h-4" /> Move Down
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {open && <AddContentDialog open={open} setOpen={setOpen} />}
//     </div>
//   );
// }

// export default ContentTimeline;