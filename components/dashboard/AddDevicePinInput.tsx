import { QrCode } from "lucide-react";

interface AddDevicePinInputProps {
    pin: string;
    setPin: (pin: string) => void;
    onOpenScanner: () => void;
    handleAddDevice: (data: { pin: string; name?: string }) => void;
    selectedScreen: string;
}

const AddDevicePinInput = ({
    pin,
    setPin,
    onOpenScanner
}: AddDevicePinInputProps) => {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 min-w-[200px] gap-2">
                <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter the PIN or scan the QR code"
                    className="flex-1 px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                    type="button"
                    onClick={onOpenScanner}
                    className="p-3 border border-borderGray dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0 shadow-customShadow cursor-pointer"
                >
                    <QrCode className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
            </div>
        </div>
    );
};

export default AddDevicePinInput;