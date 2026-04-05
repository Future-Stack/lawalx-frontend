import React, { useState } from "react";
import { Search, Monitor, X } from "lucide-react";
import BaseDialog from "@/common/BaseDialog";
import { useGetAllProgramsDataQuery } from "@/redux/api/users/programs/programs.api";
import { Program } from "@/redux/api/users/programs/programs.type";
import { Checkbox } from "@/components/ui/checkbox";

interface AddScreenDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (programs: Program[]) => void;
}

const AddScreenDialog: React.FC<AddScreenDialogProps> = ({ isOpen, onClose, onAdd }) => {
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data: allProgramsData, isLoading } = useGetAllProgramsDataQuery(undefined);
    const allPrograms = allProgramsData?.data || [];

    const filteredPrograms = allPrograms.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedPrograms = allPrograms.filter(p => selectedIds.includes(p.id));
        onAdd(selectedPrograms);
        setSelectedIds([]);
        onClose();
    };

    return (
        <BaseDialog
            open={isOpen}
            setOpen={onClose}
            title="Add Program"
            description="Select programs to assign to this schedule"
            className="max-w-2xl"
        >
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search program..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg"
                    />
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <div className="py-20 text-center text-muted">Loading programs...</div>
                    ) : (
                        filteredPrograms.map((program) => (
                            <div
                                key={program.id}
                                onClick={() => toggleSelection(program.id)}
                                className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${selectedIds.includes(program.id)
                                    ? "border-bgBlue bg-bgBlue/5 shadow-sm"
                                    : "border-border hover:bg-bgGray/30"
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedIds.includes(program.id) ? "bg-bgBlue text-white" : "bg-blue-50 dark:bg-blue-900/20 text-bgBlue"
                                        }`}>
                                        <Monitor className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-headings dark:text-white">{program.name}</div>
                                        <div className="text-xs text-muted">{program.devices?.length || 0} screens assigned</div>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={selectedIds.includes(program.id)}
                                    className="w-5 h-5 border-borderGray data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue pointer-events-none"
                                />
                            </div>
                        ))
                    )}
                    {!isLoading && filteredPrograms.length === 0 && (
                        <div className="py-20 text-center text-muted">No programs found</div>
                    )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-border">
                    <button onClick={onClose} className="px-6 py-2.5 text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition cursor-pointer shadow-customShadow">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                        className="px-6 py-2.5 bg-bgBlue text-white rounded-lg font-semibold hover:bg-blue-500 transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-customShadow"
                    >
                        Add {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Program{selectedIds.length !== 1 ? "s" : ""}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default AddScreenDialog;
