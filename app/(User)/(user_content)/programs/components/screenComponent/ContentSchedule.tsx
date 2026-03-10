"use client";

import { Plus, ChevronDown, Clock, Video, Edit, Pause, Play, X, CalendarClock } from "lucide-react";
import { useState, useEffect } from "react";
import AddExistingDialog from "./AddExistingDialog";

import { Schedule } from "@/redux/api/users/programs/programs.type";

interface ContentScheduleProps {
  schedules: Schedule[];
}

const ContentSchedule: React.FC<ContentScheduleProps> = ({ schedules }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (schedules) {
      setScheduleList(schedules);
    }
  }, [schedules]);

  const getStatusBadge = (status: string) => {
    const badges = {
      playing: "bg-blue-100 text-blue-600",
      upcoming: "bg-orange-100 text-orange-600",
      stopped: "bg-red-100 text-red-600",
    };
    const labels = {
      playing: "Playing",
      upcoming: "Will play in 1 hour",
      stopped: "Stopped",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="w-full">
      <div className="bg-navbarBg rounded-2xl border border-border p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-headngs">Content Schedule</h2>

          {/* Add Schedule Button with Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-lg transition-all flex items-center justify-center gap-2 text-white py-2.5 px-4 cursor-pointer bg-bgBlue hover:bg-[#00A4FF] w-full sm:w-auto font-semibold shadow-customShadow"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 top-12 z-20 bg-navbarBg rounded-lg shadow-xl border border-border py-2 w-full sm:w-48">
                  <button onClick={() => setOpen(true)} className="w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue transition-colors cursor-pointer">
                    <CalendarClock className="w-4 h-4 md:w-5 md:h-5 inline mr-1" /> Add Existing
                  </button>
                  <div className="border-t border-border my-1" />
                  <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 inline mr-1" /> Create New
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Schedule Cards */}
        <div className="space-y-4">
          {scheduleList.length === 0 ? (
            <div className="text-center py-10 text-muted">
              <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No schedules found for this program.</p>
            </div>
          ) : (
            scheduleList.map((schedule: any) => (
              <div
                key={schedule.id}
                className="bg-navbarBg rounded-xl border border-border hover:shadow-sm transition-shadow"
              >
                {/* ... existing card layout mapping fields from schedule ... */}
              </div>
            ))
          )}
        </div>
      </div>
      {open && <AddExistingDialog open={open} setOpen={setOpen} />}
    </div>
  );
};

export default ContentSchedule;