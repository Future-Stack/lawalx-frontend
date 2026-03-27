"use client";

import { Plus, ChevronDown, Clock, Video, Edit, Pause, Play, X, CalendarClock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import AddExistingDialog from "./AddExistingDialog";
import { useDeleteScheduleMutation, useUpdateScheduleMutation } from "@/redux/api/users/schedules/schedules.api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import DeleteConfirmationModal from "@/components/Admin/modals/DeleteConfirmationModal";

import { Schedule } from "@/redux/api/users/programs/programs.type";

interface ContentScheduleProps {
  schedules: Schedule[];
}

const ContentSchedule: React.FC<ContentScheduleProps> = ({ schedules }) => {
  const router = useRouter();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scheduleList, setScheduleList] = useState<Schedule[]>([]);
  const [isAddExistingDialogOpen, setIsAddExistingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  useEffect(() => {
    if (schedules) {
      setScheduleList(schedules);
    }
  }, [schedules]);

  const handleTogglePlay = async (schedule: any) => {
    try {
      const newStatus = schedule.status === "playing" ? "stopped" : "playing";
      const res = await updateSchedule({
        id: schedule.id,
        data: { status: newStatus },
      }).unwrap();
      toast.success(res.message || `Schedule ${newStatus === "playing" ? "started" : "stopped"}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update schedule status");
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    try {
      const res = await deleteSchedule(selectedSchedule.id).unwrap();
      toast.success(res.message || "Schedule removed successfully");
      setIsDeleteDialogOpen(false);
      setSelectedSchedule(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to remove schedule");
    }
  };

  const formatTime = (isoTime: string): string => {
    if (!isoTime) return "";
    try {
      const date = new Date(isoTime);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
    } catch {
      return isoTime;
    }
  };

  const statusMap = {
    playing: { label: "Playing", color: "bg-blue-50 text-blue-500 border border-blue-200" },
    upcoming: { label: "Will play in 1 hour", color: "bg-orange-50 text-orange-500 border border-orange-200" },
    stopped: { label: "Stopped", color: "bg-red-50 text-red-500 border border-red-200" },
  };

  return (
    <div className="w-full">
      <div className="bg-navbarBg rounded-2xl border border-border p-4 md:p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-headings dark:text-white">Content Schedule</h2>

          {/* Add Schedule Button with Dropdown */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="rounded-lg transition-all flex items-center justify-center gap-2 text-white py-2.5 px-4 cursor-pointer bg-bgBlue hover:bg-[#00A4FF] w-full sm:w-auto font-semibold shadow-customShadow"
            >
              <Plus className="w-5 h-5" />
              Add Schedule
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 top-12 z-20 bg-navbarBg rounded-lg shadow-xl border border-border py-2 w-full sm:w-48">
                  <button onClick={() => setIsAddExistingDialogOpen(true)} className="w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <CalendarClock className="w-4 h-4 md:w-5 md:h-5 inline mr-2 text-muted" /> Add Existing
                  </button>
                  <div className="border-t border-border my-1" />
                  <button className="w-full px-4 py-2.5 text-left text-sm font-medium text-body hover:text-bgBlue hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 inline mr-2 text-muted" /> Create New
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
            scheduleList.map((schedule: any) => {
              const status = (schedule.status || "stopped").toLowerCase();
              const badge = statusMap[status as keyof typeof statusMap] || statusMap.stopped;

              return (
                <div
                  key={schedule.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-border overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 md:p-6 border-b border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-headings dark:text-white">{schedule.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <button
                        onClick={() => router.push(`/schedules/${schedule.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-body hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                      >
                        <Edit className="w-4 h-4 text-muted group-hover:text-bgBlue" />
                        <span>Edit</span>
                      </button>
                    </div>
                    <p className="text-sm text-muted line-clamp-1">{schedule.description || "Welcome content during morning hours"}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 md:p-6 space-y-4">
                    <div className="flex items-center gap-3 text-body">
                      <div className="w-5 flex justify-center">
                        <Video className="w-4 h-4 text-muted" />
                      </div>
                      <span className="text-sm font-medium">Play: {schedule.file?.originalName || "No file assigned"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-body">
                      <div className="w-5 flex justify-center">
                        <Clock className="w-4 h-4 text-muted" />
                      </div>
                      <span className="text-sm font-medium">
                        {schedule.daysOfWeek?.length > 0 ? schedule.daysOfWeek.join(", ") : "All Days"} • {formatTime(schedule.startTime)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 md:p-6 border-t border-border flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/20">
                    <button
                      onClick={() => handleTogglePlay(schedule)}
                      disabled={isUpdating}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer
                        ${status === 'playing' ? 'bg-[#FF8A00] hover:bg-[#E67E00] text-white' : 'bg-bgBlue hover:bg-[#0094E6] text-white'}
                        disabled:opacity-50
                      `}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                      ) : status === 'playing' ? (
                        <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-1" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSchedule(schedule);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <X className="w-4 h-4 border-2 border-white rounded-sm" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {isAddExistingDialogOpen && <AddExistingDialog open={isAddExistingDialogOpen} setOpen={setIsAddExistingDialogOpen} />}

      <DeleteConfirmationModal
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedSchedule(null);
        }}
        onConfirm={handleDelete}
        title="Remove Schedule"
        description="Are you sure you want to remove this schedule from this program? This action cannot be undone."
        itemName={selectedSchedule?.name}
      />
    </div>
  );
};

export default ContentSchedule;