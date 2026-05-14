import { useEffect, useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { TvMinimal, Loader2 } from "lucide-react";
import {
  useCreateScreenSizeMutation,
  useUpdateScreenSizeMutation,
  ScreenSize,
} from "@/redux/api/admin/payments/screenManagement/screenSizeApi";
import { toast } from "sonner";

interface ScreenSizeDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "add" | "edit";
  data: ScreenSize | null;
}

const ScreenSizeDialog = ({
  open,
  setOpen,
  mode,
  data,
}: ScreenSizeDialogProps) => {
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");

  const [createScreenSize, { isLoading: isCreating }] =
    useCreateScreenSizeMutation();
  const [updateScreenSize, { isLoading: isUpdating }] =
    useUpdateScreenSizeMutation();

  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (mode === "edit" && data) {
        setSize(data.size.toString());
        setPrice(data.price.toString());
      } else {
        setSize("");
        setPrice("");
      }
    }
  }, [mode, data, open]);

  const handleSave = async () => {
    if (!size || !price) {
      toast.error("Please fill in all fields");
      return;
    }

    const payload = {
      size: Number(size),
      price: Number(price),
    };

    try {
      if (mode === "add") {
        await createScreenSize(payload).unwrap();
        toast.success("Screen size created successfully");
      } else if (mode === "edit" && data?.id) {
        await updateScreenSize({ id: data.id, data: payload }).unwrap();
        toast.success("Screen size updated successfully");
      }
      setOpen(false);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to save screen size");
    }
  };

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
                <TvMinimal className="w-4 h-4 text-[#7F56D9]" />
              </div>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-headings leading-tight">
                {mode === "add" ? "Add New Screen Size" : "Edit Screen Size"}
              </h2>
              <p className="text-[#667085] text-[14px] mt-1">
                {mode === "add"
                  ? "Create a new screen size configuration."
                  : "Update the existing screen size details."}
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-5 flex-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="screen-size"
              className="text-[14px] font-bold text-headings"
            >
              Screen Size
            </Label>
            <input
              id="screen-size"
              type="number"
              placeholder="42"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={isLoading}
              className="w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg px-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-[#00A3FF] transition-all shadow-sm disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="screen-price"
              className="text-[14px] font-bold text-headings"
            >
              Price
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667085] text-[16px] font-medium">
                $
              </span>
              <input
                id="screen-price"
                type="number"
                placeholder="256.25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isLoading}
                className="w-full bg-white dark:bg-gray-950 border border-[#D0D5DD] dark:border-gray-800 rounded-lg pl-8 pr-3.5 py-2.5 text-[16px] text-headings placeholder:text-[#667085] focus:outline-none focus:ring-1 focus:ring-[#00A3FF] transition-all shadow-sm disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-[#F2F4F7] dark:border-gray-800 bg-[#FCFCFD] dark:bg-gray-900/20">
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="px-4 py-2.5 min-w-[100px] rounded-lg border border-[#D0D5DD] dark:border-gray-700 font-bold text-[14px] text-headings hover:bg-gray-50 transition-all cursor-pointer shadow-sm bg-white dark:bg-gray-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-2.5 min-w-[120px] rounded-lg bg-[#00A3FF] text-white font-bold text-[14px] hover:bg-[#00A3FF]/90 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === "add" ? "Add Size" : "Update Size"}
            </button>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

export default ScreenSizeDialog;
