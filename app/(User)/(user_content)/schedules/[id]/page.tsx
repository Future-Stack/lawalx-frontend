"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetSingleScheduleDataQuery, useUpdateScheduleMutation, useDeleteScheduleMutation } from "@/redux/api/users/schedules/schedules.api";
import { ScheduleTarget } from "@/redux/api/users/schedules/schedules.type";
import { useGetAllProgramsDataQuery } from "@/redux/api/users/programs/programs.api";
import { ContentItem } from "@/types/content";
import { getUrl, formatBytes } from "@/lib/content-utils";
import { toast } from "sonner";

// Components
import DetailHeader from "./_components/DetailHeader";
import BasicInfoForm from "./_components/BasicInfoForm";
import ContentSection from "./_components/ContentSection";
import ScheduleTimeSection from "./_components/ScheduleTimeSection";
import AssignedScreensSection from "./_components/AssignedScreensSection";
import ContentPreview from "./_components/ContentPreview";
import AddScreenDialog from "./_components/AddScreenDialog";
import AddContentDialog from "./_components/AddContentDialog";
import { DeleteConfirmationModal } from "@/components/schedules/DeleteModal";

// Helper: map API contentType to display label
function mapContentType(ct: string): string {
  switch (ct) {
    case "IMAGE_VIDEO":
      return "image-video";
    case "AUDIO":
      return "audio";
    case "LOWERTHIRD":
      return "lower-third";
    case "ALL_CONTENT":
      return "all";
    default:
      return ct;
  }
}

// Helper: map API recurrenceType to display label (for UI components)
function getRepeatLabel(rt: string): string {
  switch (rt?.toLowerCase()) {
    case "once":
      return "Run Once";
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    default:
      return rt;
  }
}

