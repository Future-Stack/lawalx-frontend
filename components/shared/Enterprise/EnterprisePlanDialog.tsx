/* eslint-disable */
"use client";

import { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  useGetEnterpriseSubscriptionInfoQuery,
  useUpdateEnterpriseSubscriptionInfoMutation,
  useDeleteEnterpriseSubscriptionInfoMutation,
  useSendEnterpriseProposalMutation,
} from "@/redux/api/enterpriseRequests/enterpriseRequestsApi";
import { useRemoveTagFromTicketMutation } from "@/redux/api/supporter/supporterTicketApi";
import { Loader2, Monitor, Plus, X, Trash2 } from "lucide-react";
import type { EnterpriseSubscriptionInfoPayload } from "@/redux/api/enterpriseRequests/enterpriseRequests.type";
interface EnterprisePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: { id: string; ticketTags?: any[] } | null;
  isAdmin?: boolean;
}

export default function EnterprisePlanDialog({
  open,
  onOpenChange,
  ticket,
  isAdmin = false,
}: EnterprisePlanDialogProps) {
  const ticketId = ticket?.id || null;
  const { data: planData, isLoading: isFetching } =
    useGetEnterpriseSubscriptionInfoQuery(ticketId || "", {
      skip: !open || !ticketId,
    });

  const [updatePlan, { isLoading: isUpdating }] =
    useUpdateEnterpriseSubscriptionInfoMutation();
  const [deletePlan, { isLoading: isDeleting }] =
    useDeleteEnterpriseSubscriptionInfoMutation();
  const [removeTag, { isLoading: isRemovingTag }] =
    useRemoveTagFromTicketMutation();
  const [sendProposal, { isLoading: isSendingProposal }] =
    useSendEnterpriseProposalMutation();

  const [formData, setFormData] = useState<EnterpriseSubscriptionInfoPayload>({
    name: "ENTERPRISE",
    description: "Enterprise Plan",
    price: 100,
    screenSize: 24,
    deviceLimit: 5,
    storageLimitGb: 50,
    templateLimit: 1,
    photoLimit: 5,
    audioLimit: 10,
    videoLimit: 5,
    features: ["Dedicated support", "Unlimited scale", "Premium templates"],
  });

  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (planData?.data) {
      setFormData({
        ...planData.data,
        price: planData.data.originalPrice ?? planData.data.mainPrice ?? planData.data.price,
        features: planData.data.features || [],
      });
    }
  }, [planData]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!ticketId) return;
    try {
      const apiData = planData?.data;
      const payload: Partial<typeof formData> = {};

      if (formData.name !== apiData?.name) payload.name = formData.name;
      if (formData.description !== apiData?.description)
        payload.description = formData.description;

      if (
        JSON.stringify(formData.features) !==
        JSON.stringify(apiData?.features || [])
      ) {
        payload.features = formData.features;
      }

      const basePrice = (apiData?.originalPrice ?? apiData?.mainPrice ?? apiData?.price) || 0;
      if (Number(formData.price) !== Number(basePrice))
        payload.price = Number(formData.price);
      if (Number(formData.screenSize) !== Number(apiData?.screenSize || 0))
        payload.screenSize = Number(formData.screenSize);
      if (Number(formData.deviceLimit) !== Number(apiData?.deviceLimit || 0))
        payload.deviceLimit = Number(formData.deviceLimit);
      if (
        Number(formData.storageLimitGb) !== Number(apiData?.storageLimitGb || 0)
      )
        payload.storageLimitGb = Number(formData.storageLimitGb);
      if (
        Number(formData.templateLimit) !== Number(apiData?.templateLimit || 0)
      )
        payload.templateLimit = Number(formData.templateLimit);
      if (Number(formData.photoLimit) !== Number(apiData?.photoLimit || 0))
        payload.photoLimit = Number(formData.photoLimit);
      if (Number(formData.audioLimit) !== Number(apiData?.audioLimit || 0))
        payload.audioLimit = Number(formData.audioLimit);
      if (Number(formData.videoLimit) !== Number(apiData?.videoLimit || 0))
        payload.videoLimit = Number(formData.videoLimit);

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to update");
        onOpenChange(false);
        return;
      }

      const res = (await updatePlan({
        ticketId,
        data: payload as any,
      }).unwrap()) as { success?: boolean; message?: string };
      if (res?.success) {
        toast.success(res?.message || "Enterprise plan updated successfully");
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to update enterprise plan");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(
        error?.data?.message || "An error occurred while updating the plan",
      );
    }
  };

  const handleDelete = async () => {
    if (!ticketId) return;
    if (!confirm("Are you sure you want to delete this enterprise plan?"))
      return;
    try {
      const res = (await deletePlan(ticketId).unwrap()) as {
        success?: boolean;
        message?: string;
      };
      if (res?.success) {
        const tag = ticket?.ticketTags?.find(
          (t: { tag?: { key: string; id: string } }) =>
            t.tag?.key === "NEEDS_ENTERPRISE_PLAN",
        );
        if (tag?.tag?.id) {
          try {
            await removeTag({ ticketId, tagId: tag.tag.id }).unwrap();
          } catch (tagErr) {
            console.error("Failed to remove tag", tagErr);
          }
        }

        toast.success(res?.message || "Enterprise plan deleted successfully");
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to delete enterprise plan");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(
        error?.data?.message || "An error occurred while deleting the plan",
      );
    }
  };

  const handleSendProposal = async () => {
    if (!ticketId) return;
    try {
      const res = (await sendProposal(ticketId).unwrap()) as {
        success?: boolean;
        message?: string;
      };
      if (res?.success) {
        toast.success(res?.message || "Enterprise proposal sent successfully");
      } else {
        toast.error(res?.message || "Failed to send enterprise proposal");
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(
        error?.data?.message || "An error occurred while sending the proposal",
      );
    }
  };

  const inputClass =
    "w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg px-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-[#00A3FF] transition-all shadow-sm";

  return (
    <BaseDialog
      open={open}
      setOpen={onOpenChange}
      title=""
      description=""
      maxWidth="xl"
      maxHeight="xl"
      hideScrollbar={false}
      className="p-0 [&>div:first-child]:hidden"
    >
      <div className="flex flex-col h-full bg-white dark:bg-gray-950">
        {/* Header with Icon */}
        <div className="p-6 pb-0">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full border border-[#7F56D933] bg-[#7F56D90D] flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-[#7F56D9]" />
              </div>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-Heading leading-tight">
                Enterprise Plan Details
              </h2>
              <p className="text-[#667085] text-[14px] mt-1">
                View or modify the enterprise plan details, limits, and
                features.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {isFetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[14px] text-[#404040]">
                    Plan Name
                  </Label>
                  <Select
                    value={formData.name}
                    onValueChange={(val) => handleInputChange("name", val)}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent className="z-99999">
                      <SelectItem value="FREE_TRIAL">Free Trial</SelectItem>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="BUSINESS">Business</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[14px] text-[#404040]">
                    Price ($)
                  </Label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[14px] text-[#404040]">
                  Description
                </Label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`${inputClass} min-h-[80px] resize-none py-3`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[14px] text-[#404040]">
                    Screen Size
                  </Label>
                  <input
                    type="number"
                    value={formData.screenSize}
                    onChange={(e) =>
                      handleInputChange("screenSize", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[14px] text-[#404040]">
                    Device Limit
                  </Label>
                  <input
                    type="number"
                    value={formData.deviceLimit}
                    onChange={(e) =>
                      handleInputChange("deviceLimit", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[14px] text-[#404040]">
                    Storage Limit (GB)
                  </Label>
                  <input
                    type="number"
                    value={formData.storageLimitGb}
                    onChange={(e) =>
                      handleInputChange("storageLimitGb", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[14px] text-[#404040]">
                    Template Limit
                  </Label>
                  <input
                    type="number"
                    value={formData.templateLimit}
                    onChange={(e) =>
                      handleInputChange("templateLimit", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-[14px] font-bold text-headings">
                  Upload Limits
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#667085]">Photo</Label>
                    <input
                      type="number"
                      value={formData.photoLimit}
                      onChange={(e) =>
                        handleInputChange("photoLimit", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#667085]">Audio</Label>
                    <input
                      type="number"
                      value={formData.audioLimit}
                      onChange={(e) =>
                        handleInputChange("audioLimit", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#667085]">Video</Label>
                    <input
                      type="number"
                      value={formData.videoLimit}
                      onChange={(e) =>
                        handleInputChange("videoLimit", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-[14px] font-bold text-headings">
                  Features
                </Label>
                <div className="flex gap-2">
                  <input
                    placeholder="Add a feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddFeature())
                    }
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    disabled={!newFeature.trim()}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-headings text-[14px] font-medium rounded-lg transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-[#F2F4F7] dark:border-gray-800"
                    >
                      <span className="text-[14px] text-[#404040] dark:text-gray-300">
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {formData.features.length === 0 && (
                    <p className="text-[12px] text-gray-400 text-center py-2">
                      No features added yet.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-[#F2F4F7] dark:border-gray-800 bg-[#FCFCFD] dark:bg-gray-900/20">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isUpdating || isRemovingTag}
              className="px-6 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[14px] transition-all flex justify-center items-center gap-2 w-full sm:w-auto"
            >
              {isDeleting || isRemovingTag ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete Plan
            </button>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleSave}
                disabled={
                  isUpdating || isDeleting || isRemovingTag || isSendingProposal
                }
                className="px-10 py-2.5 rounded-lg bg-[#00A3FF] text-white font-bold text-[14px] hover:bg-[#00A3FF]/90 transition-all cursor-pointer shadow-sm flex justify-center items-center gap-2 w-full sm:w-auto"
              >
                {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
              {isAdmin && (
                <button
                  onClick={handleSendProposal}
                  className="px-6 py-2.5 min-w-[140px] rounded-lg border border-[#00A3FF] text-[#00A3FF] font-bold text-[14px] hover:bg-blue-50 transition-all cursor-pointer shadow-sm bg-white dark:bg-gray-900 flex justify-center items-center gap-2 w-full sm:w-auto"
                  disabled={
                    isUpdating ||
                    isDeleting ||
                    isRemovingTag ||
                    isSendingProposal
                  }
                >
                  {isSendingProposal && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Send Proposal
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
}
