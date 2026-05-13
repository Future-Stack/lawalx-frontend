/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import BaseSelect from "@/common/BaseSelect";
import { Loader2, Monitor } from "lucide-react";
import { useUpdatePlanMutation } from "@/redux/api/admin/payments/plans/plansApi";
import { toast } from "sonner";

interface EditPlanDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: any;
}

const EditPlanDialog = ({
  open,
  setOpen,
  initialData,
}: EditPlanDialogProps) => {
  const [updatePlan, { isLoading: isUpdating }] = useUpdatePlanMutation();

  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");
  const [devices, setDevices] = useState("5");
  const [storage, setStorage] = useState("10");
  const [templates, setTemplates] = useState("1");
  const [uploadLimits, setUploadLimits] = useState({
    photo: "5",
    audio: "10",
    video: "5",
  });

  useEffect(() => {
    if (open && initialData) {
      setPlanName(initialData.name || "");
      setDescription(
        initialData.description ||
          "This plan currently has 120 active subscribers. Any changes you make will immediately affect their billing and feature access.",
      );
      setPrice(initialData.price || "256.25");
      setCurrency(initialData.currency || "USD");
      setDevices(initialData.devices || "5");
      setStorage(initialData.storage || "10");
      setTemplates(initialData.templates || "1");
      setUploadLimits({
        photo: initialData.limits?.photo || "5",
        audio: initialData.limits?.audio || "10",
        video: initialData.limits?.video || "5",
      });
    }
  }, [open, initialData]);

  const handleSave = async () => {
    if (!initialData?.id) {
      toast.error("Plan ID not found");
      return;
    }

    try {
      const payload = {
        description,
        price: parseFloat(price.toString().replace(/[^0-9.]/g, "")),
        currency,
        deviceLimit: parseInt(devices),
        storageLimitGb: parseInt(storage),
        templates: parseInt(templates),
        photoLimit: parseInt(uploadLimits.photo),
        audioLimit: parseInt(uploadLimits.audio),
        videoLimit: parseInt(uploadLimits.video),
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
    "w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg px-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all shadow-sm";

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="xl"
      maxHeight="xl"
      hideScrollbar={true}
      className="p-0"
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
                Edit Plan
              </h2>
              <p className="text-[#667085] text-[14px] mt-1">
                Configure the plan details, limits, and features.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-4 flex-1 scrollbar-hide">
          {/* Plan Name */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-[14px] text-[#404040]">
              Name
            </Label>
            <input
              id="plan-name"
              title="Plan Name"
              placeholder="Basic"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-price" className="text-[14px] text-[#404040]">
              Price
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] text-[16px] font-medium">
                $
              </span>
              <input
                id="plan-price"
                type="text"
                title="Plan Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="256.25"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="plan-description"
              className="text-[14px] text-[#404040]"
            >
              Description
            </Label>
            <textarea
              id="plan-description"
              title="Plan Description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[100px] resize-none py-3`}
            />
          </div>

          {/* Devices & Storage Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="plan-devices"
                className="text-[14px] text-[#404040]"
              >
                Devices
              </Label>
              <BaseSelect
                options={[
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                  { label: "50", value: "50" },
                  { label: "100", value: "100" },
                ]}
                value={devices}
                onChange={setDevices}
                showLabel={false}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="plan-storage"
                className="text-[14px] text-[#404040]"
              >
                Storage
              </Label>
              <div className="relative">
                <input
                  id="plan-storage"
                  type="text"
                  title="Storage Limit"
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  placeholder="10GB"
                  className={inputClass}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L5 1L9 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 1L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-1.5">
            <Label
              htmlFor="plan-templates"
              className="text-[14px] text-headings"
            >
              Templates
            </Label>
            <input
              id="plan-templates"
              title="Templates Limit"
              placeholder="1"
              value={templates}
              onChange={(e) => setTemplates(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Upload Limits Header */}
          <div className="pt-2">
            <h4 className="text-[14px] text-headings">Upload Limits</h4>
          </div>

          {/* Upload Limits - Photo & Audio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="limit-photo"
                className="text-[14px] font-medium text-[#667085]"
              >
                Photo
              </Label>
              <BaseSelect
                options={[
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                ]}
                value={uploadLimits.photo}
                onChange={(val) =>
                  setUploadLimits((prev) => ({ ...prev, photo: val }))
                }
                showLabel={false}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="limit-audio"
                className="text-[14px] font-medium text-[#667085]"
              >
                Audio
              </Label>
              <div className="relative">
                <input
                  id="limit-audio"
                  type="text"
                  title="Audio Limit"
                  value={uploadLimits.audio}
                  onChange={(e) =>
                    setUploadLimits((prev) => ({
                      ...prev,
                      audio: e.target.value,
                    }))
                  }
                  placeholder="10"
                  className={inputClass}
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L5 1L9 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg
                      width="10"
                      height="6"
                      viewBox="0 0 10 6"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 1L5 5L1 1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Limits - Video & Templates (Again in screenshot?) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="limit-templates-2"
              className="text-[14px] font-medium text-[#667085]"
            >
              Templates
            </Label>
            <input
              id="limit-templates-2"
              title="Templates Limit"
              placeholder="1"
              value={templates}
              onChange={(e) => setTemplates(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5 pb-4">
            <Label
              htmlFor="limit-video"
              className="text-[14px] font-medium text-[#667085]"
            >
              Video
            </Label>
            <input
              id="limit-video"
              title="Video Limit"
              placeholder="5"
              value={uploadLimits.video}
              onChange={(e) =>
                setUploadLimits((prev) => ({ ...prev, video: e.target.value }))
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-[#F2F4F7] dark:border-gray-800 bg-[#FCFCFD] dark:bg-gray-900/20">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setOpen(false)}
              className="px-6 py-2.5 min-w-[100px] rounded-lg border border-[#D0D5DD] dark:border-gray-700 font-bold text-[14px] text-headings hover:bg-gray-50 transition-all cursor-pointer shadow-sm bg-white dark:bg-gray-900"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="px-10 py-2.5 rounded-lg bg-[#00A3FF] text-white font-bold text-[14px] hover:bg-[#00A3FF]/90 transition-all cursor-pointer shadow-sm flex items-center gap-2"
            >
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default EditPlanDialog;
