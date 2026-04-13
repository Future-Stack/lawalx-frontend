import React, { useState, useMemo } from "react";
import { Search, Monitor, X, CircleCheckBigIcon, Loader2 } from "lucide-react";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";
import BaseDialog from "@/common/BaseDialog";
import { useGetMyDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { Device } from "@/redux/api/users/devices/devices.type";
import Dropdown from "@/common/Dropdown";

interface AddScreenDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (devices: Device[]) => void;
}

const AddScreenDialog: React.FC<AddScreenDialogProps> = ({ isOpen, onClose, onAdd }) => {
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: allDevicesData, isLoading } = useGetMyDevicesDataQuery(undefined);
    const allDevices = allDevicesData?.data || [];

    const filteredDevices = useMemo(() => {
        return allDevices.filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                                 d.deviceSerial.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = selectedStatus === "all" || d.status.toLowerCase() === selectedStatus.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [allDevices, search, selectedStatus]);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedDevices = allDevices.filter(d => selectedIds.includes(d.id));
        onAdd(selectedDevices);
        setSelectedIds([]);
        onClose();
    };

    const handleClose = () => {
        setSelectedIds([]);
        setSearch("");
        setSelectedStatus("all");
        onClose();
    };

    return (
        <BaseDialog
            open={isOpen}
            setOpen={handleClose}
            title="Add Device"
            description="Select devices to assign to this schedule"
            className="max-w-3xl"
        >
            <div className="space-y-6 p-1">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                    <div className="relative w-full sm:w-3/4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search device..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-headings dark:text-white"
                        />
                    </div>
                    <div className="w-full sm:w-1/4">
                        <Dropdown
                            value={selectedStatus}
                            options={[
                                { value: "all", label: "All Status" },
                                { value: "online", label: "Online" },
                                { value: "offline", label: "Offline" },
                                { value: "paired", label: "Paired" },
                            ]}
                            onChange={(val) => setSelectedStatus(String(val))}
                            className="w-full cursor-pointer"
                        />
                    </div>
                </div>

                {/* Devices List */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-muted">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span>Loading devices...</span>
                        </div>
                    ) : (
                        filteredDevices.map((device) => {
                            const isSelected = selectedIds.includes(device.id);
                            return (
                                <div
                                    key={device.id}
                                    onClick={() => toggleSelection(device.id)}
                                    className={`flex items-center gap-4 p-2 md:p-4 rounded-lg border transition-all cursor-pointer group ${isSelected
                                        ? "border-bgBlue bg-blue-50/50 dark:bg-blue-950/20"
                                        : "border-border hover:border-bgBlue hover:bg-bgGray/30"
                                        }`}
                                >
                                    {/* Selection Checkbox */}
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                                ? "bg-bgBlue border-bgBlue text-white"
                                                : "border-gray-300 dark:border-gray-600 group-hover:border-bgBlue"
                                                }`}
                                        >
                                            {isSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                                        </div>
                                    </div>

                                    {/* Device Icon */}
                                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-800 border border-border flex items-center justify-center">
                                        <Monitor className={`w-6 h-6 ${device.status === 'ONLINE' ? 'text-green-500' : 'text-gray-400'}`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-headings truncate text-base">
                                            {device.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-muted font-medium tracking-wider">
                                                ID: {device.deviceSerial}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <div className="flex items-center">
                                                <DeviceStatusBadge status={device.status} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    {!isLoading && filteredDevices.length === 0 && (
                        <div className="py-20 text-center text-muted flex flex-col items-center">
                            <Monitor className="w-12 h-12 text-gray-200 mb-3" />
                            <p>No devices found matching your filters</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition cursor-pointer shadow-customShadow"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="px-8 py-2.5 bg-bgBlue text-white rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow"
                    >
                        Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Device{selectedIds.length !== 1 ? "s" : ""}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default AddScreenDialog;
