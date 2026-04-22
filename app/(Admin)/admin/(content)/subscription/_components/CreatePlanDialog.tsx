"use client";

import { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import BaseSelect from "@/common/BaseSelect";
import { Crown, Loader2 } from "lucide-react";
import { useUpdatePlanMutation } from "@/redux/api/admin/payments/plans/plansApi";
import { toast } from "sonner";

interface CreatePlanDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    editMode?: boolean;
    initialData?: any;
}

const CreatePlanDialog = ({
    open,
    setOpen,
    editMode,
    initialData,
}: CreatePlanDialogProps) => {
    const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();

    const [planName, setPlanName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("0");
    const [currency, setCurrency] = useState("USD");
    const [isAdvanced, setIsAdvanced] = useState(false);

    const [limits, setLimits] = useState({
        deviceLimit: 20,
        storageLimit: 50,
        fileLimit: 100,
        fileSizeLimit: 10,
    });

    useEffect(() => {
        if (open && initialData) {
            setPlanName(initialData.name || "");
            setDescription(initialData.description || "");
            setPrice(initialData.price || "0");
            setCurrency(initialData.currency || "USD");
            setIsAdvanced(initialData.isAdvanceEnabled || false);
            setLimits({
                deviceLimit: initialData.deviceLimit || 20,
                storageLimit: initialData.storageLimitGb || 50,
                fileLimit: initialData.fileLimit || 100,
                fileSizeLimit: initialData.fileSizeLimitMb || 10,
            });
        }
    }, [open, initialData]);

    const handleLimitChange = (field: string, value: any) => {
        setLimits((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!editMode || !initialData?.id) {
            toast.error("Create plan not implemented yet");
            return;
        }

        try {
            const payload = {
                description,
                price: parseFloat(price),
                currency,
                deviceLimit: parseInt(limits.deviceLimit.toString()),
                storageLimitGb: parseInt(limits.storageLimit.toString()),
                fileLimit: parseInt(limits.fileLimit.toString()),
                fileSizeLimitMb: parseInt(limits.fileSizeLimit.toString()),
                isAdvanceEnabled: isAdvanced,
                isActive: initialData.isActive,
            };

            await updatePlan({ id: initialData.id, data: payload }).unwrap();
            toast.success("Plan updated successfully!");
            setOpen(false);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update plan");
        }
    };

    const inputClass =
        "w-full bg-input border border-border rounded-lg px-3 py-3 h-12 focus:outline-none focus:ring-1 focus:ring-bgBlue text-headings";

    return (
        <BaseDialog
            open={open}
            setOpen={setOpen}
            title={editMode ? "Edit Plan" : "Create New Plan"}
            description="Configure the plan details, limits, and features."
            maxWidth="xl"
        >
            <div className="space-y-4 md:space-y-6 px-1 bg-navbarBg">
                {/* Plan Name */}
                <div className="space-y-2">
                    <Label className="text-headings font-medium">Plan Name</Label>
                    <input
                        type="text"
                        placeholder="Business"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        className={inputClass}
                        disabled={editMode}
                    />
                    {editMode && (
                        <p className="text-xs text-muted">Plan name cannot be changed</p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label className="text-headings font-medium">Description</Label>
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-input border border-border rounded-lg px-3 py-3 min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-bgBlue text-headings"
                    />
                </div>

                {/* Price */}
                <div className="space-y-1">
                    <Label className="text-headings font-medium">Price</Label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="$ 256.25"
                            className="w-full bg-input border border-border rounded-lg px-2 md:px-4 py-2 md:py-3 focus:outline-none focus:ring-1 focus:ring-bgBlue text-headings placeholder:text-muted"
                        />
                        <div className="w-32">
                            <BaseSelect
                                options={[{ label: "USD", value: "USD" }]}
                                value={currency}
                                onChange={setCurrency}
                                showLabel={false}
                                className="border-none shadow-none bg-transparent"
                            />
                        </div>
                    </div>
                </div>
                {/* Limit Header */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <h4 className="text-base font-semibold text-headings">
                        Limit
                    </h4>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-headings">
                            Advanced
                        </span>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={isAdvanced}
                            onClick={() => setIsAdvanced(prev => !prev)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${isAdvanced ? "bg-bgBlue" : "bg-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${isAdvanced ? "translate-x-5" : "translate-x-0.5"
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Limits Grid - Conditionally rendered */}
                {isAdvanced && (
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-headings font-medium">
                                Device Limit
                            </Label>
                            <input
                                type="number"
                                placeholder="100"
                                value={limits.deviceLimit}
                                onChange={(e) =>
                                    handleLimitChange("deviceLimit", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-headings font-medium">
                                Storage Limit
                            </Label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="100"
                                    value={limits.storageLimit}
                                    onChange={(e) =>
                                        handleLimitChange("storageLimit", e.target.value)
                                    }
                                    className={`${inputClass} pr-12`}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted text-sm">
                                    GB
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-headings font-medium">
                                File Limit
                            </Label>
                            <input
                                type="number"
                                value={limits.fileLimit}
                                placeholder="100"
                                onChange={(e) =>
                                    handleLimitChange("fileLimit", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-headings font-medium">
                                File Size Limit (MB)
                            </Label>
                            <input
                                type="number"
                                value={limits.fileSizeLimit}
                                placeholder="100"
                                onChange={(e) =>
                                    handleLimitChange("fileSizeLimit", e.target.value)
                                }
                                className={inputClass}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-6 py-2 border border-border rounded-lg font-medium text-headings hover:text-bgBlue transition shadow-customShadow cursor-pointer"
                        disabled={isUpdating}
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="px-6 py-2 bg-bgBlue text-white rounded-lg font-medium hover:bg-bgBlue/80 transition flex items-center gap-2 shadow-customShadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {editMode ? "Saving..." : "Creating..."}
                            </>
                        ) : editMode ? (
                            "Save Plan"
                        ) : (
                            <>
                                <Crown className="w-4 h-4" /> Create Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </BaseDialog>
    );
};

export default CreatePlanDialog;
