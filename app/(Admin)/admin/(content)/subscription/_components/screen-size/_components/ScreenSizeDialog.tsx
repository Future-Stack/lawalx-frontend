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
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getCurrencySymbol } from "@/lib/currencyUtils";

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

  const currency = useSelector((state: RootState) => state.settings.currency);
  const currencySymbol = getCurrencySymbol(currency);

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
      className="p-0 [&>div:first-child]:hidden"
    >
      <div className="flex h-full flex-col bg-navbarBg">
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
              <p className="mt-1 text-[14px] text-muted">
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
              className="w-full rounded-lg border border-border bg-bgGray px-3.5 py-2.5 text-[16px] text-headings placeholder:text-muted shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-bgBlue disabled:opacity-50 dark:bg-gray-800"
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
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-medium text-muted">
                {currencySymbol}
              </span>
              <input
                id="screen-price"
                type="number"
                placeholder="256.25"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
              className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-bgBlue px-8 py-2.5 text-[14px] font-bold text-white shadow-sm transition-all hover:bg-blue-500 disabled:opacity-50"
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
