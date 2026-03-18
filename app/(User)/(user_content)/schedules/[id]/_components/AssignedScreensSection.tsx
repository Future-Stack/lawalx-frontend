import React from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AssignedScreensSectionProps {
    assignedScreens: any[]; // API derived targets grouped by program
    onAddScreen: () => void;
    onRemoveProgram: (programId: string) => void;
    onToggleDevice: (deviceId: string, isEnabled: boolean, programId: string) => void;
    onDeleteSchedule: () => void;
}

const AssignedScreensSection: React.FC<AssignedScreensSectionProps> = ({
    assignedScreens,
    onAddScreen,
    onRemoveProgram,
    onToggleDevice,
    onDeleteSchedule
}) => {
    const [expandedProgramId, setExpandedProgramId] = React.useState<string | null>(assignedScreens[0]?.groupId || null);

    return (
        <section className="bg-navbarBg border border-border rounded-xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-headings dark:text-white">Assigned Program</h2>
                <button
                    onClick={onAddScreen}
                    className="flex items-center gap-2 px-4 py-2 bg-bgBlue text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition cursor-pointer shadow-customShadow"
                >
                    <Plus className="w-4 h-4" />
                    Add Program
                </button>
            </div>

            <div className="divide-y divide-border">
                {assignedScreens.map((program) => (
                    <div key={program.groupId} className="py-2">
                        <div className="flex items-center justify-between py-2 group">
                            <div
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => setExpandedProgramId(expandedProgramId === program.groupId ? null : program.groupId)}
                            >
                                {expandedProgramId === program.groupId ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                                <span className="text-lg font-semibold text-headings dark:text-white">
                                    {program.groupName}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemoveProgram(program.groupId)}
                                className="p-1 hover:bg-red-50 rounded-full transition-colors text-red-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {expandedProgramId === program.groupId && (
                            <div className="pl-8 pb-4 space-y-3 mt-2">
                                {program.screens.map((device: any) => (
                                    <div key={device.id} className="flex items-center gap-4">
                                        <div className="relative flex items-center">
                                            <Checkbox
                                                id={device.id}
                                                checked={device.isEnabled}
                                                onCheckedChange={(checked) => onToggleDevice(device.id, !!checked, program.groupId)}
                                                className="w-5 h-5 border-borderGray data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue"
                                            />
                                        </div>
                                        <label
                                            htmlFor={device.id}
                                            className="text-base text-gray-500 cursor-pointer select-none"
                                        >
                                            {device.name}
                                        </label>
                                    </div>
                                ))}
                                {(!program.screens || program.screens.length === 0) && (
                                    <p className="text-sm text-muted italic">No devices assigned to this program</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {assignedScreens.length === 0 && (
                    <div className="py-8 text-center border-t border-border">
                        <p className="text-muted italic">No programs assigned yet. Click "Add Screen" to get started.</p>
                    </div>
                )}
            </div>

            {/* Warning Section */}
            <div className="mt-8 p-6 bg-red-50/50 dark:bg-red-900/5 border-none rounded-2xl space-y-4">
                <p className="text-red-700 dark:text-red-400 font-medium text-lg">
                    These actions cannot be undone. Please proceed with caution.
                </p>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={onDeleteSchedule}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#F43F5E] hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-sm cursor-pointer"
                    >
                        <Trash2 className="w-5 h-5" />
                        Delete Schedule
                    </button>
                </div>
            </div>
        </section>
    );
};

export default AssignedScreensSection;