// Helper: format time string (e.g. "09:00" → "09:00 AM")
function formatTime(time: string): string {
  if (!time) return "";
  // If already formatted (contains AM/PM), return as-is
  if (time.includes("AM") || time.includes("PM")) return time;
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${m} ${suffix}`;
}

// Helper: build schedule time display string
function buildScheduleTimeDisplay(
  daysOfWeek: string[],
  startTime: string,
  recurrenceType: string
): string {
  const time = formatTime(startTime);
  if (recurrenceType === "daily") return `Daily • ${time}`;
  if (recurrenceType === "once") return `Once • ${time}`;
  if (recurrenceType === "monthly") return `Monthly • ${time}`;
  if (daysOfWeek && daysOfWeek.length > 0) {
    return `${daysOfWeek.join(", ")} • ${time}`;
  }
  return time;
}

// Helper: Validate UUID format
const isUUID = (id: any): id is string => {
  if (typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useGetSingleScheduleDataQuery(
    { id: id as string },
    { skip: !id || id === "new" }
  );

  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] = useDeleteScheduleMutation();

  const { data: allProgramsData } = useGetAllProgramsDataQuery(undefined);
  const allPrograms = allProgramsData?.data || [];

  const isNew = id === "new";
  const schedule = data?.data;

  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExistingContentRemoved, setIsExistingContentRemoved] = useState(false);

  // Shared state for the currently playing content item
  const [playingIndex, setPlayingIndex] = useState(0);

  // Local editable state initialized from API data
  const [localName, setLocalName] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [localContentType, setLocalContentType] = useState<string | null>(null);
  const [localRepeat, setLocalRepeat] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<any | null>(null);

  // Date & Time selection (initial state needs to be null to use fallback)
  const [localStartTime, setLocalStartTime] = useState<string | null>(null);
  const [localEndTime, setLocalEndTime] = useState<string | null>(null);
  const [localStartDate, setLocalStartDate] = useState<string | null>(null);
  const [localEndDate, setLocalEndDate] = useState<string | null>(null);

  // Program & Screen selection
  const [localTargets, setLocalTargets] = useState<ScheduleTarget[] | null>(null);
  const [localPrograms, setLocalPrograms] = useState<any[] | null>(null);

  // Derive current values: prefer local edits, fallback to API data
  const name = localName ?? schedule?.name ?? "";
  const description = localDescription ?? schedule?.description ?? "";
  const contentType = localContentType ?? (schedule ? mapContentType(schedule.contentType) : "all");
  const repeat = localRepeat ?? schedule?.recurrenceType ?? "once";

  const startTime = localStartTime ?? (schedule?.startTime ? schedule.startTime.split("T")[1]?.substring(0, 5) : "09:00");
  const endTime = localEndTime ?? (schedule?.endTime ? schedule.endTime.split("T")[1]?.substring(0, 5) : "10:00");
  const startDate = localStartDate ?? (schedule?.startDate ? schedule.startDate.split("T")[0] : new Date().toISOString().split("T")[0]);
  const endDate = localEndDate ?? (schedule?.endDate ? schedule.endDate.split("T")[0] : "");

  // Map API file data to ContentItem[] for ContentSection (handle all items)
  const allContent: ContentItem[] = localFile
    ? [localFile as ContentItem]
    : (!isExistingContentRemoved && schedule?.files && schedule.files.length > 0
      ? schedule.files.map((file) => ({
        id: file.id,
        title: file.originalName,
        type: file.type === "VIDEO" ? "video" : file.type === "AUDIO" ? "audio" : "image",
        thumbnail: file.type === "IMAGE" ? getUrl(file.url) : (file.url ? getUrl(file.url) : ""),
        video: file.type === "VIDEO" ? getUrl(file.url) : undefined,
        audio: file.type === "AUDIO" ? getUrl(file.url) : undefined,
        size: formatBytes(file.size),
        duration: String(file.duration),
      }))
      : (!isExistingContentRemoved && schedule?.programs && schedule.programs.length > 0
        ? schedule.programs.map((program) => ({
          id: program.id,
          title: program.name,
          type: "video",
          thumbnail: getUrl(program.videoUrl || ""),
          video: getUrl(program.videoUrl || ""),
          size: "Program",
          duration: "10", // Default for programs
        }))
        : []));

  // Filter content based on selected type
  const content = allContent.filter(item => {
    if (contentType === "all") return true;
    if (contentType === "image-video") return item.type === "image" || item.type === "video";
    if (contentType === "audio") return item.type === "audio";
    return true;
  });

  // Build schedule time display
  const scheduleTimeDisplay = schedule
    ? buildScheduleTimeDisplay(schedule.daysOfWeek, schedule.startTime, schedule.recurrenceType)
    : "";

  const targets = localTargets ?? schedule?.targets ?? [];
  const programs = localPrograms ?? schedule?.programs ?? [];

  // Map API targets + programs to assignedScreens groups for accordion
  const assignedScreens = programs
    ? programs.map((program) => {
      // Get all devices for this program from allPrograms (full data)
      const fullProgram = allPrograms.find(p => p.id === program.id);

      return {
        groupId: program.id,
        groupName: program.name,
        screens: (fullProgram?.devices || []).map((device: any) => {
          // Check if this device is currently targeted in the schedule
          const target = targets.find(
            (t) => t.programId === program.id && t.deviceId === device.id
          );
          return {
            id: device.id,
            name: device.name,
            isEnabled: !!target && target.isEnabled,
          };
        }),
      };
    })
    : [];

  const getPayload = (
    currentParams: {
      name?: string;
      description?: string;
      contentType?: string;
      repeat?: string;
      startTime?: string;
      endTime?: string;
      startDate?: string;
      endDate?: string;
      programs?: any[];
      targets?: ScheduleTarget[];
    } = {}
  ) => {
    const pName = currentParams.name ?? name;
    const pDescription = currentParams.description ?? description;
    const pContentType = currentParams.contentType ?? contentType;
    const pRepeat = currentParams.repeat ?? repeat;
    const pStartTime = currentParams.startTime ?? startTime;
    const pEndTime = currentParams.endTime ?? endTime;
    const pStartDate = currentParams.startDate ?? startDate;
    const pEndDate = currentParams.endDate ?? endDate;
    const pPrograms = currentParams.programs ?? programs;
    const pTargets = currentParams.targets ?? targets;

    const apiContentType = pContentType === "image-video" ? "IMAGE_VIDEO" : pContentType === "audio" ? "AUDIO" : pContentType === "lower-third" ? "LOWERTHIRD" : "ALL_CONTENT";

    // Ensure we only send file IDs for actual files
    const fileIds = localFile ? [localFile.id] : (!isExistingContentRemoved && schedule?.files && schedule.files.length > 0 ? schedule.files.map(f => f.id) : []);

    // Filter for valid UUIDs to prevent backend 400 errors
    const validProgramIds = pPrograms.map((p: any) => p.id).filter(isUUID);
    const validDeviceIds = pTargets.filter((t: any) => t.isEnabled).map((t: any) => t.deviceId).filter(isUUID);
    const validFileIds = fileIds.filter(isUUID);

    return {
      name: pName,
      description: pDescription,
      contentType: apiContentType,
      recurrenceType: pRepeat.toLowerCase(),
      startDate: pStartDate.includes("T") ? pStartDate : `${pStartDate}T00:00:00Z`,
      endDate: pRepeat.toLowerCase() === "once" ? (pStartDate.includes("T") ? pStartDate : `${pStartDate}T23:59:59Z`) : (pEndDate.includes("T") ? pEndDate : `${pEndDate || pStartDate}T23:59:59Z`),
      startTime: pStartTime.includes("T") ? pStartTime : `1970-01-01T${pStartTime}:00Z`,
      endTime: pEndTime.includes("T") ? pEndTime : `1970-01-01T${pEndTime}:00Z`,
      daysOfWeek: schedule?.daysOfWeek || [],
      dayOfMonth: schedule?.dayOfMonth || [],
      programIds: validProgramIds,
      deviceIds: validDeviceIds,
      fileIds: validFileIds,
      status: schedule?.status || "playing",
    };
  };

  const handleToggleDevice = async (deviceId: string, isEnabled: boolean, programId: string) => {
    const currentTargets = [...targets];
    const targetIndex = currentTargets.findIndex(
      (t) => t.deviceId === deviceId && t.programId === programId
    );

    let nextTargets = [];
    if (targetIndex > -1) {
      nextTargets = [...currentTargets];
      nextTargets[targetIndex] = { ...nextTargets[targetIndex], isEnabled };
    } else if (isEnabled) {
      nextTargets = [
        ...currentTargets,
        {
          id: `temp-${Date.now()}`,
          scheduleId: (id as string) || "",
          programId,
          deviceId,
          isEnabled: true,
        } as ScheduleTarget,
      ];
    } else {
      nextTargets = currentTargets;
    }

    setLocalTargets(nextTargets);

    if (!isNew) {
      try {
        await updateSchedule({
          id: id as string,
          data: getPayload({ targets: nextTargets })
        }).unwrap();
      } catch (err: any) {
        toast.error("Failed to update schedule status");
      }
    }
  };

  const handleRemoveProgram = async (programId: string) => {
    const nextPrograms = programs.filter(p => p.id !== programId);
    const nextTargets = targets.filter(t => t.programId !== programId);

    setLocalPrograms(nextPrograms);
    setLocalTargets(nextTargets);

    if (!isNew) {
      try {
        await updateSchedule({
          id: id as string,
          data: getPayload({ programs: nextPrograms, targets: nextTargets })
        }).unwrap();
        toast.success("Program removed successfully");
      } catch (err: any) {
        toast.error("Failed to remove program from schedule");
      }
    }
  };

  const handleDeleteSchedule = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSchedule(id as string).unwrap();
      toast.success("Schedule deleted successfully");
      router.push("/schedules");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Failed to delete schedule");
    }
  };

  // Video & thumbnail for preview
  const videoUrl = content[0]?.type === "video" ? content[0].video || content[0].thumbnail : "";
  const thumbnailUrl = content[0]?.thumbnail ?? "";

  const handleSave = async () => {
    if (isNew) {
      toast.info("Create logic not yet hooked to this page");
      return;
    }

    try {
      await updateSchedule({ id: id as string, data: getPayload() }).unwrap();
      toast.success("Schedule updated successfully");
      router.push("/schedules");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.error || "Failed to update schedule");
    }
  };

  if (isLoading && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bgBlue"></div>
      </div>
    );
  }

  if (isError && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load schedule data. Please try again.</p>
      </div>
    );
  }


  const handleAddPrograms = async (newPrograms: any[]) => {
    const currentPrograms = programs;
    const filteredNewPrograms = newPrograms.filter(
      (np) => !currentPrograms.some((cp) => cp.id === np.id)
    );

    if (filteredNewPrograms.length === 0) return;

    const nextPrograms = [...currentPrograms, ...filteredNewPrograms];
    const newTargets: ScheduleTarget[] = [];
    filteredNewPrograms.forEach((p) => {
      (p.devices || []).forEach((d: any) => {
        newTargets.push({
          id: `temp-${Date.now()}-${d.id}`,
          scheduleId: (id as string) || "",
          programId: p.id,
          deviceId: d.id,
          isEnabled: true,
        } as ScheduleTarget);
      });
    });
    const nextTargets = [...targets, ...newTargets];

    setLocalPrograms(nextPrograms);
    setLocalTargets(nextTargets);

    if (!isNew) {
      try {
        await updateSchedule({
          id: id as string,
          data: getPayload({ programs: nextPrograms, targets: nextTargets })
        }).unwrap();
        toast.success("Programs added successfully");
      } catch (err: any) {
        toast.error("Failed to add programs to schedule");
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <DetailHeader
        isNew={isNew}
        name={name}
        onSave={handleSave}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <BasicInfoForm
            name={name}
            setName={(val) => setLocalName(val)}
            description={description}
            setDescription={(val) => setLocalDescription(val)}
          />

          <ContentSection
            contentType={contentType}
            setContentType={(val) => setLocalContentType(val)}
            content={content}
            playingIndex={playingIndex}
            onItemClick={setPlayingIndex}
            onAddContent={() => setIsAddContentOpen(true)}
            onRemoveContent={(id) => {
              if (localFile?.id === id) {
                setLocalFile(null);
              } else if (schedule?.files?.some(f => f.id === id)) {
                setIsExistingContentRemoved(true);
              }
              // Reset playing index if the removed item was active or out of bounds
              setPlayingIndex(0);
              refetch();
            }}
          />

          <ScheduleTimeSection
            data={{
              repeat: repeat,
              playTime: startTime,
              endTime: endTime,
              startDate: startDate,
              endDate: endDate,
            }}
            onChange={(newData: any) => {
              if (newData.repeat !== undefined) setLocalRepeat(newData.repeat);
              if (newData.playTime !== undefined) setLocalStartTime(newData.playTime);
              if (newData.endTime !== undefined) setLocalEndTime(newData.endTime);
              if (newData.startDate !== undefined) setLocalStartDate(newData.startDate);
              if (newData.endDate !== undefined) setLocalEndDate(newData.endDate);
            }}
          />

          <AssignedScreensSection
            assignedScreens={assignedScreens}
            onAddScreen={() => setIsAddScreenOpen(true)}
            onRemoveProgram={handleRemoveProgram}
            onToggleDevice={handleToggleDevice}
            onDeleteSchedule={handleDeleteSchedule}
            isNew={isNew}
          />
        </div>

        {/* Right Column: Preview */}
        <ContentPreview
          items={content}
          scheduleTime={scheduleTimeDisplay}
          playingIndex={playingIndex}
          setPlayingIndex={setPlayingIndex}
          lowerThird={schedule?.lowerThird}
        />
      </div>

      <AddScreenDialog
        isOpen={isAddScreenOpen}
        onClose={() => setIsAddScreenOpen(false)}
        onAdd={handleAddPrograms}
      />

      <AddContentDialog
        isOpen={isAddContentOpen}
        onClose={() => setIsAddContentOpen(false)}
        onSelect={(file) => {
          setLocalFile(file);
          setIsExistingContentRemoved(false);
        }}
        initialContentType={contentType === "all" ? "all" : contentType}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        scheduleName={name}
      />
    </div>
  );
}
