import { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Loader2, Monitor, Plus, X } from "lucide-react";
import {
  PlanItem,
  useUpdatePlanMutation,
} from "@/redux/api/admin/payments/plans/plansApi";
import { toast } from "sonner";

interface EditPlanDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: PlanItem | null;
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
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (open && initialData) {
      setPlanName(initialData.name || "");
      setDescription(initialData.description || "");
      setPrice(initialData.price?.toString() || "0");
      setCurrency(initialData.currency || "USD");
      setDevices(initialData.deviceLimit?.toString() || "5");
      setStorage(initialData.storageLimitGb?.toString() || "10");
      setTemplates(initialData.templateLimit?.toString() || "1");
      setUploadLimits({
        photo: initialData.photoLimit?.toString() || "5",
        audio: initialData.audioLimit?.toString() || "10",
        video: initialData.videoLimit?.toString() || "5",
      });
      setFeatures(initialData.features || []);
      setIsActive(initialData.isActive ?? true);
    }
  }, [open, initialData]);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!initialData?.id) {
      toast.error("Plan ID not found");
      return;
    }

    try {
      const payload = {
        description,
        price: parseFloat(price.toString().replace(/[^0-9.]/g, "")),
        deviceLimit: parseInt(devices),
        storageLimitGb: parseInt(storage),
        templateLimit: parseInt(templates),
        photoLimit: parseInt(uploadLimits.photo),
        audioLimit: parseInt(uploadLimits.audio),
        videoLimit: parseInt(uploadLimits.video),
        features,
        isActive,
      };

      await updatePlan({ id: initialData.id, data: payload }).unwrap();
      toast.success("Plan updated successfully!");
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update plan");
    }
  };

  const inputClass =
    "w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg px-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-[#00A3FF] transition-all shadow-sm";

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="xl"
      maxHeight="xl"
      hideScrollbar={false}
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
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
            <div className="space-y-0.5">
              <h4 className="text-[14px] font-bold text-headings">Plan Status</h4>
              <p className="text-[12px] text-[#667085]">Determine if this plan is currently active.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                isActive ? "bg-[#00A3FF]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Plan Name (Read Only as it's not in PATCH schema) */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-name" className="text-[14px] text-[#404040]">
              Plan Name
            </Label>
            <input
              id="plan-name"
              title="Plan Name"
              value={planName}
              disabled
              className={`${inputClass} bg-gray-50 cursor-not-allowed`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="plan-price" className="text-[14px] text-[#404040]">
                Price
              </Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] text-[16px] font-medium">
                  {currency === "USD" ? "$" : currency}
                </span>
                <input
                  id="plan-price"
                  type="text"
                  title="Plan Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`${inputClass} pl-8`}
                />
              </div>
            </div>

            {/* Devices */}
            <div className="space-y-1.5">
              <Label htmlFor="plan-devices" className="text-[14px] text-[#404040]">
                Device Limit
              </Label>
              <input
                id="plan-devices"
                type="number"
                title="Device Limit"
                value={devices}
                onChange={(e) => setDevices(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="plan-description" className="text-[14px] text-[#404040]">
              Description
            </Label>
            <textarea
              id="plan-description"
              title="Plan Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[80px] resize-none py-3`}
            />
          </div>

          {/* Storage & Templates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="plan-storage" className="text-[14px] text-[#404040]">
                Storage (GB)
              </Label>
              <input
                id="plan-storage"
                type="number"
                title="Storage Limit"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plan-templates" className="text-[14px] text-[#404040]">
                Template Limit
              </Label>
              <input
                id="plan-templates"
                type="number"
                title="Template Limit"
                value={templates}
                onChange={(e) => setTemplates(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Upload Limits */}
          <div className="space-y-3 pt-2">
            <Label className="text-[14px] font-bold text-headings">Upload Limits</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="limit-photo" className="text-[12px] text-[#667085]">Photo</Label>
                <input
                  id="limit-photo"
                  type="number"
                  value={uploadLimits.photo}
                  onChange={(e) => setUploadLimits(prev => ({ ...prev, photo: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="limit-audio" className="text-[12px] text-[#667085]">Audio</Label>
                <input
                  id="limit-audio"
                  type="number"
                  value={uploadLimits.audio}
                  onChange={(e) => setUploadLimits(prev => ({ ...prev, audio: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="limit-video" className="text-[12px] text-[#667085]">Video</Label>
                <input
                  id="limit-video"
                  type="number"
                  value={uploadLimits.video}
                  onChange={(e) => setUploadLimits(prev => ({ ...prev, video: e.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-3 pt-2">
            <Label className="text-[14px] font-bold text-headings">Features</Label>
            <div className="flex gap-2">
              <input
                placeholder="Add a feature..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="p-2.5 bg-[#00A3FF] text-white rounded-lg hover:bg-[#00A3FF]/90 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg border border-[#F2F4F7] dark:border-gray-800">
                  <span className="text-[14px] text-[#404040] dark:text-gray-300">{feature}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {features.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-2">No features added yet.</p>
              )}
            </div>
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default EditPlanDialog;
