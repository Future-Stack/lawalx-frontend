"use client";

import { useState } from "react";
import {
    ChevronDown,
    ScreenShareIcon,
    FilePlus,
    CalendarPlus,
    FolderPlus,
    Loader2,
} from "lucide-react";

interface NavbarNewDropdownProps {
    onAddDevice: () => void;
    onUploadContent: () => void;
    onSchedule: () => void;
    onNewFolder: () => void;
    isUploading: boolean;
}

export default function NavbarNewDropdown({
    onAddDevice,
    onUploadContent,
    onSchedule,
    onNewFolder,
    isUploading,
}: NavbarNewDropdownProps) {
    const [newOpen, setNewOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setNewOpen(!newOpen)}
                className="px-3 lg:px-4 py-2 shadow-customShadow bg-bgBlue text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-1.5 text-sm font-medium cursor-pointer"
            >
                {isUploading ? (
                    <div className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                    </div>
                ) : (
                    <>
                        <span>New</span>
                        <ChevronDown className="sm:pl-1 sm:border-l border-l-0 border-gray-300 w-4 h-4 hidden lg:inline" />
                    </>
                )}
            </button>

            {newOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setNewOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden z-40 p-2">
                        <button
                            onClick={() => {
                                setNewOpen(false);
                                onAddDevice();
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                        >
                            <ScreenShareIcon className="w-4 h-4 inline-block mr-2 text-gray-500" />
                            Add Device
                        </button>
                        <button
                            onClick={() => {
                                setNewOpen(false);
                                onUploadContent();
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                        >
                            <FilePlus className="w-4 h-4 inline-block mr-2 text-gray-500" />
                            Upload Content
                        </button>
                        <button
                            onClick={() => {
                                setNewOpen(false);
                                onSchedule();
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
                        >
                            <CalendarPlus className="w-4 h-4 inline-block mr-2 text-gray-500" />
                            Schedule
                        </button>
                        <button
                            onClick={() => {
                                setNewOpen(false);
                                onNewFolder();
                            }}
                            className="block w-full text-left px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                            <FolderPlus className="w-4 h-4 inline-block mr-2 text-gray-500" />
                            New Folder
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
