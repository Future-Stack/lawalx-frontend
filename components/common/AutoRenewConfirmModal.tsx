"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

interface AutoRenewConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isEnabling: boolean;
}

export default function AutoRenewConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isEnabling,
}: AutoRenewConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 bg-white dark:bg-gray-900 border-none rounded-3xl overflow-hidden focus:outline-none shadow-2xl">
        <div className="p-8 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border mx-auto mb-6 shadow-customShadow ${
              isEnabling
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
            }`}
          >
            {isEnabling ? (
              <Info className="w-8 h-8 text-bgBlue" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-500" />
            )}
          </div>

          <DialogHeader className="p-0 space-y-2">
            <DialogTitle className="text-xl font-bold text-headings text-center">
              {isEnabling ? "Enable Auto Renew?" : "Disable Auto Renew?"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted text-center px-4">
              {isEnabling
                ? "Your subscription will automatically renew at the end of the current billing cycle, ensuring uninterrupted access."
                : "Your subscription will not renew automatically. You may lose access at the end of the current billing cycle."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 flex items-center gap-4">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12 font-bold border-border hover:bg-gray-50 shadow-customShadow text-body dark:hover:bg-gray-800"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className={`flex-1 rounded-xl h-12 font-bold text-white shadow-customShadow ${
                isEnabling
                  ? "bg-bgBlue hover:bg-blue-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isEnabling
                ? "Enable"
                : "Disable"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
