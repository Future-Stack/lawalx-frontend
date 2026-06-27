import React from "react";
import { Schedule } from "../CreateScheduleModal";

interface ScheduleInfoStepProps {
  form: Omit<Schedule, "id" | "active">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Schedule, "id" | "active">>>;
}

export default function ScheduleInfoStep({ form, setForm }: ScheduleInfoStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g. Morning Welcome"
          className="w-full px-4 py-3 border border-border bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Enter schedule description"
          rows={6}
          className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue resize-none text-gray-900 dark:text-white"
        />
      </div>
    </div>
  );
}
