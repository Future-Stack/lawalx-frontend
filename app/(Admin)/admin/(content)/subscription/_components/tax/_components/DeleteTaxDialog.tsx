"use client";

import BaseDialog from "@/common/BaseDialog";
import { AlertTriangle, Loader2 } from "lucide-react";
import { TaxRegion, useDeleteTaxMutation } from "@/redux/api/admin/payments/tax/taxApi";
import { toast } from "sonner";

interface DeleteTaxDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  data: TaxRegion | null;
}

const DeleteTaxDialog = ({
  open,
  setOpen,
  data,
}: DeleteTaxDialogProps) => {
  const [deleteTax, { isLoading }] = useDeleteTaxMutation();

  const handleDelete = async () => {
    if (!data?.id) return;

    try {
      await deleteTax(data.id).unwrap();
      toast.success("Tax region deleted successfully");
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to delete tax region");
    }
  };

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
            Are you sure you want to delete tax region{" "}
            <span className="font-bold text-headings">{data?.region}</span>?
          </p>
        </div>

        {/* Separated Buttons as per new UI */}
        <div className="flex justify-center gap-4 w-full mt-4 max-w-[320px]">
          <button
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-white border border-[#D0D5DD] dark:border-gray-700 dark:bg-transparent rounded-xl text-[16px] font-semibold text-[#344054] dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-[#EF4444] rounded-xl text-[16px] font-semibold text-white hover:bg-[#DC2626] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default DeleteTaxDialog;
