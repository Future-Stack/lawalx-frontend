/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import BaseDialog from "@/common/BaseDialog";
import { MonitorSmartphone, Loader2, CircleCheckBigIcon, Search, MapPin } from "lucide-react";
import { useCreateProgramSyncMutation } from "@/redux/api/users/programs/programs.api";
import { toast } from "sonner";
import { Device } from "@/redux/api/users/programs/programs.type";
import DeviceLocation from "@/components/common/DeviceLocation";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";

interface SyncProgramDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  programName: string;
  programId: string;
  devices: Device[];
}

const SyncProgramDialog = ({ open, setOpen, programName, programId, devices }: SyncProgramDialogProps) => {
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceSync, { isLoading: isSyncing }] = useCreateProgramSyncMutation();

  // Reset selection when opening dialog
  useEffect(() => {
    if (open) {
      // By default, no devices are selected
      setSelectedDeviceIds([]);
      setSearchQuery("");
    }
  }, [open]);

  const isDeviceOnline = (status: string) => {
    const norm = status?.toUpperCase();
    return norm === "ONLINE" || norm === "PAIRED";
  };

  const toggleSelectDevice = (id: string) => {
    const device = devices.find((d) => d.id === id);
    const isOnline = device ? isDeviceOnline(device.status) : false;
    if (!isOnline) {
      toast.error("Offline devices cannot be synced. Only online devices can be synced.");
      return;
    }
    setSelectedDeviceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.deviceSerial.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [devices, searchQuery]);

  const filteredOnlineDevices = useMemo(() => {
    return filteredDevices.filter((device) => isDeviceOnline(device.status));
  }, [filteredDevices]);

  const allFilteredSelected = useMemo(() => {
    if (filteredDevices.length === 0) return false;
    return filteredDevices.every((device) => selectedDeviceIds.includes(device.id));
  }, [filteredDevices, selectedDeviceIds]);

  const allFilteredOnlineSelected = useMemo(() => {
    if (filteredOnlineDevices.length === 0) return false;
    return filteredOnlineDevices.every((device) => selectedDeviceIds.includes(device.id));
  }, [filteredOnlineDevices, selectedDeviceIds]);

  const handleSelectAll = () => {
    if (filteredDevices.length === 0) return;

    if (allFilteredSelected) {
      const filteredIds = filteredDevices.map((d) => d.id);
      setSelectedDeviceIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      const hasOffline = filteredDevices.some((d) => !isDeviceOnline(d.status));
      if (hasOffline) {
        toast.error("Offline devices cannot be synced. Only online devices can be synced.");
      }
      const onlineFilteredIds = filteredDevices
        .filter((d) => isDeviceOnline(d.status))
        .map((d) => d.id);
      setSelectedDeviceIds((prev) => {
        const next = new Set([...prev, ...onlineFilteredIds]);
        return Array.from(next);
      });
    }
  };

  const handleSelectOnlineOnly = () => {
    const onlineIds = filteredOnlineDevices.map((d) => d.id);
    if (onlineIds.length === 0) return;

    if (allFilteredOnlineSelected) {
      setSelectedDeviceIds((prev) => prev.filter((id) => !onlineIds.includes(id)));
    } else {
      setSelectedDeviceIds((prev) => {
        const next = new Set([...prev, ...onlineIds]);
        return Array.from(next);
      });
    }
  };

  const handleSyncSubmit = async () => {
    if (selectedDeviceIds.length === 0) return;
    try {
      const res = await deviceSync({ programId, deviceIds: selectedDeviceIds }).unwrap();
      toast.success(res?.message || "Devices synced successfully");
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to sync some devices");
    }
  };

  return (
    <BaseDialog
      open={open}
      setOpen={setOpen}
      title="Sync Program"
      description={`Select the devices you want to sync the program "${programName}" to:`}
      maxWidth="3xl"
      maxHeight="lg"
    >
      <div className="flex flex-col space-y-4 px-1">
        <div className="border-t border-border mb-2" />

        {devices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted">
            <MonitorSmartphone className="w-12 h-12 text-gray-400 mb-2" />
            <p className="font-semibold text-headings">No Assigned Devices</p>
            <p className="text-sm mt-1 text-gray-500">
              There are no devices assigned to this program yet.
            </p>
          </div>
        ) : (
          <>
            {/* Search Input following Step 2 styling */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search Device"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
              />
            </div>

            {/* Select All and Info layout following Step 2 */}
            {filteredDevices.length > 0 && (
              <div className="flex items-center justify-between px-1 py-1">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-bgBlue dark:hover:text-bgBlue transition-colors cursor-pointer select-none"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        allFilteredSelected
                          ? "bg-bgBlue border-bgBlue text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-bgBlue"
                      }`}
                    >
                      {allFilteredSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                    </div>
                    <span>Select All ({filteredDevices.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSelectOnlineOnly}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-bgBlue dark:hover:text-bgBlue transition-colors cursor-pointer select-none"
                  >
                    <div
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        allFilteredOnlineSelected
                          ? "bg-bgBlue border-bgBlue text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-bgBlue"
                      }`}
                    >
                      {allFilteredOnlineSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                    </div>
                    <span>Select All Online ({filteredOnlineDevices.length})</span>
                  </button>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Selected: {selectedDeviceIds.length}
                </span>
              </div>
            )}

            {/* Scrollable list container following Step 2 style */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
              {filteredDevices.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No devices found matching your search.
                </div>
              ) : (
                filteredDevices.map((device) => {
                  const isSelected = selectedDeviceIds.includes(device.id);

                  return (
                    <div
                      key={device.id}
                      onClick={() => toggleSelectDevice(device.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-borderGray dark:border-gray-700 bg-white dark:bg-gray-800 transition-all group ${
                        isSelected
                          ? "border-bgBlue bg-blue-50/50 dark:bg-blue-950/20"
                          : "hover:border-bgBlue hover:bg-blue-50 dark:hover:bg-blue-950/20"
                      } cursor-pointer`}
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-bgBlue border-bgBlue text-white"
                              : "border-gray-300 dark:border-gray-600 group-hover:border-bgBlue"
                          }`}
                        >
                          {isSelected && <CircleCheckBigIcon className="w-3.5 h-3.5" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm sm:text-base text-headings truncate group-hover:text-bgBlue transition-colors">
                            {device.name}
                          </span>

                          <DeviceStatusBadge status={device.status} />
                        </div>
                        <div className="text-[11px] sm:text-xs text-textGray mt-0.5 font-mono">
                          Serial: {device.deviceSerial}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-gray-400 font-medium mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#737373]" />
                          {device.location ? (
                            <DeviceLocation lat={device.location.lat} lng={device.location.lng} />
                          ) : (
                            "N/A"
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Footer buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 border border-border text-headings hover:bg-bgGray/35 rounded-lg cursor-pointer font-semibold shadow-customShadow"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSyncSubmit}
            disabled={selectedDeviceIds.length === 0 || isSyncing}
            className="w-full sm:w-auto px-5 py-2.5 bg-bgBlue hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-customShadow animate-fade-in"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Syncing...
              </>
            ) : (
              <>
                Sync Program
              </>
            )}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export default SyncProgramDialog;
