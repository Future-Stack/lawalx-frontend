/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";

interface TaxDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "add" | "edit";
  data: any;
}

const TaxDialog = ({
  open,
  setOpen,
  mode,
  data,
}: TaxDialogProps) => {
  const [tax, setTax] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (mode === "edit" && data) {
      setTax(data.tax);
      setPrice(data.taxRate.replace("%", ""));
    } else {
      setTax("");
      setPrice("");
    }
  }, [mode, data, open]);

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="xl"
      className="p-0"
    >
      <div className="flex flex-col h-full">
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
                {mode === "add" ? "Add New Tax" : "Edit New Tax"}
              </h2>
              <p className="text-[#667085] text-[14px] mt-1">
                Configure the plan details, limits, and features.
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
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              className="w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg px-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="tax-price"
              className="text-[14px] font-bold text-headings"
            >
              Price
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] text-[16px] font-medium">
                $
              </span>
              <input
                id="tax-price"
                type="text"
                placeholder="256.25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg pl-8 pr-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-[#F2F4F7] dark:border-gray-800 bg-[#FCFCFD] dark:bg-gray-900/20">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 min-w-[100px] rounded-lg border border-[#D0D5DD] dark:border-gray-700 font-bold text-[14px] text-headings hover:bg-gray-50 transition-all cursor-pointer shadow-sm bg-white dark:bg-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-8 py-2.5 rounded-lg bg-bgBlue text-white font-bold text-[14px] hover:bg-bgBlue/90 transition-all cursor-pointer shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default TaxDialog;
