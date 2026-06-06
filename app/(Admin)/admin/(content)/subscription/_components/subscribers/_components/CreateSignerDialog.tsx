import React, { useState, useRef } from "react";
import BaseDialog from "@/common/BaseDialog";
import { Label } from "@/components/ui/label";
import { Loader2, X, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { useCreateAdditionalPaymentSignerMutation } from "@/redux/api/admin/payments/additional-payment/additionalPaymentApi";

interface CreateSignerDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const CreateSignerDialog = ({ open, setOpen }: CreateSignerDialogProps) => {
  const [name, setName] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createSigner, { isLoading }] =
    useCreateAdditionalPaymentSignerMutation();

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignatureFile(file);
      setSignaturePreview(URL.createObjectURL(file));
    }
  };

  const removeSignature = () => {
    setSignatureFile(null);
    setSignaturePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please provide a name.");
      return;
    }
    if (!signatureFile) {
      toast.error("Please upload a signature.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", "APPROVED_BY");
      formData.append("image", signatureFile);

      const res = await createSigner(formData).unwrap();
      if (res.success) {
        toast.success(res.message || "Signer uploaded successfully");
        setName("");
        removeSignature();
        setOpen(false);
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to upload signer");
    }
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title="Upload Signer"
      description="Upload a new signature for 'Approved By'."
      maxWidth="md"
    >
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <Label htmlFor="signer-name" className="text-[14px] font-semibold text-headings">
            Name
          </Label>
          <input
            id="signer-name"
            type="text"
            placeholder="Name for the signature"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-[14px] text-headings shadow-sm focus:outline-none focus:ring-1 focus:ring-bgBlue transition-all"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[14px] font-semibold text-headings">
            Signature Image
          </Label>
          <div
            className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-3 relative
              ${
                signaturePreview
                  ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                  : "border-gray-300 dark:border-gray-700 hover:border-bgBlue dark:hover:border-bgBlue bg-white dark:bg-gray-950 cursor-pointer"
              }`}
            onClick={() => !signaturePreview && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleSignatureUpload}
            />

            {signaturePreview ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full max-w-[240px] h-[100px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={signaturePreview}
                    alt="Signature preview"
                    className="max-w-full max-h-full object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSignature();
                    }}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-md transition-colors"
                    title="Remove signature"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 font-medium">
                  {signatureFile?.name}
                </p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <FileSignature className="w-6 h-6 text-bgBlue" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload signature
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    SVG, PNG, JPG or GIF (max. 2MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto px-6 py-2 border border-gray-200 dark:border-gray-800 text-headings text-[14px] font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-2 bg-bgBlue text-white text-[14px] font-bold rounded-xl hover:bg-bgBlue/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default CreateSignerDialog;
