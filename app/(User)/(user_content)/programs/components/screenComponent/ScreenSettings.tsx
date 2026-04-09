/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FC, useState, useEffect } from "react";
import { Trash2, Loader2, Plus, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";

import { Program, Device } from "@/redux/api/users/programs/programs.type";
import { useDeleteProgramMutation } from "@/redux/api/users/programs/programs.api";
import ResolvedLocation from "@/common/ResolvedLocation";
import { cn } from "@/lib/utils";

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
        <div className="mx-auto w-full">
            <div className="bg-navbarBg rounded-xl border border-border p-4 sm:p-6 shadow-sm">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-headings dark:text-white mb-1">Program Settings</h2>
                    <p className="text-sm text-gray-500">
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
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 bg-white placeholder:text-muted"
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
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm text-gray-900 resize-none placeholder:text-muted bg-white"
                    />
                </div>

                {/* Connected Devices */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-headings dark:text-white mb-4">Connected Devices</label>

                    <div className="space-y-3 mb-4">
                        {localDevices.map((device) => (
                            <div
                                key={device.id}
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-border rounded-lg"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-sm text-headings dark:text-white truncate">{device.name}</span>
                                        <span className={cn(
                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                                            device.status === "PAIRED"
                                                ? "bg-green-50 text-green-600 border-green-200"
                                                : "bg-red-50 text-red-600 border-red-200"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", device.status === "PAIRED" ? "bg-green-500" : "bg-red-500")}></span>
                                            {device.status === "PAIRED" ? "Online" : "Offline"}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted uppercase tracking-wider">
                                        {device.location ? (
                                            <ResolvedLocation lat={device.location.lat} lng={device.location.lng} fallback={`${device.location.lat.toFixed(4)}, ${device.location.lng.toFixed(4)}`} />
                                        ) : "No location"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleRemoveDevice(device.id)}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500 transition-colors shadow-customShadow cursor-pointer group"
                                >
                                    <Trash2 className="w-5 h-5 text-red-500 group-hover:text-red-500 transition-colors" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={openAddDevice}
                            className="flex-1 py-2.5 border border-[#89CFF0] text-bgBlue hover:bg-blue-50 transition-all rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-customShadow"
                        >
                            <Plus className="w-4 h-4" />
                            Add Devices
                        </button>
                        {/* <button
                            onClick={openAddDevice} // Trigger same modal for now
                            className="flex-1 py-3.5 bg-bgBlue text-white hover:bg-blue-600 transition-all rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer shadow-customShadow"
                        >
                            <Plus className="w-5 h-5" />
                            Add Existing Device
                        </button> */}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 p-4 sm:p-5 rounded-xl bg-red-50 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm text-[#B91C1C] font-medium max-w-xs leading-snug">
                        These actions cannot be undone. Please proceed with caution.
                    </p>
                    <button
                        onClick={() => setOpenDeleteDialog(true)}
                        disabled={isDeleting}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-lg text-sm font-bold transition-all cursor-pointer shadow-customShadow disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
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
