import React, { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import DeviceStatusBadge from "@/components/common/DeviceStatusBadge";
import { Schedule } from "../CreateScheduleModal";

interface ScreenSelectionStepProps {
  form: Omit<Schedule, "id" | "active">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Schedule, "id" | "active">>>;
}

const staticScreens = [
  { name: "Main Lobby Display", status: "online" },
  { name: "Store Entrance TV", status: "online" },
  { name: "Conference Room", status: "offline" },
];

export default function ScreenSelectionStep({ form, setForm }: ScreenSelectionStepProps) {
  const [search, setSearch] = useState("");

  const filteredScreens = useMemo(() => {
    return staticScreens.filter((screen) =>
      screen.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="Search Screens"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
      />
      <div className="border border-borderGray dark:border-gray-700 rounded-lg divide-y divide-borderGray dark:divide-gray-700 max-h-64 overflow-y-auto">
        {filteredScreens.map((screen) => (
          <label
            key={screen.name}
            className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                checked={form.devices.includes(screen.name)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setForm((prev) => ({ ...prev, devices: [...prev.devices, screen.name] }));
                  } else {
                    setForm((prev) => ({
                      ...prev,
                      devices: prev.devices.filter((d) => d !== screen.name),
                    }));
                  }
                }}
                className="w-5 h-5 border-gray-300 data-[state=checked]:bg-bgBlue data-[state=checked]:border-bgBlue"
              />
              <span className="font-medium text-gray-900 dark:text-white">{screen.name}</span>
            </div>

            <DeviceStatusBadge status={screen.status} />
          </label>
        ))}
      </div>
    </div>
  );
}
