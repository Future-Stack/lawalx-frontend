import React from "react";
import { Plus, Trash2, X } from "lucide-react";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";

interface AssignedScreensSectionProps {
    assignedScreens: any[]; // API derived targets grouped by program
    onAddScreen: () => void;
    onRemoveDevice: (deviceId: string, programId: string) => void;
    onDeleteSchedule: () => void;
    isNew?: boolean;
}

const AssignedScreensSection: React.FC<AssignedScreensSectionProps> = ({
    assignedScreens,
    onAddScreen,
    onRemoveDevice,
    onDeleteSchedule,
    isNew
}) => {
    const assignedDevices = assignedScreens.flatMap((program) =>
        (program.screens || []).map((device: any) => ({
            ...device,
            programId: program.groupId,
        }))
    );

    return (
        <section className="bg-navbarBg border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-headings dark:text-white">Assigned Devices</h2>
                <button
                    onClick={onAddScreen}
                    className="flex items-center gap-2 px-4 py-2 md:py-2.5 bg-bgBlue text-white text-base font-semibold rounded-lg hover:bg-blue-500 transition cursor-pointer shadow-customShadow"
                >
                    <Plus className="w-4 h-4 text-white" />
                    Add Device
                </button>
            </div>

            <div className="space-y-2">
                {assignedDevices.map((device: any) => (
                    <div key={device.id} className="py-4 flex justify-between items-center gap-4 shadow-sm px-4 rounded-lg">
                        <div className="flex items-center gap-2 md:gap-6">
                            <span className="text-base text-headings select-none truncate font-medium">
                                {device.name}
                            </span>
                            <div className="justify-self-start">
                                <DeviceStatusBadge status={device.status} />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onRemoveDevice(device.id, device.programId)}
                            className="justify-self-end p-1 hover:bg-red-50 rounded-full transition-colors text-red-500 cursor-pointer"
                            aria-label={`Remove ${device.name}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {assignedDevices.length === 0 && (
                    <div className="py-8 text-center border-t border-border">
                        <p className="text-muted italic">No devices assigned yet. Click "Add Devices" to get started.</p>
                    </div>
                )}
            </div>

            {/* Warning Section */}
            {!isNew && (
                <div className="mt-8 p-6 bg-red-50/50 dark:bg-red-900/5 border-none rounded-2xl space-y-4">
                    <p className="text-red-700 dark:text-red-400 font-medium text-lg">
                        These actions cannot be undone. Please proceed with caution.
                    </p>
                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onDeleteSchedule}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F43F5E] hover:bg-red-600 text-white rounded-lg font-bold transition-all shadow-customShadow cursor-pointer"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Schedule
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AssignedScreensSection;
