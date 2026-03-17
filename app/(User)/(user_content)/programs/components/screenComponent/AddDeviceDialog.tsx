"use client";

import { useState } from "react";
import BaseDialog from "@/common/BaseDialog";
import { QrCode, WifiOff } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Device {
  id: number;
  name: string;
  online: boolean;
  resolution: string;
}

interface AddDeviceDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AddDeviceDialog = ({ open, setOpen }: AddDeviceDialogProps) => {
  const [devices] = useState<Device[]>([
    { id: 1, name: "LG UR75 43 Inch 4K UHD Smart LED TV", online: true, resolution: "1920x1080" },
    { id: 2, name: "LG UR75 43 Inch 4K UHD Smart LED TV", online: false, resolution: "1280x720" },
  ]);

  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [newDevicePin, setNewDevicePin] = useState("");

  const toggleDeviceSelection = (id: number) => {
    setSelectedDevices((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleAddDevice = () => {
    if (!newDevicePin.trim()) return;
    console.log("Adding device with PIN:", newDevicePin);
    setNewDevicePin("");
  };

  const handleConfirm = () => {
    console.log("Selected devices:", selectedDevices);
    setOpen(false);
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title="Add Device"
      description=""
      maxWidth="xl"
      maxHeight="lg"
    >
      <div className="flex flex-col">
        <div className="border-t border-border" />

        <div className="border-b border-border pb-6 mt-5 space-y-6">
          {/* Select Devices */}
          <div>
            <label className="block text-base font-semibold text-headings mb-3">
              Select Devices
            </label>

            <div className="border border-border rounded-xl divide-y">
              {devices.map((device) => {
                const isSelected = selectedDevices.includes(device.id);

                return (
                  <div
                    key={device.id}
                    onClick={() => toggleDeviceSelection(device.id)}
                    className={`flex items-start gap-3 sm:gap-4 p-4 sm:p-6 cursor-pointer transition-colors ${
                      isSelected ? "bg-gray-50" : ""
                    }`}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleDeviceSelection(device.id)}
                        className="border-border data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="font-semibold text-sm sm:text-base text-headings">
                          {device.name}
                        </span>

                        <span
                          className={`text-xs px-2 py-1 border rounded-md flex items-center gap-1 ${
                            device.online
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {device.online ? (
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                          ) : (
                            <WifiOff className="w-3 h-3" />
                          )}
                          {device.online ? "Online" : "Offline"}
                        </span>
                      </div>

                      <div className="text-xs text-muted mt-1">
                        {device.resolution}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Device */}
          <div className="px-1">
            <label className="block text-sm font-semibold text-headings mb-3">
              Add New Device
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter the PIN or scan the QR code"
                value={newDevicePin}
                onChange={(e) => setNewDevicePin(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-border bg-input text-headings"
              />

              <div className="flex gap-3">
                <button className="p-3 border border-border rounded-lg bg-bgGray shadow-customShadow">
                  <QrCode className="w-6 h-6 text-muted" />
                </button>

                {/* <button
                  onClick={handleAddDevice}
                  disabled={!newDevicePin.trim()}
                  className="px-6 py-3 bg-cardBackground text-headings rounded-lg font-medium shadow-customShadow cursor-pointer"
                >
                  Add
                </button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end sm:justify-between gap-3">
          <button
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto px-5 py-3 border border-textGray rounded-lg hover:text-bgBlue cursor-pointer font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={selectedDevices.length === 0}
            className="w-full sm:w-auto px-5 py-3 bg-bgBlue text-headings rounded-lg disabled:opacity-50 font-semibold"
          >
            Add Device
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default AddDeviceDialog;
