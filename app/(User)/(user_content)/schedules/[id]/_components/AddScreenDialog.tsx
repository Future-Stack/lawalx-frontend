import React, { useState, useMemo } from "react";
import { Search, Monitor, CheckCircle2, Loader2 } from "lucide-react";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";
import BaseDialog from "@/common/BaseDialog";
import { useGetMyAllDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { Device } from "@/redux/api/users/devices/devices.type";
import Dropdown from "@/common/Dropdown";
import { Label } from "@/components/ui/label";
import DeviceLocation from "@/components/common/DeviceLocation";

interface AddScreenDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (devices: Device[]) => Promise<void> | void;
}

const AddScreenDialog: React.FC<AddScreenDialogProps> = ({ isOpen, onClose, onAdd }) => {
    const [search, setSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    const { data: allDevicesData, isLoading } = useGetMyAllDevicesDataQuery(undefined);
    const allDevices = useMemo(() => allDevicesData?.data || [], [allDevicesData?.data]);

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

    const handleConfirm = async () => {
        const selectedDevices = allDevices.filter(d => selectedIds.includes(d.id));
        setIsAdding(true);
        try {
            await onAdd(selectedDevices);
            setSelectedIds([]);
            onClose();
        } catch (error) {
            console.error("Failed to add devices to schedule", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleClose = () => {
        if (isAdding) return;
        setSelectedIds([]);
        setSearch("");
        setSelectedStatus("all");
        onClose();
    };

    return (
        <BaseDialog
            open={isOpen}
            setOpen={isAdding ? () => {} : handleClose}
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
                                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer group ${isSelected
                                        ? "border-bgBlue bg-blue-50 dark:bg-blue-950/20"
                                        : "border-border bg-input hover:border-bgBlue"
                                        }`}
                                >
                                    {/* Circular Avatar */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-bgBlue text-white" : "bg-gray-100 dark:bg-gray-800 text-muted"}`}>
                                        <Monitor className="w-5 h-5" />
                                    </div>

                                    {/* Info */}
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

                                    {/* Check circle */}
                                    {isSelected ? (
                                        <CheckCircle2 className="w-5 h-5 text-bgBlue" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border border-borderGray group-hover:border-bgBlue" />
                                    )}
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
                        disabled={isAdding}
                        className="px-6 py-2.5 text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition cursor-pointer shadow-customShadow disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0 || isAdding}
                        className="px-8 py-2.5 bg-bgBlue text-white rounded-lg font-semibold hover:bg-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow flex items-center justify-center gap-2"
                    >
                        {isAdding ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Adding...</span>
                            </>
                        ) : (
                            <>
                                Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Device{selectedIds.length !== 1 ? "s" : ""}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default AddScreenDialog;
