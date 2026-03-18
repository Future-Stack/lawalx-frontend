"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Loader2 } from "lucide-react";
import { useGetAllProgramsDataQuery } from "@/redux/api/users/programs/programs.api";
import { useAssignProgramMutation } from "@/redux/api/users/content/content.api";
import { motion, AnimatePresence } from "framer-motion";
import BaseDialog from "@/common/BaseDialog";
import { toast } from "sonner";

interface AssignToDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    contentId: string;
    onAssign?: (selectedIds: string[]) => void;
}

const AssignToDialog = ({ open, setOpen, contentId, onAssign }: AssignToDialogProps) => {
    const { data: response, isLoading } = useGetAllProgramsDataQuery();
    const [assignProgram, { isLoading: isAssigning }] = useAssignProgramMutation();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const programs = response?.data || [];

    const toggleScreen = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleAssign = async () => {
        if (!contentId) {
            toast.error("No content selected for assignment.");
            return;
        }

        try {
            // Call assignProgram for each selected program
            const assignmentPromises = selectedIds.map((programId) =>
                assignProgram({ id: contentId, programId }).unwrap()
            );

            const response = await Promise.all(assignmentPromises);
            console.log(response);

            toast.success(`Successfully assigned to ${selectedIds.length} program(s).`);
            onAssign?.(selectedIds);
            setOpen(false);
        } catch (error: any) {
            console.error("Assignment failed:", error);
            toast.error(error?.data?.message || "Failed to assign program. Please try again.");
        }
    };

    const filteredPrograms = programs.filter((program) =>
        program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title="Assign to Program"
            description="Select the programs where you want to show this content"
            maxWidth="xl"
            maxHeight="lg"
            className="rounded-2xl"
        >
            <div className="flex flex-col h-full gap-4">
                <div className="border-t border-border -mx-2 mb-2" />

                {/* Search Box - Sticky-like placement inside BaseDialog */}
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textGray group-focus-within:text-bgBlue transition-colors pointer-events-none" />
                    <Input
                        placeholder="Search Program..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 md:h-12 pl-10 pr-4 border-border bg-input rounded-lg text-sm md:text-base focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-bgBlue transition-all"
                    />
                </div>

                {/* List Area */}
                <div className="border border-border rounded-xl bg-white dark:bg-gray-900 overflow-hidden flex-1 flex flex-col min-h-[250px]">
                    <div className="overflow-y-auto p-1.5 md:p-2 custom-scrollbar flex-1 bg-gray-50">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2 text-textGray h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-bgBlue" />
                                <span className="text-sm font-medium">Loading programs...</span>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredPrograms.length > 0 ? (
                                    filteredPrograms.map((program) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                            key={program.id}
                                            className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer group mb-1 last:mb-0 ${selectedIds.includes(program.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                                            onClick={() => toggleScreen(program.id)}
                                        >
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(program.id)}
                                                    onCheckedChange={() => toggleScreen(program.id)}
                                                    className="w-5 h-5 md:w-6 md:h-6 rounded-md data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue data-[state=checked]:text-white shrink-0 transition-transform active:scale-90"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="font-semibold text-headings text-sm md:text-base truncate leading-tight">
                                                    {program.name}
                                                </p>
                                                <p className="text-[11px] md:text-xs text-textGray mt-1 leading-tight line-clamp-1">
                                                    {program.description || `Size: ${program.serene_size || "Default"}`}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-12 text-center text-textGray text-sm h-full flex items-center justify-center"
                                    >
                                        No programs found matching "{searchQuery}"
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* Footer buttons - Inside scrollable but styled for visibility */}
                <div className="flex flex-row gap-3 md:gap-4 items-center bg-gray-50/50 dark:bg-gray-900/50 p-2 md:p-4 rounded-xl mt-auto">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 h-11 md:h-12 rounded-lg text-sm md:text-base font-bold text-body border-border shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAssign}
                        disabled={selectedIds.length === 0 || isAssigning}
                        className="flex-1 h-11 md:h-12 rounded-lg text-sm md:text-base font-bold bg-bgBlue hover:bg-[#0095FF] text-white transition-all shadow-customShadow active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        {isAssigning ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : selectedIds.length > 0 ? (
                            `Assign (${selectedIds.length})`
                        ) : (
                            "Assign"
                        )}
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default AssignToDialog;
