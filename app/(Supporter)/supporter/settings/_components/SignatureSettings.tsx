import React, { useState, useRef } from "react";
import { Loader2, X, FileSignature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCreateAdditionalPaymentSignerMutation, useGetMySignersQuery } from "@/redux/api/admin/payments/additional-payment/additionalPaymentApi";

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "";

export default function SignatureSettings() {
  const [name, setName] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [createSigner, { isLoading }] = useCreateAdditionalPaymentSignerMutation();
  const { data: signersRes, isLoading: isLoadingSigners } = useGetMySignersQuery();

  const currentSigner = signersRes?.data?.[0];

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
      formData.append("type", "AUTHORIZED_BY");
      formData.append("image", signatureFile);

      const res = await createSigner(formData).unwrap();
      if (res.success) {
        toast.success(res.message || "Signature uploaded successfully");
        setName("");
        removeSignature();
      }
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to upload signature");
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6">
        Signature Settings
      </h3>

      {isLoadingSigners ? (
        <div className="flex items-center gap-2 mb-8 text-sm text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading current signature...
        </div>
      ) : currentSigner ? (
        <div className="mb-8 p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/30">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Current Signature</h4>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-full sm:w-[240px] h-[100px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`${BASE_URL}/${currentSigner.imageUrl}`} 
                alt="Current signature" 
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p><span className="font-medium text-gray-900 dark:text-white">Signer Name:</span> {currentSigner.name}</p>
              {currentSigner.createdAt && (
                <p className="text-xs text-gray-500 mt-1">Uploaded on {new Date(currentSigner.createdAt).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Upload New Signature</h4>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Signer Name
          </label>
          <Input
            type="text"
            placeholder="Name for the signature"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 focus-visible:ring-1 focus-visible:ring-[#1EA1F2] h-11"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Signature Image
          </label>

          <div
            className={`border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-3 relative
              ${
                signaturePreview
                  ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50"
                  : "border-gray-300 dark:border-gray-700 hover:border-[#1EA1F2] dark:hover:border-[#1EA1F2] bg-white dark:bg-gray-950 cursor-pointer"
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
                  <FileSignature className="w-6 h-6 text-[#1EA1F2]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload your signature
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    SVG, PNG, JPG or GIF (max. 2MB)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-[#1EA1F2] hover:bg-[#198CD6] text-white font-medium h-11 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Uploading..." : "Upload Signature"}
          </Button>
        </div>
      </div>
    </div>
  );
}
