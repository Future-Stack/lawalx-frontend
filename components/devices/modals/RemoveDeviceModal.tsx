import { X, Trash2, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deviceName?: string;
  onConfirm?: () => void;
  isLoading?: boolean;
}

export default function RemoveDeviceModal({ isOpen, onClose, deviceName, onConfirm, isLoading }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/40 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl p-6 border border-gray-200 dark:border-gray-700 z-[101] overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Remove Device
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8">
          Are you sure you want to remove <strong className="text-gray-900 dark:text-white">{deviceName}</strong>?
          All content will be removed from this device.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-customShadow"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] justify-center cursor-pointer shadow-customShadow"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" /> Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}