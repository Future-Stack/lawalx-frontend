/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BaseDialog from "@/common/BaseDialog";
import { AlertTriangle } from "lucide-react";

interface DeleteTaxDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: any;
}

const DeleteTaxDialog = ({
  open,
  setOpen,
  data,
}: DeleteTaxDialogProps) => {
  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title=""
      description=""
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center space-y-6 pt-2 pb-4">
        {/* Warning Icon - Custom Square styling as per UI */}
        <div className="w-16 h-16 rounded-xl bg-[#FFF9E5] flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-10 bg-yellow-400 blur-xl rounded-full" />
          <AlertTriangle className="w-10 h-10 text-[#FACC15]" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-[24px] font-bold text-headings leading-tight">
            Warning
          </h2>
          <p className="text-[#667085] text-[16px] max-w-[280px]">
            Are you sure you want to delete this Tax
          </p>
        </div>

        {/* Custom Joined Buttons as per UI */}
        <div className="flex w-full mt-4 max-w-[320px] rounded-xl border border-[#D0D5DD] dark:border-gray-800 overflow-hidden shadow-sm">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-3 bg-white dark:bg-gray-950 hover:bg-gray-50 text-[18px] font-bold text-headings transition-all cursor-pointer border-r border-[#D0D5DD] dark:border-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={() => setOpen(false)}
            className="flex-1 py-3 bg-[#F04438] hover:bg-[#D92D20] text-[18px] font-bold text-white transition-all cursor-pointer relative shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)]"
          >
            Delete
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default DeleteTaxDialog;
