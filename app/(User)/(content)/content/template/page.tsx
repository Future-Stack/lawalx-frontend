"use client";

import { useMemo, useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import DashboardHeading from "@/common/DashboardHeading";
import TemplateCard from "@/components/content/TemplateCard";
import { useGetAllFilesQuery, useUpdateFileNameMutation } from "@/redux/api/users/content/content.api";
import CommonLoader from "@/common/CommonLoader";
import { transformFile } from "@/lib/content-utils";
import AssignToDialog from "@/components/content/AssignToDialog";

const TemplateContent = () => {
    const [updateFileName] = useUpdateFileNameMutation();
    const { data: allFiles, isLoading } = useGetAllFilesQuery(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [openAssign, setOpenAssign] = useState(false);
    const [assignContentId, setAssignContentId] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const transformedTemplates = useMemo(() => {
        if (!allFiles?.data) return [];
        return allFiles.data
            .filter((file: any) => file.type === "VIDEO" || file.type === "IMAGE")
            .map((file: any) => {
                const transformed = transformFile(file, isMounted);
                return {
                    ...transformed,
                    type: transformed.type as "video" | "image", // Cast to match TemplateItem
                    resolution: "1920 x 1080", // Placeholder for now or extract if available
                };
            });
    }, [allFiles, isMounted]);

    // Filter templates based on search
    const filteredTemplates = useMemo(() => {
        return transformedTemplates.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [transformedTemplates, searchQuery]);

    const handleAssignClick = (id: string) => {
        setAssignContentId(id);
        setOpenAssign(true);
    };

    const handleMenuClick = (id: string, action?: string) => {
        if (action?.startsWith("rename:")) {
            const newName = action.split(":")[1];
            if (newName) {
                updateFileName({ id, name: newName })
                    .unwrap()
                    .then((res: any) => toast.success(res?.message || "Renamed successfully"))
                    .catch((err: any) => {
                        console.error("Rename failed:", err);
                        toast.error(err?.data?.message || "Rename failed");
                    });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <CommonLoader size={48} text="Loading templates..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <DashboardHeading title="My Templates" />
                    <p className="text-sm text-textGray mt-1">Upload, create and manage your content</p>
                </div>

                {/* <button className="bg-bgBlue hover:bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg flex items-center gap-2 text-sm md:text-base font-semibold cursor-pointer transition-all duration-300 ease-in-out w-full sm:w-auto justify-center shadow-customShadow">
                    <Plus className="w-5 h-5" /> Create Content
                </button> */}
            </div>

            {/* Search Bar */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search Device"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-bgBlue focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
            </div>

            {/* Template Grid */}
            {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 bg-navbarBg border border-border rounded-xl">
                    <p className="text-textGray">No templates found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((item) => (
                        <TemplateCard
                            key={item.id}
                            item={item as any}
                            onAssignClick={handleAssignClick}
                            onMenuClick={handleMenuClick}
                        />
                    ))}
                </div>
            )}

            <AssignToDialog
                open={openAssign}
                setOpen={setOpenAssign}
                contentId={assignContentId}
            />
        </div>
    );
};

export default TemplateContent;
