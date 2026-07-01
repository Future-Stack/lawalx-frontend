"use client";

import React, { useState } from "react";
import { Search, Monitor, Loader2, CheckCircle2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetMyAllDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { DeviceListResponse, Device } from "@/redux/api/users/devices/devices.type";
import AddDeviceModal from "@/components/dashboard/AddDeviceModal";

interface Step3Props {
    data: {
        selectedScreens: string[];
    };
    onChange: (data: { selectedScreens: string[] }) => void;
}
import DeviceLocation from "@/components/common/DeviceLocation";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";

const Step3ScreenSelection: React.FC<Step3Props> = ({ data, onChange }) => {
    const { data: devicesData, isLoading } = useGetMyAllDevicesDataQuery();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
    console.log("devicesData", devicesData);

    const devices = (devicesData as DeviceListResponse)?.data || [];

    const filteredDevices = devices.filter((device: Device) =>
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.deviceSerial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (device.location &&
            (device.location.lat.toString().includes(searchQuery) ||
                device.location.lng.toString().includes(searchQuery)))
    );

    const toggleDevice = (deviceId: string) => {
        const updatedDevices = data.selectedScreens.includes(deviceId)
            ? data.selectedScreens.filter(id => id !== deviceId)
            : [...data.selectedScreens, deviceId];

        onChange({ selectedScreens: updatedDevices });
    };

    return (
        <div className="space-y-6">
            {/* Select Device Field Label */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <label className="block text-sm font-semibold text-headings">
                    Select Device
                </label>
                {data.selectedScreens.length > 0 && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-bgBlue font-semibold animate-in fade-in slide-in-from-right-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                        <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{data.selectedScreens.length} selected</span>
                    </div>
                )}
                </div>

                    <button
                        type="button"
                        onClick={() => setIsAddDeviceOpen(true)}
                        className="px-6 py-2 cursor-pointer bg-bgBlue text-white rounded-lg flex items-center justify-center gap-2 shadow-customShadow hover:bg-blue-600 transition-colors w-full sm:w-auto"
                    >
                        <span className="text-lg"><Plus /></span> Add Device
                    </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <Input
                    type="text"
                    placeholder="Search Device"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-input border-borderGray text-headings"
                />
            </div>

            {/* Device List */}
            <div className="max-h-[350px] overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span>Loading devices...</span>
                    </div>
                ) : filteredDevices.length === 0 ? (
                    <div className="text-center py-8 text-muted border border-dashed border-border rounded-lg">
                        No devices found
                    </div>
                ) : (
                    filteredDevices.map((device: Device) => (
                        <div
                            key={device.id}
                            onClick={() => toggleDevice(device.id)}
                            className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer group ${data.selectedScreens.includes(device.id)
                                ? "border-bgBlue bg-blue-50 dark:bg-blue-950/20"
                                : "border-borderGray bg-input hover:border-bgBlue"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${data.selectedScreens.includes(device.id) ? "bg-bgBlue text-white" : "bg-gray-100 dark:bg-gray-800 text-muted"
                                }`}>
                                <Monitor className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                    <Label htmlFor={device.id} className="font-semibold text-headings cursor-pointer truncate max-w-[150px] md:max-w-none">
                                        {device.name}
                                    </Label>
                                    <DeviceStatusBadge status={device.status} />
                                </div>
                                <p className="text-sm text-muted truncate">
                                    {device.location ? (
                                        typeof device.location === "object"
                                            ? <DeviceLocation lat={device.location.lat} lng={device.location.lng} />
                                            : ((device.location === '0.00, 0.00' || device.location === '0, 0' || device.location === 'Unknown Location') ? 'N/A' : device.location)
                                    ) : (
                                        "N/A"
                                    )}
                                </p>
                                {device.deviceType && (
                                    <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-widest mt-1 inline-block">
                                        {device.deviceType}
                                    </span>
                                )}
                            </div>

                            {data.selectedScreens.includes(device.id) ? (
                                <CheckCircle2 className="w-5 h-5 text-bgBlue" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-borderGray group-hover:border-bgBlue" />
                            )}
                        </div>
                    ))
                )}
            </div>

            <AddDeviceModal
                isOpen={isAddDeviceOpen}
                onClose={() => setIsAddDeviceOpen(false)}
            />
        </div >
    );
};

export default Step3ScreenSelection;

