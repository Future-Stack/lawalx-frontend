/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useMemo, useState, useEffect } from "react";
import ContentDetails from "@/components/content/ContentDetails";
import { useGetAllContentDataQuery, useGetSingleContentFolderDataQuery } from "@/redux/api/users/content/content.api";
import CommonLoader from "@/common/CommonLoader";
import { transformFile, transformFolder, findContentById } from "@/lib/content-utils";
import { ContentItem } from "@/types/content";

interface ContentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ContentDetailsPage = ({ params }: ContentDetailsPageProps) => {
  const { id } = use(params);
  const [isMounted, setIsMounted] = useState(false);

  // Still fetch all to find the folder/file metadata (title, etc)
  const { data: allContentData, isLoading: isAllLoading } = useGetAllContentDataQuery();

  // Also fetch specific folder content if it's a folder
  const { data: folderContentData, isLoading: isFolderLoading } = useGetSingleContentFolderDataQuery(id);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const content = useMemo(() => {
    if (!isMounted) return null;

    // 1. First, find if this ID exists in the "all content" list (to get metadata)
    let foundItem: ContentItem | null = null;
    if (allContentData?.data) {
      const folders = allContentData.data.folders.map((f: any) => transformFolder(f, isMounted));
      const rootFiles = allContentData.data.rootFiles.map((f: any) => transformFile(f, isMounted));
      foundItem = findContentById([...folders, ...rootFiles], id);
    }

    // 2. If it's a folder and we have specific folder content, update its children
    if (foundItem && foundItem.type === "folder" && folderContentData?.data) {
      // folderContentData.data is now array of FileItemSingle based on content.type.ts
      const subfiles = Array.isArray(folderContentData.data)
        ? folderContentData.data.map((f: any) => transformFile(f, isMounted))
        : [];

      foundItem = {
        ...foundItem,
        children: subfiles
      };
    }

    // 3. If we didn't find it in "all content", check if it's the folder we just fetched
    // (In case it's a deeply nested folder not visible in "all content")
    if (!foundItem && folderContentData?.data) {
    }

    return foundItem;
  }, [allContentData, folderContentData, id, isMounted]);

  if ((isAllLoading || isFolderLoading) && !content) return <CommonLoader />;

  if (!content) {
    return (
      <div className="min-h-screen bg-White flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Not Found</h1>
          <p className="text-gray-600">The requested content could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ContentDetails content={content} />
    </div>
  );
};

export default ContentDetailsPage;
