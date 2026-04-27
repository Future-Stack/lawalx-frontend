/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { ScreenShare } from "lucide-react";
import dynamic from "next/dynamic";

const QrScanner = dynamic(() => import("@/components/common/QrScanner"), {
  ssr: false,
});
import AddDevicePinInput from "./AddDevicePinInput";
import CreateScreenModal from "./CreateScreenModal";
import BaseDialog from "@/common/BaseDialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddDeviceMutation, useGetDevicePinWiseDataQuery } from "@/redux/api/users/devices/devices.api";
import { useGetAllProgramsDataQuery } from "@/redux/api/users/programs/programs.api";
import { useGetUserProfileQuery } from "@/redux/api/users/userProfileApi";
import { toast } from "sonner";

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string;
  onSuccess?: () => void;
  forceShowProgram?: boolean;
}

function AddDeviceModal({ isOpen, onClose, programId, onSuccess, forceShowProgram }: AddDeviceModalProps) {
  const [pin, setPin] = useState("");
  const [deviceName, setDeviceName] = useState("");

  const [addDevice] = useAddDeviceMutation();
  const { data: programsData, isLoading: isLoadingPrograms } = useGetAllProgramsDataQuery();
  const { data: userProfile } = useGetUserProfileQuery();
  const userInfo = userProfile?.data;

  const cleanedPin = useMemo(() => pin.replace("-", ""), [pin]);
  const { data: devicePinWiseData } = useGetDevicePinWiseDataQuery(
    { devicePin: pin },
    { skip: cleanedPin.length < 8 }
  );

  // Automatically set device name when PIN fetching is successful
  useEffect(() => {
    if (cleanedPin.length === 8 && devicePinWiseData?.success && devicePinWiseData?.data?.name) {
      setDeviceName(devicePinWiseData.data.name);
    } else if (cleanedPin.length < 8) {
      setDeviceName("");
    }
  }, [devicePinWiseData, cleanedPin]);

  const [selectedScreen, setSelectedScreen] = useState("all-programs");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);

  const programOptions = useMemo(() => {
    const fetched = programsData?.data?.map(p => ({ id: p.id, name: p.name })) || [];
    return [{ id: "all-programs", name: "Select a Program" }, ...fetched];
  }, [programsData]);

  const handleAddDevice = async ({ pin, name, programId }: { pin: string, name?: string, programId?: string }) => {
    if (!pin) {
      toast.error("Please enter a device PIN");
      return;
    }
    try {
      const cleanedProgramId = programId === "all-programs" ? undefined : programId;
      const res = await addDevice({ pin, name, programId: cleanedProgramId }).unwrap();

      if (res.success) {
        setPin("");
        setDeviceName("");
        setSelectedScreen("all-programs");
        onClose();
        if (onSuccess) onSuccess();
        toast.success(res.message || "Device added successfully");
      }
    } catch (err: any) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || "Failed to add device");
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      setOpen={(val) => { if (!val) onClose(); }}
      title="Add New Device"
      description="Connect your hardware to your account in a few simple steps."
      maxWidth="4xl"
      maxHeight="xl"
    >
      <div className="space-y-6 p-2">
        {/* Steps Flow */}
        <div className="relative">
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-100 dark:bg-gray-800"></div>

          <div className="space-y-6 relative">
            {[
              { step: 1, title: "Open Tape App", desc: "Open Tape app on your Smart TV or browser." },
              { step: 2, title: "Set Up the Device", desc: "Set Up your device providing a name, Location and Storage limit." },
              { step: 3, title: "Enter the PIN", desc: "A pairing screen will appear—enter the PIN or scan the QR code." },
              { step: 4, title: "Start Displaying", desc: "Your screen is now connected and ready to go!" }
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-qrBackground dark:bg-gray-800 border border-borderGray dark:border-gray-700 text-gray-700 dark:text-gray-400 flex items-center justify-center font-semibold text-sm shrink-0 relative z-10 shadow-customShadow">
                  {s.step}
                </div>
                <div>
                  <h3 className="text-base font-medium text-headings dark:text-white">{s.title}</h3>
                  <p className="text-sm text-muted mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input PIN Section */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Input PIN
          </label>
          <AddDevicePinInput
            pin={pin}
            setPin={setPin}
            onOpenScanner={() => setIsScannerOpen(true)}
            handleAddDevice={handleAddDevice}
            selectedScreen={selectedScreen}
          />
        </div>

        {/* Device Name Section */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Device Name
          </label>
          <input
            type="text"
            value={deviceName}
            onChange={e => setDeviceName(e.target.value)}
            placeholder="Enter device name"
            className="w-full h-12 px-4 border border-borderGray dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue transition-all"
          />
        </div>

        {/* Select Program Section */}
        {!programId && forceShowProgram !== false && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select a Program
              </label>
              <button
                onClick={() => setIsCreateProgramModalOpen(true)}
                className="bg-bgBlue hover:bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-customShadow cursor-pointer"
              >
                <ScreenShare className="w-4 h-4" /> Create New Program
              </button>
            </div>
            <Select
              value={selectedScreen}
              onValueChange={setSelectedScreen}
              disabled={isLoadingPrograms}
            >
              <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-800 border-borderGray dark:border-gray-700 rounded-lg">
                <SelectValue placeholder={isLoadingPrograms ? "Loading programs..." : "Select a Program"} />
              </SelectTrigger>
              <SelectContent className="z-[1100]">
                {programOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
                {!isLoadingPrograms && programsData?.data?.length === 0 && (
                  <SelectItem value="no-programs" disabled className="text-input italic">
                    please don&apos;t have any program please create new prgram
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-border hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl font-medium text-gray-600 dark:text-gray-400 transition-colors shadow-customShadow cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddDevice({ pin, name: deviceName, programId: programId || selectedScreen })}
            className="px-6 py-2.5 bg-bgBlue text-white rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-customShadow active:scale-[0.98] cursor-pointer"
          >
            Add Device
          </button>
        </div>

          <CreateScreenModal
          isOpen={isCreateProgramModalOpen}
          onClose={() => setIsCreateProgramModalOpen(false)}
        />

        {isScannerOpen && (
          <QrScanner
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
            onScanSuccess={(decodedText) => {
              setIsScannerOpen(false);
              let finalPin = decodedText;
              if (decodedText.startsWith("{") && decodedText.endsWith("}")) {
                try {
                  const parsed = JSON.parse(decodedText);
                  if (parsed?.data?.pin) finalPin = parsed.data.pin;
                } catch (e) { console.error(e); }
              } else if (decodedText.includes("pin=")) {
                const params = new URLSearchParams(decodedText.split("?")[1] || decodedText);
                finalPin = params.get("pin") || finalPin;
              }
              setPin(finalPin);
              toast.success("QR Code scanned successfully");
            }}
          />
        )}
      </div>
    </BaseDialog>
  );
}

export default AddDeviceModal;