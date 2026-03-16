/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  CloudUpload,
  Grid2X2,
  List,
  Plus,
  Search,
  FolderPlus,
  ListMusic,
  Folder,
} from "lucide-react";
import { toast } from "sonner";

import DashboardHeading from "@/common/DashboardHeading";
import BaseSelect from "@/common/BaseSelect";
import ContentGrid from "./ContentGrid";
import EmptyState from "./EmptyState";
import CreateFolderDialog from "./CreateFolderDialog";
import FolderOpenDialog from "./FolderOepnDialog";
import { useGetAllContentDataQuery, useUploadFileMutation, useUpdateFolderNameMutation, useUpdateFileNameMutation } from "@/redux/api/users/content/content.api";
import CommonLoader from "@/common/CommonLoader";
import { ContentItem, SelectOption } from "@/types/content";
import { transformFile, transformFolder } from "@/lib/content-utils";

export const createNew: SelectOption[] = [
  { label: "New Folder", value: "new-folder", icon: <FolderPlus size={22} /> },
  { label: "New Playlist", value: "new-playlist", icon: <ListMusic size={22} /> },
];

export const sortByName: SelectOption[] = [
  { label: "A-Z", value: "a-z" },
  { label: "Z-A", value: "z-a" },
];

export const allContent: SelectOption[] = [
  { label: "All Content", value: "all-content" },
  { label: "Folders", value: "folders" },
  { label: "Playlists", value: "playlists" },
  { label: "Files", value: "files" },
];

