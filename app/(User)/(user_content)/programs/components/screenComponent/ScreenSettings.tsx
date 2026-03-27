/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useState, useEffect } from "react";
import { Trash2, Loader2, Plus, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";

import { Program, Device } from "@/redux/api/users/programs/programs.type";
import { useDeleteProgramMutation } from "@/redux/api/users/programs/programs.api";

interface ScreenSettingsProps {
    program: Program;
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (desc: string) => void;
    localDevices: Device[];
    setLocalDevices: React.Dispatch<React.SetStateAction<Device[]>>;
    openAddDevice: () => void;
}

const ScreenSettings: FC<ScreenSettingsProps> = ({
    program,
    name,
    setName,
    description: desc,
    setDescription: setDesc,
    localDevices,
    setLocalDevices,
    openAddDevice,
}) => {
    const router = useRouter();
    const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const handleRemoveDevice = (id: string) => {
        setLocalDevices(localDevices.filter((device) => device.id !== id));
    };

    // const handleRemoveDevice = (id: string) => {
    //     setConnectedDevices(connectedDevices.filter((device) => device.id !== id));
    // };

    const handleDeleteProgram = async () => {
        try {
            const res = await deleteProgram({ id: program.id }).unwrap();
            toast.success(res.message || "Program deleted successfully");
            router.push("/programs");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete program");
        }
    };

    return (
        <div className="mx-auto min-h-screen">
            <div className="bg-navbarBg rounded-xl border border-border p-4 sm:p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-headings dark:text-white mb-1">Program Settings</h2>
                    <p className="text-sm sm:text-base text-muted">
                        Manage device configuration and connected screens
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-headings dark:text-white mb-2">Program Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Main Lobby Display"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base text-gray-900 bg-[#F9FAFB] placeholder:text-muted"
                    />
                </div>

                {/* Description */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-headings dark:text-white mb-2">Description</label>
                    <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Display for meeting room presentations and schedules"
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm sm:text-base text-gray-900 resize-none placeholder:text-muted bg-[#F9FAFB]"
                    />
                </div>

                {/* Connected Devices */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-headings dark:text-white mb-4">Connected Devices</label>

                    <div className="space-y-3 mb-4">
                        {localDevices.map((device) => (
                            <div
                                key={device.id}
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-border rounded-xl shadow-sm"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="font-bold text-sm sm:text-base text-headings dark:text-white">{device.name}</span>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${device.status === "ONLINE"
                                            ? "bg-green-50 text-green-600 border border-green-200"
                                            : "bg-red-50 text-red-600 border border-red-200"
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${device.status === "ONLINE" ? "bg-green-500" : "bg-red-500"}`}></span>
                                            {device.status === "ONLINE" ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted uppercase tracking-wider">{device.location || "No location"}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveDevice(device.id)}
                                    className="p-2 border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm cursor-pointer"
                                >
                                    <Trash2 className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={openAddDevice}
                        className="w-full py-3.5 border border-bgBlue text-bgBlue hover:bg-blue-50 transition-all rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Devices
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="mt-10 p-4 sm:p-6 rounded-2xl bg-red-50 border border-red-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-sm sm:text-base text-[#B91C1C] font-medium max-w-md">
                        These actions cannot be undone. Please proceed with caution.
                    </p>
                    <button
                        onClick={() => setOpenDeleteDialog(true)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-xl text-sm sm:text-base font-bold transition-all cursor-pointer shadow-sm disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Trash2 className="w-5 h-5" />
                        )}
                        Delete Screen
                    </button>
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteProgram}
                title="Delete Program"
                description="Are you sure you want to delete this program? This action cannot be undone."
                itemName={program.name}
            />
        </div>
    );
};

export default ScreenSettings;
