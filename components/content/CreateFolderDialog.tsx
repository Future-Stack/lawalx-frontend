/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCreateFolderMutation } from "@/redux/api/users/content/content.api";

interface CreateFolderDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    parentId?: string;
    onSuccess?: (folder: any) => void;
}

const CreateFolderDialog = ({ open, setOpen }: CreateFolderDialogProps) => {
    const [createFolder, { isLoading }] = useCreateFolderMutation();
    const [folderName, setFolderName] = useState("");

    const handleCancel = () => {
        setOpen(false);
        setFolderName("");
    };

    const handleCreateFolder = async () => {
        const name = folderName.trim();
        if (!name) {
            toast.error("Please enter a folder name");
            return;
        }
        // Close the dialog immediately (optimistic UX) and clear the input
        setOpen(false);
        setFolderName("");
        try {
            const res = await createFolder({ name }).unwrap();
            toast.success(res?.message || "Folder created successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create folder. Please try again.");
            console.error("Error creating folder:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-2xl overflow-hidden border-none bg-navbarBg">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl font-bold text-headings">
                        Create Folder
                    </DialogTitle>
                    <DialogDescription className="text-base text-body mt-1">
                        Create a new folder to organize your content
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-6 border-t border-b border-border">
                    <div className="space-y-2">
                        <Label
                            htmlFor="folder-name"
                            className="text-base font-semibold text-body"
                        >
                            Name
                        </Label>
                        <Input
                            id="folder-name"
                            placeholder="Set Menu"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            className="h-12 border-border rounded-lg text-base px-4 focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-inputFocus"
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 flex flex-row gap-4 sm:justify-between sm:space-x-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 h-12 rounded-lg text-base font-bold text-body border-border shadow-customShadow hover:bg-gray-50 cursor-pointer "
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreateFolder}
                        className="flex-1 h-12 rounded-lg text-base font-bold bg-bgBlue hover:bg-[#0095FF] text-white transition-colors shadow-customShadow cursor-pointer "
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                Creating...
                            </div>
                        ) : (
                            "Create Folder"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateFolderDialog;
