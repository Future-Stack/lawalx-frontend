/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRenameDeviceMutation } from "@/redux/api/users/devices/devices.api";
import { toast } from "sonner";

interface RenameProps {
  isOpen: boolean;
  onClose: () => void;
  device: any;
}

export function RecentDeviceRenameModal({ isOpen, onClose, device }: RenameProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [renameDeviceApi, { isLoading }] = useRenameDeviceMutation();

  useEffect(() => {
    if (isOpen && device) {
      setName(device.name || device.device || "");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, device]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const deviceId = device?.id || "";
    if (!deviceId) {
      toast.error("Device ID not found");
      return;
    }
    try {
      await renameDeviceApi({ deviceId, name: name.trim() }).unwrap();
      toast.success("Device renamed successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to rename device");
      console.error("Rename error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Rename Device</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Enter a new display name for this device.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 transition-all font-medium text-sm"
            placeholder="Device name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSave();
              }
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium disabled:opacity-50 cursor-pointer shadow-customShadow text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !name.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 min-w-[100px] flex items-center justify-center gap-2 cursor-pointer shadow-customShadow text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveProps {
  isOpen: boolean;
  onClose: () => void;
  device: any;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function RecentDeviceRemoveModal({ isOpen, onClose, device, onConfirm, isLoading }: RemoveProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent className="max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-500">Remove Device</DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Are you sure you want to remove <span className="font-semibold text-gray-900 dark:text-white">&quot;{device?.name || device?.device || 'this device'}&quot;</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium disabled:opacity-50 cursor-pointer shadow-customShadow text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 min-w-[100px] flex items-center justify-center gap-2 cursor-pointer shadow-customShadow text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
