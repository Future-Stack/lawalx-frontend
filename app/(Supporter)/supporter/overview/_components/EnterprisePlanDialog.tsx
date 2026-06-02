"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/redux/api/enterpriseRequests/enterpriseRequestsApi";
import { Loader2, Trash2, Save } from "lucide-react";
import type { EnterpriseSubscriptionInfoPayload } from "@/redux/api/enterpriseRequests/enterpriseRequests.type";

interface EnterprisePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string | null;
}

export default function EnterprisePlanDialog({
  open,
  onOpenChange,
  ticketId,
}: EnterprisePlanDialogProps) {
  const { data: planData, isLoading: isFetching } =
    useGetEnterpriseSubscriptionInfoQuery(ticketId || "", {
      skip: !open || !ticketId,
    });

  const [updatePlan, { isLoading: isUpdating }] =
    useUpdateEnterpriseSubscriptionInfoMutation();
  const [deletePlan, { isLoading: isDeleting }] =
    useDeleteEnterpriseSubscriptionInfoMutation();

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

  const [featuresText, setFeaturesText] = useState("");

  useEffect(() => {
    if (planData?.data) {
      setFormData(planData.data);
      setFeaturesText((planData.data.features || []).join("\n"));
    }
  }, [planData]);

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!ticketId) return;
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        features: featuresText.split("\n").filter((f) => f.trim() !== ""),
        price: Number(formData.price),
        screenSize: Number(formData.screenSize),
        deviceLimit: Number(formData.deviceLimit),
        storageLimitGb: Number(formData.storageLimitGb),
        templateLimit: Number(formData.templateLimit),
        photoLimit: Number(formData.photoLimit),
        audioLimit: Number(formData.audioLimit),
        videoLimit: Number(formData.videoLimit),
      };
      const res = (await updatePlan({
        ticketId,
        data: payload,
      }).unwrap()) as any;
      if (res?.success) {
        toast.success(res?.message || "Enterprise plan updated successfully");
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to update enterprise plan");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "An error occurred while updating the plan",
      );
    }
  };

  const handleDelete = async () => {
    if (!ticketId) return;
    if (!confirm("Are you sure you want to delete this enterprise plan?")) return;
    try {
      const res = (await deletePlan(ticketId).unwrap()) as any;
      if (res?.success) {
        toast.success(res?.message || "Enterprise plan deleted successfully");
        onOpenChange(false);
      } else {
        toast.error(res?.message || "Failed to delete enterprise plan");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "An error occurred while deleting the plan",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6 bg-white dark:bg-gray-900 border-border max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Enterprise Plan Details
          </DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Plan Name</Label>
                <Select
                  value={formData.name}
                  onValueChange={(val) => handleInputChange("name", val)}
                >
                  <SelectTrigger className="bg-white dark:bg-gray-800">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent className="z-[99999]">
                    <SelectItem value="FREE_TRIAL">Free Trial</SelectItem>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="BUSINESS">Business</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="bg-white dark:bg-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Screen Size</Label>
                <Input
                  type="number"
                  value={formData.screenSize}
                  onChange={(e) =>
                    handleInputChange("screenSize", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Device Limit</Label>
                <Input
                  type="number"
                  value={formData.deviceLimit}
                  onChange={(e) =>
                    handleInputChange("deviceLimit", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Storage Limit (GB)</Label>
                <Input
                  type="number"
                  value={formData.storageLimitGb}
                  onChange={(e) =>
                    handleInputChange("storageLimitGb", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Template Limit</Label>
                <Input
                  type="number"
                  value={formData.templateLimit}
                  onChange={(e) =>
                    handleInputChange("templateLimit", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Photo Limit</Label>
                <Input
                  type="number"
                  value={formData.photoLimit}
                  onChange={(e) =>
                    handleInputChange("photoLimit", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Audio Limit</Label>
                <Input
                  type="number"
                  value={formData.audioLimit}
                  onChange={(e) =>
                    handleInputChange("audioLimit", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Video Limit</Label>
                <Input
                  type="number"
                  value={formData.videoLimit}
                  onChange={(e) =>
                    handleInputChange("videoLimit", e.target.value)
                  }
                  className="bg-white dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Features (One per line)</Label>
              <Textarea
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="min-h-[100px] bg-white dark:bg-gray-800"
                placeholder="Dedicated support&#10;Unlimited scale"
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Plan
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isDeleting || isUpdating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
