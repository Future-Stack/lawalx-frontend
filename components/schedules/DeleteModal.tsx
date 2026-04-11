export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  scheduleName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  scheduleName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Delete Schedule
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {scheduleName}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition shadow-customShadow cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition shadow-customShadow cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};