"use client";

import React, { useState, useEffect } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import BaseSelect from "@/common/BaseSelect";
import { Sparkles, Gift, Loader2, CalendarDays } from "lucide-react";
import {
  useCreateCouponMutation,
  useUpdateCouponMutation,
  CouponItem,
} from "@/redux/api/admin/payments/coupons/couponsApi";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

const APPLICABLE_PLAN_OPTIONS = [
  { label: "Free Trial", value: "FREE_TRIAL" },
  { label: "Basic", value: "BASIC" },
  { label: "Business", value: "BUSINESS" },
  { label: "Premium", value: "PREMIUM" },
] as const;

const formatDateToYMD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseYMDToLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const ymdToUtcISOString = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toISOString();
};

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

  const selectedExpiryDate = expiryDate
    ? parseYMDToLocalDate(expiryDate)
    : undefined;

  const handleExpiryDateSelect = (date?: Date) => {
    if (!date) return;
    setExpiryDate(formatDateToYMD(date));
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

    const expiryISO = ymdToUtcISOString(expiryDate);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coupon-name" className="text-headings font-medium">Name</Label>
            <input
              id="coupon-name"
              title="Coupon Name"
              placeholder="e.g. SUMMER20"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coupon-code" className="text-headings font-medium">Coupon Code</Label>
            <div className="flex gap-2">
              <input
                id="coupon-code"
                title="Coupon Code"
                placeholder="e.g. DISCOUNT50"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="discount-value" className="text-headings font-medium">
              {discountType === "PERCENTAGE" ? "Percentage %" : "Amount"}
            </Label>
            <input
              id="discount-value"
              type="number"
              min="0"
              title={discountType === "PERCENTAGE" ? "Discount Percentage" : "Discount Amount"}
              placeholder={discountType === "PERCENTAGE" ? "15" : "100"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Usage & Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="use-limit" className="text-headings font-medium">Use Limit</Label>
            <input
              id="use-limit"
              type="number"
              min="1"
              title="Usage Limit"
              placeholder="100"
              value={useLimit}
              onChange={(e) => setUseLimit(Number(e.target.value))}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry-date" className="text-headings font-medium">Expiry Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="expiry-date"
                  type="button"
                  className={`${inputClass} flex items-center justify-between text-left`}
                >
                  <span className={expiryDate ? "text-headings" : "text-muted"}>
                    {expiryDate
                      ? selectedExpiryDate?.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Select expiry date"}
                  </span>
                  <CalendarDays className="h-4 w-4 text-muted shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto rounded-md border border-border bg-white p-0 shadow-md dark:bg-[#171717] [&_[data-slot=calendar]]:!bg-white dark:[&_[data-slot=calendar]]:!bg-[#171717]"
                align="start"
              >
                <Calendar
                  className="rounded-md !bg-white dark:!bg-[#171717]"
                  mode="single"
                  selected={selectedExpiryDate}
                  onSelect={handleExpiryDateSelect}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Applicable Plans */}
        <div className="space-y-3">
          <Label className="text-headings font-medium">Applicable Plans</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APPLICABLE_PLAN_OPTIONS.map((plan) => {
              const checked = applicablePlans.includes(plan.value);
              return (
              <label
                key={plan.value}
                htmlFor={`plan-${plan.value}`}
                className={`flex items-center gap-3 rounded-lg border px-3 py-3 cursor-pointer transition-all ${
                  checked
                    ? "border-bgBlue bg-blue-50/60 dark:bg-blue-950/30 shadow-customShadow"
                    : "border-border hover:border-bgBlue/40"
                }`}
              >
                <Checkbox
                  id={`plan-${plan.value}`}
                  checked={checked}
                  onCheckedChange={() => handlePlanToggle(plan.value)}
                  className={`size-5 data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue ${
                    checked ? "border-bgBlue" : ""
                  }`}
                />
                <span
                  className={`text-sm font-semibold ${
                    checked ? "text-bgBlue" : "text-headings"
                  }`}
                >
                  {plan.label}
                </span>
              </label>
            )})}
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
