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

        {/* Custom Joined Buttons as per UI */}
        <div className="flex w-full mt-4 max-w-[320px] rounded-xl border border-[#D0D5DD] dark:border-gray-800 overflow-hidden shadow-sm">
          <button
            onClick={() => setOpen(false)}
            disabled={isLoading}
            className="flex-1 py-3 bg-white dark:bg-gray-950 hover:bg-gray-50 text-[18px] font-bold text-headings transition-all cursor-pointer border-r border-[#D0D5DD] dark:border-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 py-3 bg-[#F04438] hover:bg-[#D92D20] text-[18px] font-bold text-white transition-all cursor-pointer relative shadow-[inset_0_4px_4px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2 disabled:opacity-50"
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
