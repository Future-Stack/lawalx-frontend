"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface UploadLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadLimitModal({ isOpen, onClose }: UploadLimitModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full md:w-[550px] p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 z-[12000] shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center text-center gap-2">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 mb-2 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
          Upload Limit Reached
        </DialogTitle>

        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your current Free Plan allows up to 2 images, 2 videos, and 2 audio files only. Please upgrade your plan to upload more content.
        </DialogDescription>
        
        <div className="w-full mt-4 flex items-center justify-between gap-2 md:gap-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 text-body dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold rounded-xl shadow-customShadow border border-border transition-all cursor-pointer text-sm"
          >
            Cancel
          </button>
          <Link
            href="/choose-plan"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center py-2.5 px-4 bg-bgBlue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-customShadow transition-all cursor-pointer text-sm"
          >
            Go to Subscription
          </Link>
        </div>
      </DialogContent> 
    </Dialog>
  );
}
