import { X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useGetSingleDeviceDataQuery, useRenameDeviceMutation } from "@/redux/api/users/devices/devices.api";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deviceId?: string;
  initialName?: string;
}

export default function RenameDeviceModal({ isOpen, onClose, deviceId, initialName }: Props) {
  const { data: deviceData, isLoading: isFetching } = useGetSingleDeviceDataQuery(
    { id: deviceId || "" },
    { skip: !isOpen || !deviceId }
  );
  const [renameDeviceApi, { isLoading: isRenaming }] = useRenameDeviceMutation();

  const [name, setName] = useState(initialName || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Synchronize state ONCE when modal opens or accurate data arrives
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (!initializedRef.current) {
      const fetchedName = deviceData?.data?.[0]?.name || deviceData?.data?.[0]?.deviceSerial;

      if (fetchedName) {
        setName(fetchedName);
        initializedRef.current = true;
      } else if (initialName && !name) {
        setName(initialName);
      }
    }
  }, [isOpen, deviceData, initialName]);

  // Handle focus
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current) {
          const val = inputRef.current.value;
          inputRef.current.setSelectionRange(val.length, val.length);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleRename = async () => {
    if (!deviceId) return;
    try {
      await renameDeviceApi({ id: deviceId, name: name.trim() }).unwrap();
      toast.success("Device renamed successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to rename device");
      console.error("Rename error:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/40 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 z-[101] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rename Device</h2>
            {isFetching && !initializedRef.current && (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            )}
          </div>
          <button onClick={onClose} disabled={isRenaming} className="cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="min-h-[56px] relative">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              initializedRef.current = true; // Stop any further sync once user starts typing
            }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 transition-all font-medium"
            placeholder="Enter device name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isRenaming) {
                handleRename();
              }
            }}
            disabled={isRenaming}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={isRenaming}
            className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors font-medium disabled:opacity-50 cursor-pointer shadow-customShadow"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={isRenaming || (isFetching && !name)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-70 min-w-[100px] flex items-center justify-center gap-2 cursor-pointer shadow-customShadow"
          >
            {isRenaming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}