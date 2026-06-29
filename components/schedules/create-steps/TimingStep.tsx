/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Clock, Calendar } from "lucide-react";
import Dropdown from "@/components/shared/Dropdown";
import { Schedule } from "../CreateScheduleModal";

interface TimingStepProps {
  form: Omit<Schedule, "id" | "active">;
  setForm: React.Dispatch<React.SetStateAction<Omit<Schedule, "id" | "active">>>;
}

export default function TimingStep({ form, setForm }: TimingStepProps) {
  return (
    <div className="space-y-8">
      {/* Repeat */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Repeat</label>
        <Dropdown
          value={form.repeat}
          options={["once", "daily", "weekly", "monthly"]}
          onChange={(val) => setForm((prev) => ({ ...prev, repeat: val as any }))}
          className="w-full"
        />
      </div>

      {/* Weekly Days */}
      {form.repeat === "weekly" && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Days</label>
          <div className="grid grid-cols-7 gap-3">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const days = form.days ?? [];
                  const updated = days.includes(day)
                    ? days.filter((d) => d !== day)
                    : [...days, day];
                  setForm((prev) => ({ ...prev, days: updated }));
                }}
                className={`py-3 rounded-lg font-medium text-sm transition-all ${
                  (form.days ?? []).includes(day)
                    ? "bg-bgBlue text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Days */}
      {form.repeat === "monthly" && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Days</label>
          <div className="grid grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((num) => {
              const day = num.toString();
              const current = form.monthlyDays ?? [];
              const selected = current.includes(day);
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    const updated = selected
                      ? current.filter((d) => d !== day)
                      : [...current, day];
                    setForm((prev) => ({ ...prev, monthlyDays: updated }));
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    selected
                      ? "bg-bgBlue text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Play Time */}
      {(form.repeat === "daily" || form.repeat === "weekly" || form.repeat === "monthly") && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Play Time</label>
          <div className="relative">
            <input
              type="text"
              value={form.playTime}
              onChange={(e) => setForm((prev) => ({ ...prev, playTime: e.target.value }))}
              placeholder="09:00 AM"
              className="w-full pl-4 pr-12 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
            />
            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Run Once */}
      {form.repeat === "once" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Select Date</label>
            <div className="relative">
              <input
                type="text"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                placeholder="MM/DD/YYYY"
                className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">Play Time</label>
            <div className="relative">
              <input
                type="text"
                value={form.playTime}
                onChange={(e) => setForm((prev) => ({ ...prev, playTime: e.target.value }))}
                placeholder="09:00 AM"
                className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      )}

      {/* Recurring Range */}
      {form.repeat !== "once" && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">Select Range</label>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Start Date</label>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  placeholder="MM/DD/YYYY"
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">End Date</label>
              <div className="relative mt-2">
                <input
                  type="text"
                  value={form.endDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  placeholder="MM/DD/YYYY"
                  className="w-full px-4 py-3 border border-borderGray dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-bgBlue text-gray-900 dark:text-white"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
