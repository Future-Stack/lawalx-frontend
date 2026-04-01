"use client";

import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import dynamic from "next/dynamic";

const QrScanner = dynamic(() => import("@/components/common/QrScanner"), {
  ssr: false,
});
import AddDevicePinInput from "./AddDevicePinInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddDeviceMutation } from "@/redux/api/users/devices/devices.api";
import { useGetAllProgramsDataQuery } from "@/redux/api/users/programs/programs.api";
import { toast } from "sonner";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
  const [addDevice] = useAddDeviceMutation();
  const { data: programsData, isLoading: isLoadingPrograms } = useGetAllProgramsDataQuery();
  const [pin, setPin] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("Select a Program");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const programOptions = useMemo(() => {
    const fetched = programsData?.data?.map(p => ({ id: p.id, name: p.name })) || [];
    return [{ id: "all-programs", name: "Select a Program" }, ...fetched];
  }, [programsData]);

  // Handle body scroll locking
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;


  const handleAddDevice = async ({ pin, name }: { pin: string, name?: string }) => {
    try {
      // Only send deviceName as name, not selectedScreen
      const res = await addDevice({ pin, name }).unwrap();
      console.log(res);
      if (res.success) {
        setPin(""); // Clear the PIN input
        setDeviceName(""); // Clear the device name input
        onClose();
        toast.success(res.message || "Device added successfully");
      }
    } catch (err: any) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to add device");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] border border-gray-200 dark:border-gray-700 z-[101] flex flex-col overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border shrink-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-Headings dark:text-white">
            Add New Device
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-gray-100 md:p-2 p-1 rounded-full dark:hover:text-gray-300 transition-colors self-end sm:self-auto cursor-pointer dark:hover:text-red-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto">
          {/* Steps */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-3.5 sm:left-4 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            <div className="space-y-4 sm:space-y-5 relative">
              {/* Step 1 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-qrBackground dark:bg-gray-800 border border-borderGray dark:border-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0 mt-0.5 relative z-10">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-Headings dark:text-white">
                    Open Tape App
                  </h3>
                  <p className="text-xs sm:text-sm text-MutedText dark:text-gray-400 mt-0.5 sm:mt-1">
                    Open Tape app on your Smart TV or browser.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-qrBackground dark:bg-gray-800 border border-borderGray dark:border-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0 mt-0.5 relative z-10">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-Headings dark:text-white">
                    Set Up the Device
                  </h3>
                  <p className="text-xs sm:text-sm text-MutedText dark:text-gray-400 mt-0.5 sm:mt-1">
                    Set Up your device Providing a name, Location and Storage usage Limit.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-qrBackground dark:bg-gray-800 border border-borderGray dark:border-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0 mt-0.5 relative z-10">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-Headings dark:text-white">
                    Enter the PIN
                  </h3>
                  <p className="text-xs sm:text-sm text-MutedText dark:text-gray-400 mt-0.5 sm:mt-1">
                    A pairing screen will appear—enter the PIN or scan the QR code shown on your device.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-qrBackground dark:bg-gray-800 border border-borderGray dark:border-gray-600 text-gray-600 dark:text-gray-400 flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0 mt-0.5 relative z-10">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-Headings dark:text-white">
                    Start Displaying
                  </h3>
                  <p className="text-xs sm:text-sm text-MutedText dark:text-gray-400 mt-0.5 sm:mt-1">
                    Your screen is now connected and ready to go!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Input PIN
            </label>
            {/* PIN Input */}
            <AddDevicePinInput
              pin={pin}
              setPin={setPin}
              onOpenScanner={() => setIsScannerOpen(true)}
              handleAddDevice={handleAddDevice}
              selectedScreen={selectedScreen}
            />
          </div>

               {/* Device Name Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Device Name
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={e => setDeviceName(e.target.value)}
              placeholder="Enter device name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
          </div>

          {/* Select Screen Dropdown (commented out, not sent anymore) */}

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Select a Program
            </label>
            <Select
              value={selectedScreen}
              onValueChange={setSelectedScreen}
              disabled={isLoadingPrograms}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingPrograms ? "Loading programs..." : "Select a Program"} />
              </SelectTrigger>
              <SelectContent>
                {programOptions.map((option) => (
                  <SelectItem key={option.id} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
                {!isLoadingPrograms && programsData?.data?.length === 0 && (
                  <div className="py-2 px-8 text-sm text-gray-400 italic pointer-events-none">
                    No programs found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 mx-5 py-4 sm:py-5 border-t border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={onClose}
            className="px-5 sm:px-6 py-2 sm:py-2.5 border border-border hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium text-sm sm:text-base text-gray-700 dark:text-gray-300 transition-colors cursor-pointer shadow-customShadow"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddDevice({ pin, name: deviceName })}
            className="px-5 cursor-pointer sm:px-6 py-2 sm:py-2.5 bg-bgBlue text-white rounded-lg font-medium text-sm sm:text-base hover:bg-blue-600 transition-colors shadow-customShadow"
          >
            Add Device
          </button>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(decodedText) => {
          setIsScannerOpen(false);
          let finalPin = decodedText;

          // 1. Try to parse as JSON if it looks like one
          if (decodedText.startsWith("{") && decodedText.endsWith("}")) {
            try {
              const parsed = JSON.parse(decodedText);
              if (parsed?.data?.pin) {
                finalPin = parsed.data.pin;
                console.log("Extracted PIN from JSON:", finalPin);
              }
            } catch (e) {
              console.error("Failed to parse QR JSON", e);
            }
          }
          // 2. Try to parse as URL if it contains a pin parameter
          else if (decodedText.includes("pin=")) {
            try {
              // Handle both absolute URLs and partial strings with query params
              const queryString = decodedText.includes("?")
                ? decodedText.split("?")[1]
                : decodedText.includes("&") ? decodedText : "";

              if (queryString) {
                const params = new URLSearchParams(queryString);
                const pinParam = params.get("pin");
                if (pinParam) {
                  finalPin = pinParam;
                  console.log("Extracted PIN from URL:", finalPin);
                }
              } else {
                // Last ditch effort: regex for pin=XXXX
                const match = decodedText.match(/pin=([^&/]+)/);
                if (match) finalPin = match[1];
              }
            } catch (e) {
              console.error("Failed to parse QR URL", e);
            }
          }

          setPin(finalPin);
          toast.success("QR Code scanned successfully");
        }}
      />
    </div>
  );
}

export default AddDeviceModal;