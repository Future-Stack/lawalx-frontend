/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Play,
  ChevronRight,
  AudioLines,
  MoreVertical,
  Pencil,
  FolderOpen,
  Trash2,
  ScreenShare,
  CalendarClock,
  Folder,
  Eye,
} from "lucide-react";
import { ContentItem } from "@/types/content";
import { Checkbox } from "../ui/checkbox";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import folder from "@/public/icons/folder.svg";
import MenuDropdown from "@/common/MenuDropdown";
import VideoPlayDialog from "./VideoPlayDialog";
import ImageViewDialog from "./ImageViewDialog";
import AudioPlayerDialog from "./AudioPlayerDialog";
import FolderOpenDialog from "./FolderOepnDialog";
import RenameDialog from "./RenameDialog";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";
import { useDeleteFileMutation, useDeleteFolderMutation } from "@/redux/api/users/content/content.api";
import { toast } from "sonner";
import AssignToDialog from "./AssignToDialog";

interface ContentCardProps {
  item: ContentItem;
  viewMode?: "grid" | "list";
  onSelect?: (id: string) => void;
  onMenuClick?: (id: string, action: string) => void;
  onAssignClick?: (id: string) => void;
}

const MyContentCard = ({
  item,
  viewMode = "grid",
  onSelect,
  onMenuClick,
  onAssignClick,
}: ContentCardProps) => {
  const [fileDelete] = useDeleteFileMutation();
  const [folderDelete] = useDeleteFolderMutation();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [openAudio, setOpenAudio] = useState(false);
  const [openFolder, setOpenFolder] = useState(false);
  const [openRename, setOpenRename] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  console.log("this is all content item", item);


  const getTypeLabel = () => {
    switch (item.type) {
      case "folder": return "Folder";
      case "playlist": return "Playlist";
      case "video": return "Video";
      case "image": return "PNG";
      default: return "File";
    }
  };

  // const getFileExtension = () => {
  //   switch (item.type) {
  //     case "video": return ".MP4";
  //     case "image": return ".PNG";
  //     default: return "";
  //   }
  // };


  const getThumbnailIcon = () => {
    if (item.thumbnail) {
      return (
        <div
          className={`relative w-14 h-14 rounded-xl overflow-hidden bg-navbarBg shrink-0 ${item.type === "image" ? "cursor-pointer" : ""}`}
          onClick={(e) => {
            if (item.type === "image") {
              e.stopPropagation();
              setOpenImage(true);
            }
          }}
          role={item.type === "image" ? "button" : undefined}
        >
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            unoptimized
            className="object-cover"
            onError={(e: any) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xs text-gray-400">Broken</div>';
            }}
          />
          {item.type === "video" && (
            <button onClick={(e) => { e.stopPropagation(); setOpen(true); }} className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
              <Play className="w-5 h-5 text-white fill-white" />
            </button>
          )}
          {item.type === "image" && (
            <button onClick={(e) => { e.stopPropagation(); setOpenImage(true); }} className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
              <Eye className="w-5 h-5 text-white fill-white" />
            </button>
          )}
        </div>
      );
    }

    switch (item.type) {
      case "folder":
        return (
          <div className="w-14 h-14 rounded-xl bg-navbarBg flex items-center justify-center shrink-0">
            <Image src={folder} alt="folder" />
          </div>
        );
      case "playlist":
        return (
          <div className="relative flex flex-col items-center gap-3 w-14 h-14 shrink-0">
            <AudioLines className="w-14 h-14 text-bgBlue stroke-[1.5]" />
            <button onClick={() => setOpenAudio(true)} className="absolute bg-white/90 dark:bg-gray-900/90 rounded-full p-1.5 mt-2 hover:bg-white dark:hover:bg-gray-900 transition-colors">
              <Play className="w-6 h-6 text-gray-400 dark:text-gray-300 fill-[rgba(255,255,255,0.7)] drop-shadow-[0_0_8px_rgba(0,0,0,0.25)]" />
            </button>
          </div>
        );
      case "video":
        return (
          <div
            className="relative w-14 h-14 rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer"
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
          >
            <video
              src={item.video}
              className="w-full h-full object-cover"
              muted
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-xs text-gray-400">No Preview</div>';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
        );
      default:
        return (
          <div className="w-14 h-14 rounded-xl bg-navbarBg flex items-center justify-center shrink-0">
            <div className="flex flex-col gap-1">
              <div className="w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="w-1 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        );
    }
  };

  const isAssigned = (item.assignedTo ?? []).length > 0;

  const handleDelete = async () => {
    try {
      let res;
      if (item.type === "folder") {
        res = await folderDelete(item.id as any).unwrap();
      } else {
        res = await fileDelete({ id: item.id }).unwrap();
      }

      if (res?.success) {
        toast.success(res.message || "Deleted successfully.");
        router.refresh();
        onMenuClick?.(item.id, "delete");
      } else {
        // If API returns a non-successful payload
        toast.error(res?.message || "Failed to delete. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to delete:", err);
      const msg = err?.data?.message || err?.message || "Failed to delete. Please try again.";
      toast.error(msg);
    }
  };

  // Get dropdown options based on content type
  const getDropdownOptions = () => {
    // Folder: only Rename and Delete
    if (item.type === "folder") {
      return [
        { label: "Rename", value: "rename", icon: <Pencil className="w-5 h-5" />, onClick: () => setOpenRename(true) },
        { label: "Delete", value: "delete", icon: <Trash2 className="w-5 h-5 text-red-500" />, danger: true, onClick: () => setOpenDeleteDialog(true) },
      ];
    }

    // Audio/Playlist: Rename, Move to Folder, Delete, View Details
    if (item.type === "playlist") {
      return [
        { label: "Rename", value: "rename", icon: <Pencil className="w-5 h-5" />, onClick: () => setOpenRename(true) },
        { label: "Move to Folder", value: "move", icon: <Folder className="w-5 h-5 text-headings" />, onClick: () => onMenuClick?.(item.id, "move") },
        { label: "Delete", value: "delete", icon: <Trash2 className="w-5 h-5 text-red-500" />, danger: true, onClick: () => setOpenDeleteDialog(true) },
        { label: "View Details", value: "view", icon: <Eye className="w-5 h-5 text-headings" />, onClick: () => router.push(`/content/${item.id}`) },
      ];
    }

    // Video/Image: Full options - Assign to Program, Schedule, Rename, Move to Folder, Delete, View Details
    return [
      { label: "Assign to Program", value: "assign", icon: <ScreenShare className="w-5 h-5 text-headings" />, onClick: () => { setOpenAssign(true); onAssignClick?.(item.id); } },
      { label: "Schedule", value: "schedule", icon: <CalendarClock className="w-5 h-5 text-headings" />, onClick: () => onMenuClick?.(item.id, "schedule") },
      { label: "Rename", value: "rename", icon: <Pencil className="w-5 h-5" />, onClick: () => setOpenRename(true) },
      { label: "Move to Folder", value: "move", icon: <Folder className="w-5 h-5 text-headings" />, onClick: () => onMenuClick?.(item.id, "move") },
      { label: "Delete", value: "delete", icon: <Trash2 className="w-5 h-5 text-red-500" />, danger: true, onClick: () => setOpenDeleteDialog(true) },
      { label: "View Details", value: "view", icon: <Eye className="w-5 h-5 text-headings" />, onClick: () => router.push(`/content/${item.id}`) },
    ];
  };

  const dropdownOptions = getDropdownOptions();

  const handleRename = (newName: string) => {
    console.log(`Renaming item ${item.id} to ${newName}`);
    onMenuClick?.(item.id, `rename:${newName}`);
  };

  return (
    <>
      {open && <VideoPlayDialog item={item} open={open} setOpen={setOpen} />}
      {openImage && <ImageViewDialog item={item} open={openImage} setOpen={setOpenImage} />}
      {openAudio && <AudioPlayerDialog item={item} open={openAudio} setOpen={setOpenAudio} />}
      {openFolder && <FolderOpenDialog item={item} openFolder={openFolder} setOpenFolder={setOpenFolder} folders={[]} />}
      {openRename && (
        <RenameDialog
          open={openRename}
          setOpen={setOpenRename}
          itemName={item.title}
          itemType={item.type}
          onRename={handleRename}
        />
      )}

      {openAssign && (
        <AssignToDialog
          open={openAssign}
          setOpen={setOpenAssign}
          contentId={item.id}
          onAssign={(selectedIds) => {
            console.log("Assigned to programs:", selectedIds);
            // The mutation inside AssignToDialog invalidates "Content" tag, 
            // which should trigger a refresh of the content data.
          }}
        />
      )}

      <DeleteConfirmationModal
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          await handleDelete();
          setOpenDeleteDialog(false);
        }}
        title={`Delete ${getTypeLabel()}`}
        description={`Are you sure you want to delete this ${getTypeLabel().toLowerCase()}? This action cannot be undone.`}
        itemName={item.title}
      />

      {viewMode === "list" ? (
        <>
          <div className="bg-navbarBg w-full border-b last:border-b-0 border-border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div className="flex flex-col md:flex-row justify-between w-full p-4 items-center gap-4 md:gap-0">
              <div className="flex items-center gap-4 w-full md:w-[30%]">
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox
                    onCheckedChange={() => onSelect?.(item.id)}
                    className="w-5 h-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  {item.type === "folder" && (
                    <ChevronRight
                      className={`w-5 h-5 text-textGray dark:text-gray-400 cursor-pointer transition-transform ${expanded ? "rotate-90" : ""}`}
                      onClick={() => setExpanded(!expanded)}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getThumbnailIcon()}
                  <div className="flex-1 min-w-0">
                    <Link href={`/content/${item.id}`}>
                      <h3 className="font-semibold text-Heading dark:text-white text-sm md:text-base lg:text-lg truncate hover:text-bgBlue hover:underline">
                        {item.title}
                      </h3>
                      {/* <h3 className="font-semibold text-Heading dark:text-white text-sm md:text-base lg:text-lg truncate hover:text-bgBlue hover:underline">
                        {item.title}{getFileExtension()}
                      </h3> */}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-textGray dark:text-gray-400 font-medium">{item.size}</span>
                      {item.duration && <span className="text-xs text-textGray dark:text-gray-400 font-medium">• {item.duration}</span>}
                      {item.fileCount && <span className="text-xs text-textGray dark:text-gray-400 font-medium">• {item.fileCount} Files</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Type Column */}
              <div className="hidden md:flex justify-start md:w-[15%]">
                <span className="text-textGray dark:text-gray-300 px-3 py-1 border border-borderGray dark:border-gray-600 bg-bgGray dark:bg-gray-800 rounded-xl text-xs font-semibold uppercase tracking-wider">
                  {item.fileExtension || getTypeLabel()}
                </span>
              </div>

              {/* Mobile and Desktop columns with labels for mobile */}
              <div className="flex flex-col md:flex-row md:items-center w-full md:w-[45%] gap-2 md:gap-0">
                <div className="flex justify-between items-center md:justify-start md:w-[55%]">
                  <span className="text-xs font-bold text-textGray uppercase md:hidden">Assigned To:</span>
                  <p className="text-sm text-textGray dark:text-gray-400 font-medium truncate">
                    {isAssigned ? item.assignedTo?.join(", ") : "—"}
                  </p>
                </div>

                <div className="flex justify-between items-center md:justify-start md:w-[45%]">
                  <span className="text-xs font-bold text-textGray uppercase md:hidden">Uploaded:</span>
                  <p className="text-sm text-textGray dark:text-gray-400 font-medium whitespace-nowrap">
                    {item.uploadedDate || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-[10%] justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                <span className="text-xs font-bold text-textGray uppercase md:hidden">Actions:</span>
                <div className="flex items-center gap-3">
                  {/* File-type specific action buttons */}
                  {item.type === "video" && (
                    <button
                      onClick={() => setOpen(true)}
                      className="px-6 py-2 bg-bgBlue hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-customShadow transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4" /> Play
                    </button>
                  )}
                  {item.type === "playlist" && (
                    <button
                      onClick={() => setOpenAudio(true)}
                      className="px-6 py-2 bg-bgBlue hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-customShadow transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4" /> Play
                    </button>
                  )}
                  {item.type === "folder" && (
                    <button
                      onClick={() => router.push(`/content/${item.id}`)}
                      className="px-6 py-2 bg-bgBlue hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-customShadow transition-all cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" /> Open
                    </button>
                  )}
                  {item.type === "image" && (
                    <button
                      onClick={() => setOpenImage(true)}
                      className="px-6 py-2 bg-bgBlue hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 shadow-customShadow transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  )}
                  <MenuDropdown triggerIcon={<MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer" />} options={dropdownOptions} />
                </div>
              </div>
            </div>
          </div>

          {expanded && item.children?.length ? (
            <div className="border-l ml-6 md:ml-12 border-border">
              {item.children.map((child) => (
                <MyContentCard
                  key={child.id}
                  item={child}
                  viewMode="list"
                  onSelect={onSelect}
                  onMenuClick={onMenuClick}
                  onAssignClick={onAssignClick}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="bg-navbarBg border border-border rounded-xl overflow-hidden hover:shadow-md dark:hover:shadow-xl transition-shadow">
          <div className="relative bg-[#F0FAFF] dark:bg-gray-800 h-48 flex items-center justify-center">
            <div className="absolute top-3 left-3">
              <Checkbox
                onCheckedChange={() => onSelect?.(item.id)}
                className="w-5 h-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>

            {item.thumbnail ? (
              <div className="relative w-full h-full cursor-pointer" onClick={() => item.type === "image" && setOpenImage(true)}>
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover"
                  onError={(e: any) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-sm text-gray-400">Broken Link</div>';
                  }}
                />
              </div>
            ) : item.type === "video" ? (
              <div
                className="relative w-full h-full bg-black cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setOpen(true); }}
              >
                <video
                  src={item.video}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                  onError={(e: any) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.innerHTML = '<div class="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-sm text-gray-400">Preview Unavailable</div>';
                  }}
                />
              </div>
            ) : item.type === "folder" ? (
              <Image className="cursor-pointer" onClick={() => router.push(`/content/${item.id}`)} src={folder} alt="folder" />
            ) : (
              <div className="relative flex flex-col items-center gap-3">
                <AudioLines className="w-20 h-20 text-bgBlue stroke-[1.5]" />
                <button className="absolute bg-white/90 dark:bg-gray-900/90 rounded-full p-2.5 mt-4 hover:bg-white dark:hover:bg-gray-900 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); setOpenAudio(true); }}>
                  <Play className="w-8 h-8 text-gray-400 dark:text-gray-300 fill-[rgba(255,255,255,0.7)]" />
                </button>
              </div>
            )}

            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); setOpen(true); }}
                  className="bg-white/90 dark:bg-gray-900/90 rounded-full p-2.5 hover:bg-white dark:hover:bg-gray-900 transition-colors cursor-pointer pointer-events-auto"
                >
                  <Play className="w-8 h-8 fill-[rgba(255,255,255,0.7)]" />
                </button>
              </div>
            )}

          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2 gap-2">
              <Link href={`/content/${item.id}`} className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white hover:text-bgBlue hover:underline truncate">
                  {item.title}
                </h3>
              </Link>
              <MenuDropdown triggerIcon={<MoreVertical className="w-6 h-6 text-muted" />} options={dropdownOptions} />
            </div>

            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 mb-3 gap-2">
              <span className="text-textGray dark:text-gray-300 px-3 py-1 border border-borderGray dark:border-gray-600 bg-bgGray dark:bg-gray-800 rounded-xl text-xs font-medium">
                {getTypeLabel()}
              </span>
              {item.size && <span>• {item.size}</span>}
              {/* {item.duration && <span>• {item.duration} sec</span>} */}
              {item.fileCount && <span>• {item.fileCount} Files</span>}
            </div>

            {isAssigned && (
              <div className="pt-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Assigned To</p>
                <p className="text-sm text-textGray dark:text-gray-400">{item.assignedTo?.join(", ")}</p>
              </div>
            )}

            {item.uploadedDate && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-textGray dark:text-gray-400">
                  <CalendarClock className="w-3.5 h-3.5" />
                  <span>{item.type === "folder" ? "Created" : "Uploaded"} {item.uploadedDate}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MyContentCard;