"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, Monitor, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetMyDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { DeviceListResponse, Device } from "@/redux/api/users/devices/devices.type";
import DeviceLocation from "@/components/common/DeviceLocation";
import { useUpdateSingleProgramMutation } from "@/redux/api/users/programs/programs.api";
import { toast } from "sonner";
import BaseDialog from "@/common/BaseDialog";

interface AssignExistingDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    programId: string;
    existingDeviceIds: string[];
}

const AssignExistingDeviceModal: React.FC<AssignExistingDeviceModalProps> = ({
    isOpen,
    onClose,
    programId,
    existingDeviceIds,
}) => {
    const { data: devicesData, isLoading: isLoadingDevices } = useGetMyDevicesDataQuery();
    const [updateProgram, { isLoading: isUpdating }] = useUpdateSingleProgramMutation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedDeviceIds([]);
            setSearchQuery("");
        }
    }, [isOpen]);

    const devices = (devicesData as DeviceListResponse)?.data || [];

    // Filter out devices already assigned to this program
    const availableDevices = useMemo(() => {
        return devices.filter(d => !existingDeviceIds.includes(d.id));
    }, [devices, existingDeviceIds]);

    const filteredDevices = availableDevices.filter((device: Device) =>
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.deviceSerial.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleDevice = (deviceId: string) => {
        setSelectedDeviceIds(prev =>
            prev.includes(deviceId)
                ? prev.filter(id => id !== deviceId)
                : [...prev, deviceId]
        );
    };

    const handleAssign = async () => {
        if (selectedDeviceIds.length === 0) return;

        try {
            const allDeviceIds = [...existingDeviceIds, ...selectedDeviceIds];
            await updateProgram({
                id: programId,
                data: { device_ids: allDeviceIds }
            }).unwrap();

            toast.success(`${selectedDeviceIds.length} device(s) assigned successfully`);
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to assign devices");
        }
    };

    return (
        <BaseDialog
            open={isOpen}
            setOpen={onClose}
            title="Assign Existing Devices"
            description="Select devices to add to this program"
            maxWidth="xl"
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <label className="block text-sm font-semibold text-headings">
                            Select Devices to Add
                        </label>
                        {selectedDeviceIds.length > 0 && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-bgBlue font-semibold bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{selectedDeviceIds.length} selected</span>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <Input
                            type="text"
                            placeholder="Search Device by name or serial"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-input border-borderGray text-headings"
                        />
                    </div>

                    <div className="space-y-2 custom-scrollbar">
                        {isLoadingDevices ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <span>Loading devices...</span>
                            </div>
                        ) : filteredDevices.length === 0 ? (
                            <div className="text-center py-12 text-muted border border-dashed border-border rounded-xl">
                                {searchQuery ? "No devices match your search" : "No available devices found"}
                            </div>
                        ) : (
                            filteredDevices.map((device: Device) => (
                                <div
                                    key={device.id}
                                    onClick={() => toggleDevice(device.id)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group ${selectedDeviceIds.includes(device.id)
                                        ? "border-bgBlue bg-blue-50 dark:bg-blue-950/20"
                                        : "border-borderGray bg-input hover:border-bgBlue"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedDeviceIds.includes(device.id) ? "bg-bgBlue text-white" : "bg-gray-100 dark:bg-gray-800 text-muted"
                                        }`}>
                                        <Monitor className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <Label className="font-bold text-headings cursor-pointer truncate text-sm sm:text-base">
                                                {device.name}
                                            </Label>
                                            {device.status === "ONLINE" && (
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted truncate">
                                            {device.location ? (
                                                <DeviceLocation lat={device.location.lat} lng={device.location.lng} />
                                            ) : "Unknown Location"}
                                        </p>
                                    </div>

                                    {selectedDeviceIds.includes(device.id) ? (
                                        <CheckCircle2 className="w-5 h-5 text-bgBlue" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-borderGray group-hover:border-bgBlue transition-colors" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border shrink-0">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-input bg-gray-50 border border-border rounded-xl hover:bg-gray-100 transition-colors cursor-pointer shadow-customShadow"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={isUpdating || selectedDeviceIds.length === 0}
                        className="flex-1 py-3 text-sm font-bold text-white bg-bgBlue rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow shadow-bgBlue/20 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Assign {selectedDeviceIds.length > 0 ? `${selectedDeviceIds.length} ` : ""}Device{selectedDeviceIds.length > 1 ? "s" : ""}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default AssignExistingDeviceModal;
