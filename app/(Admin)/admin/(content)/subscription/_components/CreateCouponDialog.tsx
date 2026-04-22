"use client";

import React, { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import BaseSelect from "@/common/BaseSelect";
import { Sparkles, Gift, Loader2 } from "lucide-react";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
  CouponItem,
} from "@/redux/api/admin/payments/coupons/couponsApi";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateCouponDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode?: boolean;
  initialData?: CouponItem | null;
}

const CreateCouponDialog = ({
  open,
  setOpen,
  editMode,
  initialData,
}: CreateCouponDialogProps) => {
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState("15");
  const [useLimit, setUseLimit] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState("");
  const [applicablePlans, setApplicablePlans] = useState<string[]>([]);

  useEffect(() => {
    if (open && initialData && editMode) {
      setName(initialData.name || "");
      setCode(initialData.code || "");
      setDiscountType(initialData.discountType || "PERCENTAGE");
      setDiscountValue(initialData.discountValue || "15");
      setUseLimit(initialData.useLimit || 100);
      setExpiryDate(
        initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().split("T")[0]
          : "",
      );
      setApplicablePlans(initialData.applicablePlans || []);
    } else if (open && !editMode) {
      setName("");
      setCode("");
      setDiscountType("PERCENTAGE");
      setDiscountValue("15");
      setUseLimit(100);
      setExpiryDate("");
      setApplicablePlans([]);
    }
  }, [open, initialData, editMode]);

  const inputClass =
    "w-full bg-input border border-border rounded-lg px-3 py-3 h-12 text-headings focus:outline-none focus:ring-1 focus:ring-bgBlue";

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
  };

  const handlePlanToggle = (plan: string) => {
    setApplicablePlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a coupon name");
      return;
    }
    if (!code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    if (!expiryDate) {
      toast.error("Please select an expiry date");
      return;
    }
    if (applicablePlans.length === 0) {
      toast.error("Please select at least one applicable plan");
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Please enter a valid discount value");
      return;
    }

    const expiryISO = new Date(expiryDate).toISOString();

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: value,
      useLimit,
      expiryDate: expiryISO,
      applicablePlans,
    };

    try {
      if (editMode && initialData?.id) {
        await updateCoupon({ id: initialData.id, data: payload }).unwrap();
        toast.success("Coupon updated successfully!");
      } else {
        await createCoupon(payload).unwrap();
        toast.success("Coupon created successfully!");
      }
      setOpen(false);
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message ||
          `Failed to ${editMode ? "update" : "create"} coupon`,
      );
    }
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title={editMode ? "Edit Coupon" : "Create a Coupon"}
      description="Generate a new promotional code with custom discount settings and usage restrictions."
      maxWidth="2xl"
    >
      <div className="space-y-4 md:space-y-6 px-1">
        {/* Name & Code */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-headings font-medium">Name</Label>
            <input
              placeholder="AEION"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-headings font-medium">Coupon Code</Label>
            <div className="flex gap-2">
              <input
                placeholder="AEION"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={generateCode}
                className="h-12 px-4 rounded-lg bg-bgBlue text-white font-medium flex items-center gap-2 hover:bg-bgBlue/90 transition cursor-pointer shadow-customShadow"
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-headings font-medium">Discount Type</Label>
            <BaseSelect
              options={[
                { label: "Percentage %", value: "PERCENTAGE" },
                { label: "Fixed Amount", value: "FIXED" },
              ]}
              value={discountType}
              onChange={(value) =>
                setDiscountType(value as "PERCENTAGE" | "FIXED")
              }
              showLabel={false}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-headings font-medium">
              {discountType === "PERCENTAGE" ? "Percentage %" : "Amount"}
            </Label>
            <input
              type="number"
              min="0"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Usage & Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-headings font-medium">Use Limit</Label>
            <input
              type="number"
              min="1"
              value={useLimit}
              onChange={(e) => setUseLimit(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-headings font-medium">Expiry Date</Label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Applicable Plans */}
        <div className="space-y-3">
          <Label className="text-headings font-medium">Applicable Plans</Label>
          <div className="grid grid-cols-2 gap-3">
            {["FREE_TRIAL", "STARTER", "BUSINESS", "ENTERPRISE"].map((plan) => (
              <div key={plan} className="flex items-center space-x-2">
                <Checkbox
                  id={`plan-${plan}`}
                  checked={applicablePlans.includes(plan)}
                  onCheckedChange={() => handlePlanToggle(plan)}
                />
                <label
                  htmlFor={`plan-${plan}`}
                  className="text-sm font-medium text-headings cursor-pointer"
                >
                  {plan.replace("_", " ")}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isCreating || isUpdating}
            className="px-3 py-2 md:px-4 md:py-3 border border-border rounded-lg font-medium shadow-customShadow cursor-pointer hover:bg-gray-100 hover:text-bgBlue text-headings transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isCreating || isUpdating}
            className="px-3 py-2 md:px-4 md:py-3 bg-bgBlue text-white rounded-lg font-medium hover:bg-bgBlue/90 transition flex items-center gap-2 shadow-customShadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {editMode ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>
                <Gift className="w-5 h-5" />
                {editMode ? "Save Changes" : "Create Coupon"}
              </>
            )}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default CreateCouponDialog;