const MyContent = () => {
  const [uploadFile, { isLoading }] = useUploadFileMutation();
  const [updateFolderName] = useUpdateFolderNameMutation();
  const [updateFileName] = useUpdateFileNameMutation();
  const { data: allContentData, isLoading: isAllContentLoading } = useGetAllContentDataQuery(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [contentFilter, setContentFilter] = useState("all-content");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  console.log("all content data", allContentData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // TRANSFORMATION
  const contentItems: ContentItem[] = useMemo(() => {
    if (!allContentData?.data) return [];
    const folders = allContentData.data.folders.map((f: any) => transformFolder(f, isMounted));
    const rootFiles = allContentData.data.rootFiles.map((f: any) => transformFile(f, isMounted));
    return [...folders, ...rootFiles];
  }, [allContentData, isMounted]);

  // FILTER + SORT
  const filteredContent = useMemo(() => {
    return contentItems
      .filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesType = true;

        if (contentFilter === "folders") matchesType = item.type === "folder";
        else if (contentFilter === "playlists") matchesType = item.type === "playlist";
        else if (contentFilter === "files")
          matchesType = item.type === "video" || item.type === "image";

        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortOption === "a-z") return a.title.localeCompare(b.title);
        if (sortOption === "z-a") return b.title.localeCompare(a.title);
        return 0;
      });
  }, [contentItems, searchQuery, contentFilter, sortOption]);

  // HANDLERS
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [openMoveFolder, setOpenMoveFolder] = useState(false);

  const handleItemSelect = (id: string) => console.log("Selected:", id);
  // onItemMenuClick now receives (id, action)
  const handleItemMenuClick = (id: string, action?: string) => {
    console.log("Menu clicked:", id, action);
    if (action === "move") {
      const found = filteredContent.find((c) => c.id === id) || contentItems.flatMap(i => i.children ?? []).find(c => c.id === id);
      if (found) {
        setSelectedItem(found);
        setOpenMoveFolder(true);
      } else {
        // fallback: create a minimal item
        setSelectedItem({ id, title: "", type: "image", size: "" });
        setOpenMoveFolder(true);
      }
    } else if (action?.startsWith("rename:")) {
      const newName = action.split(":")[1];
      if (newName) {
        const item = filteredContent.find((c) => c.id === id) || contentItems.flatMap(i => i.children ?? []).find(c => c.id === id);
        const mutation = item?.type === "folder" ? updateFolderName : updateFileName;

        mutation({ id, name: newName })
          .unwrap()
          .then((res: any) => toast.success(res?.message || "Renamed successfully"))
          .catch((err: any) => {
            console.error("Rename failed:", err);
            toast.error(err?.data?.message || "Rename failed");
          });
      }
    }
  };

  const handleAssignClick = (id: string) => console.log("Assign:", id);

  // UPLOAD HANDLER
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Build FormData
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("file", files[i]);
    }

    try {
      const res = await uploadFile(formData).unwrap();
      // console.log(res);

      toast.success(res?.message || "File(s) uploaded successfully");
      // reset file input so same file can be re-selected later
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err?.data?.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hidden File Input for Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple // Allow selecting multiple files
      />

      {/* Header */}
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 mb-6">
        <div>
          <DashboardHeading title="My Content" />
          <p className="text-sm text-textGray mt-1">Upload, create and manage your content</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          {/* UPLOAD BUTTON */}
          <button
            onClick={handleUploadClick}
            className="bg-bgBlue hover:bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg flex items-center justify-center gap-2 text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out shadow-customShadow min-w-40"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <CommonLoader size={24} color="text-white" text="Uploading..." className="m-0" />
            ) : (
              <>
                <CloudUpload className="w-5 h-5" />
                <span className="truncate">Upload Content</span>
              </>
            )}
          </button>

          <button
            onClick={() => setOpen(true)}
            className="border border-bgBlue text-bgBlue px-4 py-2 md:px-6 md:py-3 rounded-lg flex items-center gap-2 text-sm md:text-base font-semibold cursor-pointer hover:bg-bgBlue hover:text-white transition-all duration-300 ease-in-out shadow-customShadow"
          >
            <Folder className="w-5 h-5" /> Create Folder
          </button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-navbarBg border border-border rounded-xl p-4 w-full">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search Device"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-3 bg-input dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-slate-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Sorting & Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-[170px]">
              <BaseSelect
                value={sortOption}
                onChange={setSortOption}
                options={sortByName}
                placeholder="Sort by name"
                showLabel={false}
              />
            </div>

            <div className="w-full sm:w-[170px]">
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
            <div className="w-[100px] flex gap-2 items-center bg-bgGray dark:bg-gray-800 p-1.5 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 flex items-center justify-center p-2 rounded-md transition shadow-customShadow cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-gray-700" : ""}`}
              >
                <Grid2X2
                  className={`w-5 h-5 ${viewMode === "grid" ? "text-bgBlue" : "text-textGray dark:text-gray-400"}`}
                />
              </button>

              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 flex items-center justify-center p-2 rounded-md transition shadow-customShadow cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-gray-700" : ""}`}
              >
                <List
                  className={`w-5 h-5 ${viewMode === "list" ? "text-bgBlue" : "text-textGray dark:text-gray-400"}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Count */}
      <h2 className="text-lg md:text-2xl font-semibold text-Heading dark:text-white">
        All Content ({filteredContent.length})
      </h2>

      {/* CONTENT GRID */}
      {isAllContentLoading ? (
        <div className="flex justify-center items-center h-64">
          <CommonLoader size={48} text="Loading content..." />
        </div>
      ) : filteredContent.length === 0 ? (
        <EmptyState contentFilter={contentFilter} searchQuery={searchQuery} />
      ) : (
        <div className={`flex flex-col ${viewMode === "list" ? "bg-navbarBg rounded-xl border border-border overflow-hidden" : ""} min-h-[600px] md:min-h-[750px]`}>
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-full lg:min-w-0">
              {viewMode === "list" && (
                <div className="hidden md:flex items-center justify-between px-4 py-4 border-b border-border bg-[#F9FAFB] dark:bg-gray-800/50">
                  <div className="w-[30%] text-xs font-bold text-textGray uppercase tracking-widest">File Name</div>
                  <div className="w-[15%] text-xs font-bold text-textGray uppercase tracking-widest">File Type</div>
                  <div className="flex items-center w-[45%]">
                    <div className="w-[55%] text-xs font-bold text-textGray uppercase tracking-widest">Assigned To</div>
                    <div className="w-[45%] text-xs font-bold text-textGray uppercase tracking-widest">Uploaded</div>
                  </div>
                  <div className="w-[10%] text-xs font-bold text-textGray uppercase tracking-widest text-right">Actions</div>
                </div>
              )}
              <ContentGrid
                items={filteredContent}
                viewMode={viewMode}
                onItemSelect={handleItemSelect}
                onItemMenuClick={handleItemMenuClick}
                onAssignClick={handleAssignClick}
              />
            </div>
          </div>
        </div>
      )}

      {open && <CreateFolderDialog open={open} setOpen={setOpen} />}

      {/* Move to Folder dialog - reuse FolderOpenDialog component */}
      {selectedItem && (
        <FolderOpenDialog
          item={selectedItem as any}
          openFolder={openMoveFolder}
          setOpenFolder={setOpenMoveFolder}
          folders={contentItems.filter(i => i.type === "folder").map(f => ({ id: f.id, name: f.title }))}
        />
      )}
    </div>
  );
};

export default MyContent;
