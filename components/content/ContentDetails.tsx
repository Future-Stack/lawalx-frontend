/* eslint-disable @typescript-eslint/no-explicit-any */
// components/content/ContentDetails.tsx
"use client";

import {
  ArrowLeft,
  Trash2,
  PencilLine,
  Search,
  Grid2X2,
  List,
  ChevronDown,
  Plus,
  CloudUpload,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BaseSelect from "@/common/BaseSelect";
import ContentGrid from "./ContentGrid";
import RenameDialog from "./RenameDialog";
import AssignToDialog from "./AssignToDialog";
import AddExistingContentDialog from "./AddExistingContentDialog";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";
import FilePreview from "./FilePreview";
import FileOverview from "./FileOverview";
import CommonLoader from "@/common/CommonLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ContentItem } from "@/types/content";
import { sortByName, allContent } from "./MyContent";
import {
  useUploadFileMutation,
  useGetSingleContentFolderDataQuery,
  useUpdateFolderNameMutation,
  useUpdateFileNameMutation,
  useDeleteFileMutation,
  useDeleteFolderMutation,
} from "@/redux/api/users/content/content.api";
import { transformFile, transformFolder } from "@/lib/content-utils";

const getUploadErrorMessage = (error: any) => {
  if (typeof error?.data?.message === "string") return error.data.message;
  if (Array.isArray(error?.data?.message)) return error.data.message.join(", ");
  if (typeof error?.message === "string") return error.message;
  if (typeof error?.error === "string") return error.error;
  return "Upload failed. Please try again.";
};

interface ContentDetailsProps {
  content: ContentItem;
}

const ContentDetails = ({ content: initialContent }: ContentDetailsProps) => {
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [updateFolderName] = useUpdateFolderNameMutation();
  const [updateFileName] = useUpdateFileNameMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [contentFilter, setContentFilter] = useState("all-content");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [openRename, setOpenRename] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openAddExisting, setOpenAddExisting] = useState(false);
  const [assignContentId, setAssignContentId] = useState<string>("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFolder = initialContent.type === "folder";

  // Fetch folder contents only if it's a folder
  const { data: folderData } = useGetSingleContentFolderDataQuery(
    initialContent.id,
    {
      skip: !isFolder,
    },
  );

  const content = useMemo(() => {
    if (!isFolder) return initialContent;
    if (folderData?.data && isMounted) {
      return {
        ...initialContent,
        children: Array.isArray(folderData.data)
          ? folderData.data.map((f: any) =>
              f.type === "FOLDER"
                ? transformFolder(f, isMounted)
                : transformFile(f, isMounted),
            )
          : [],
      };
    }
    return initialContent;
  }, [initialContent, folderData, isFolder, isMounted]);

  // Filter children if it's a folder
  const filteredChildren = (content.children || [])
    .filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      let matchesType = true;

      if (contentFilter === "folders") matchesType = item.type === "folder";
      else if (contentFilter === "playlists")
        matchesType = item.type === "playlist";
      else if (contentFilter === "files")
        matchesType = item.type === "video" || item.type === "image";

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOption === "a-z") return a.title.localeCompare(b.title);
      if (sortOption === "z-a") return b.title.localeCompare(a.title);
      return 0;
    });

  const getFileTypeDisplay = () => {
    switch (content.type) {
      case "video":
        return "Video (.MP4)";
      case "image":
        return "Image (.PNG/.JPG)";
      case "playlist":
        return "Audio Playlist";
      case "folder":
        return "Folder";
      default:
        return "File";
    }
  };

  // UPLOAD HANDLER
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (isUploading) return; // prevent opening picker while uploading
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Build FormData
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    // If we are inside a folder, tell backend to attach files to that parent
    if (isFolder && content.id) {
      formData.append("folderId", content.id);
    }

    try {
      const res = await uploadFile({ formData, folderId: content.id }).unwrap();
      // console.log(res);

      toast.success(res?.message || "File(s) uploaded successfully");
      // reset file input so same file can be re-selected later
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(getUploadErrorMessage(err));
    }
  };

  const handleRename = async (newName: string) => {
    if (!content.id) return;
    try {
      const mutation =
        content.type === "folder" ? updateFolderName : updateFileName;
      const res = await mutation({ id: content.id, name: newName }).unwrap();
      toast.success(res?.message || "Renamed successfully");
    } catch (err: any) {
      console.error("Rename failed:", err);
      toast.error(err?.data?.message || "Rename failed. Please try again.");
    }
  };

  const handleDeleteFolder = async () => {
    if (!content.id) return;
    try {
      const mutation = isFolder ? deleteFolder : deleteFile;
      const res = await mutation(content.id as any).unwrap();
      if (res?.success) {
        toast.success(res.message || "Deleted successfully");
        router.push("/content");
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (err: any) {
      console.error("Delete failed:", err);
      toast.error(err?.data?.message || "Failed to delete. Please try again.");
    }
  };

  return (
    <div className="">
      {/* Hidden file input for Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {openRename && (
        <RenameDialog
          open={openRename}
          setOpen={setOpenRename}
          itemName={content.title}
          itemType={content.type}
          onRename={handleRename}
        />
      )}

      {openAssign && (
        <AssignToDialog
          open={openAssign}
          setOpen={setOpenAssign}
          contentId={assignContentId || content.id}
          onAssign={(ids) => console.log("Assigned to programs:", ids)}
        />
      )}

      {openAddExisting && (
        <AddExistingContentDialog
          open={openAddExisting}
          setOpen={setOpenAddExisting}
          targetFolderId={content.id}
        />
      )}

      <DeleteConfirmationModal
        isOpen={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          await handleDeleteFolder();
          setOpenDeleteDialog(false);
        }}
        title={`Delete ${isFolder ? "Folder" : "File"}`}
        description={`Are you sure you want to delete this ${isFolder ? "folder" : "file"}? This action cannot be undone.`}
        itemName={content.title}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 md:gap-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/content")}
            className="p-2 border border-border hover:border-bgBlue rounded-lg shadow-customShadow transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-headings" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-headings leading-tight">
              {content.title}
            </h1>
            <p className="text-sm font-medium text-textGray uppercase tracking-wide">
              {content.type}
            </p>
          </div>
        </div>

        {isFolder && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setOpenRename(true)}
              className="group flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 border border-[#3CA9F3] text-[#3CA9F3] rounded-lg text-sm sm:text-base font-semibold transition-all hover:bg-[#3CA9F3] hover:text-white shadow-customShadow bg-White cursor-pointer outline-none flex-1 sm:flex-initial"
            >
              <PencilLine className="w-5 h-5 transition-colors group-hover:text-white text-bgBlue" />{" "}
              Rename
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 border border-border text-headings rounded-lg text-sm sm:text-base font-semibold transition-all hover:bg-bgBlue hover:text-white shadow-customShadow bg-White cursor-pointer outline-none active:scale-95 flex-1 sm:flex-initial">
                  <Plus className="w-5 h-5 text-bgBlue group-hover:text-white transition-colors" />{" "}
                  Add{" "}
                  <ChevronDown className="w-4 h-4 ml-1 transition-all group-hover:text-white text-muted" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 bg-White shadow-2xl p-1 z-50 border border-border rounded-xl animate-in fade-in zoom-in-95 duration-200"
              >
                <DropdownMenuItem
                  onClick={() => setOpenAddExisting(true)}
                  className="group flex items-center gap-3 p-2 text-sm font-semibold text-headings hover:bg-bgBlue hover:text-white transition-all cursor-pointer rounded-lg focus:bg-bgBlue focus:text-white outline-none active:scale-95 mb-1"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-bgBlue group-hover:text-white transition-colors" />
                  </div>
                  <span>Add Existing Content</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className={`group flex items-center gap-3 p-2 text-sm font-semibold text-headings transition-all cursor-pointer rounded-lg focus:bg-bgBlue focus:text-white outline-none active:scale-95 ${
                    isUploading
                      ? "opacity-60 pointer-events-none"
                      : "hover:bg-bgBlue hover:text-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-bgBlue group-hover:text-white" />
                    ) : (
                      <CloudUpload className="w-5 h-5 text-bgBlue group-hover:text-white transition-colors" />
                    )}
                  </div>
                  <span>
                    {isUploading ? "Uploading..." : "Upload New Content"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => setOpenDeleteDialog(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 bg-[#F94D4D] text-white rounded-lg text-sm sm:text-base font-semibold transition-all hover:bg-[#e04444] shadow-customShadow cursor-pointer w-full sm:w-auto"
            >
              <Trash2 className="w-5 h-5" /> Remove
            </button>
          </div>
        )}

        {!isFolder && (
          <button
            onClick={() => {
              setAssignContentId(content.id);
              setOpenAssign(true);
            }}
            className="flex items-center gap-2 px-4 py-2 sm:py-3 border border-border rounded-lg text-sm sm:text-base font-medium text-headings cursor-pointer shadow-customShadow hover:text-bgBlue transition-colors"
          >
            <Plus className="w-5 h-5 text-headings hover:text-bgBlue transition-colors" />{" "}
            Assign To
          </button>
        )}
      </div>

      {/* Main Content */}
      {isFolder ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-navbarBg border border-border rounded-xl p-4 w-full">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search Files"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-3 bg-input dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              {/* Sorting & Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="w-full sm:w-[155px]">
                  <BaseSelect
                    value={sortOption}
                    onChange={setSortOption}
                    options={sortByName}
                    placeholder="Sort by name"
                    showLabel={false}
                  />
                </div>

                <div className="w-full sm:w-[155px]">
                  <BaseSelect
                    value={contentFilter}
                    onChange={setContentFilter}
                    options={allContent}
                    placeholder="All Content"
                    icon={<Plus size={18} />}
                    showLabel={false}
                  />
                </div>

                {/* GRID / LIST */}
                <div className="w-full sm:w-[100px] flex gap-2 items-center bg-bgGray dark:bg-gray-800 p-1.5 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`flex-1 flex items-center justify-center p-2 rounded-md transition shadow-customShadow cursor-pointer ${viewMode === "grid" ? "bg-White dark:bg-gray-700" : ""}`}
                  >
                    <Grid2X2
                      className={`w-5 h-5 ${viewMode === "grid" ? "text-bgBlue" : "text-textGray dark:text-gray-400"}`}
                    />
                  </button>

                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex-1 flex items-center justify-center p-2 rounded-md transition shadow-customShadow cursor-pointer ${viewMode === "list" ? "bg-White dark:bg-gray-700" : ""}`}
                  >
                    <List
                      className={`w-5 h-5 ${viewMode === "list" ? "text-bgBlue" : "text-textGray dark:text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Folder Contents */}
          <div
            className={
              viewMode === "list"
                ? "bg-navbarBg rounded-xl border border-border overflow-hidden"
                : ""
            }
          >
            {viewMode === "list" && (
              <div className="hidden md:flex items-center justify-between px-4 py-4 border-b border-border bg-[#F9FAFB] dark:bg-gray-800/50 md:gap-12">
                <div className="w-[30%] text-xs font-bold text-textGray uppercase tracking-widest">
                  File Name
                </div>
                <div className="w-[15%] text-xs font-bold text-textGray uppercase tracking-widest">
                  File Type
                </div>
                <div className="w-[25%] text-xs font-bold text-textGray uppercase tracking-widest">
                  Assigned To
                </div>
                <div className="w-[20%] text-xs font-bold text-textGray uppercase tracking-widest">
                  Uploaded
                </div>
                <div className="w-[10%] text-xs font-bold text-textGray uppercase tracking-widest text-right">
                  Actions
                </div>
              </div>
            )}
            <ContentGrid
              items={
                filteredChildren.map((child) => ({
                  ...child,
                  size: child.size || "",
                })) as any
              }
              viewMode={viewMode}
              onItemSelect={(id: string) => router.push(`/content/${id}`)}
              onItemMenuClick={(id: string, action: string) => {
                if (action.startsWith("rename:")) {
                  const newName = action.split(":")[1];
                  if (newName) {
                    const child = filteredChildren.find((c) => c.id === id);
                    const mutation =
                      child?.type === "folder"
                        ? updateFolderName
                        : updateFileName;
                    mutation({ id, name: newName })
                      .unwrap()
                      .then((res: any) =>
                        toast.success(res?.message || "Renamed successfully"),
                      )
                      .catch((err: any) => {
                        console.error("Rename failed:", err);
                        toast.error(err?.data?.message || "Rename failed");
                      });
                  }
                } else {
                  console.log("Menu:", id, action);
                }
              }}
              onAssignClick={(id: string) => {
                setAssignContentId(id);
                setOpenAssign(true);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FilePreview content={content} />
          <FileOverview content={content} fileTypeDisplay={getFileTypeDisplay()} />
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-gray-200 dark:border-gray-700">
            <CommonLoader size={56} text="Uploading files..." />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">Please do not close this page</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDetails;
