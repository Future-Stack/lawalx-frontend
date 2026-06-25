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
      <DialogContent className="max-w-[340px] w-full p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 z-[11000] shadow-2xl flex flex-col items-center text-center gap-2">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 mb-2 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
          Upload Limit Reached
        </DialogTitle>
        
        <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your current Free Plan allows up to 2 images, 2 videos, and 2 audio files only. Please upgrade your plan to upload more content.
        </DialogDescription>
        
        <div className="w-full mt-4">
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
