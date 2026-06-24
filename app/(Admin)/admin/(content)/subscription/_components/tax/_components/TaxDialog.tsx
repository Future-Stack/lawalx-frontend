"use client";

import { useEffect, useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Globe, Loader2 } from "lucide-react";
import {
  TaxRegion,
  useCreateTaxMutation,
  useUpdateTaxMutation,
} from "@/redux/api/admin/payments/tax/taxApi";
import { toast } from "sonner";

interface TaxDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "add" | "edit";
  data: TaxRegion | null;
}

const TaxDialog = ({ open, setOpen, mode, data }: TaxDialogProps) => {
  const [region, setRegion] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [createTax, { isLoading: isCreating }] = useCreateTaxMutation();
  const [updateTax, { isLoading: isUpdating }] = useUpdateTaxMutation();
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && data) {
        setRegion(data.region);
        setTaxRate(data.taxRate);
      } else {
        setRegion("");
        setTaxRate("");
      }
    }
  }, [mode, data, open]);

  const handleSave = async () => {
    if (!region.trim()) {
      toast.error("Tax region is required");
      return;
    }

    const parsedRate = Number(taxRate);
    if (Number.isNaN(parsedRate) || parsedRate < 0) {
      toast.error("Please enter a valid tax rate");
      return;
    }

    const payload = {
      region: region.trim(),
      taxRate: parsedRate,
    };

    try {
      if (mode === "add") {
        await createTax(payload).unwrap();
        toast.success("Tax region created successfully");
      } else if (mode === "edit" && data?.id) {
        await updateTax({ id: data.id, data: payload }).unwrap();
        toast.success("Tax region updated successfully");
      }
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to save tax region");
    }
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="xl"
      className="p-0 [&>div:first-child]:hidden"
    >
      <div className="flex h-full flex-col bg-navbarBg">
        {/* Header with Icon */}
        <div className="p-6 pb-0">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full border border-[#7F56D933] bg-[#7F56D90D] flex items-center justify-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#7F56D9]" />
              </div>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-headings leading-tight">
                {mode === "add" ? "Add New Tax" : "Edit Tax"}
              </h2>
              <p className="mt-1 text-[14px] text-muted">
                Configure tax region and percentage details.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-5 flex-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="tax-name"
              className="text-[14px] font-bold text-headings"
            >
              Tax
            </Label>
            <input
              id="tax-name"
              type="text"
              placeholder="e.g. California, USA"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-border bg-bgGray px-3.5 py-2.5 text-[16px] text-headings placeholder:text-muted shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-bgBlue disabled:opacity-50 dark:bg-gray-800"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="tax-price"
              className="text-[14px] font-bold text-headings"
            >
              Tax Rate
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-medium text-muted">
                %
              </span>
              <input
                id="tax-price"
                type="number"
                placeholder="7.5"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                disabled={isLoading}
                className="w-full rounded-lg border border-border bg-bgGray py-2.5 pl-8 pr-3.5 text-[16px] text-headings placeholder:text-muted shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-bgBlue disabled:opacity-50 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-border bg-bgGray p-6 dark:bg-gray-800/40">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="min-w-[100px] cursor-pointer rounded-lg border border-border bg-navbarBg px-4 py-2.5 text-[14px] font-bold text-headings shadow-sm transition-all hover:bg-bgGray dark:hover:bg-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-bgBlue px-8 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? "Add Tax" : "Update Tax"}
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default TaxDialog;
