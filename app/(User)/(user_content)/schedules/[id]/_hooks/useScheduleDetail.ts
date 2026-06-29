/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetSingleScheduleDataQuery,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useDeleteScheduleSingleDeviceMutation,
} from "@/redux/api/users/schedules/schedules.api";
import { ScheduleTarget } from "@/redux/api/users/schedules/schedules.type";
import { useGetMyAllDevicesDataQuery } from "@/redux/api/users/devices/devices.api";
import { Device } from "@/redux/api/users/devices/devices.type";
import { ContentItem } from "@/types/content";
import { getUrl, formatBytes } from "@/lib/content-utils";
import { toast } from "sonner";
import dayjs from "dayjs";

type ScheduleTargetDevice = {
  id: string;
  name: string;
  status: string;
};

type ScheduleTargetProgram = {
  id: string;
  name: string;
};

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

// Helper: Format date for backend payload – literal string, no timezone conversion
function formatPayloadDate(
  dateStr: string | null | undefined,
  isEnd = false,
): string {
  const fallback = dayjs().format("YYYY-MM-DD");
  const cleanDate = dateStr
    ? dateStr.includes("T")
      ? dateStr.split("T")[0]
      : dateStr
    : fallback;
  return isEnd ? `${cleanDate}T23:59:00Z` : `${cleanDate}T00:00:00Z`;
}

// Helper: Format time for backend payload – uses selectedDate so date is never static
function formatPayloadTime(
  timeStr: string | null | undefined,
  dateStr: string | null | undefined,
): string {
  // Resolve the date portion from the selected date (never use today as fallback blindly)
  const fallbackDate = dayjs().format("YYYY-MM-DD");
  const cleanDate = dateStr
    ? dateStr.includes("T")
      ? dateStr.split("T")[0]
      : dateStr
    : fallbackDate;

  if (!timeStr) return `${cleanDate}T00:00:00Z`;
  const cleanTime = timeStr.includes("T")
    ? timeStr.split("T")[1]?.substring(0, 5)
    : timeStr;
  const parts = cleanTime.split(":");
  const hh = parts[0]?.padStart(2, "0") || "00";
  const mm = parts[1]?.padStart(2, "0") || "00";
  return `${cleanDate}T${hh}:${mm}:00Z`;
}

// Helper: timezone-independent date parser
function parseDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }
  return dateStr;
}

// Helper: timezone-independent time parser
function parseTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  if (timeStr.includes("T")) {
    return timeStr.split("T")[1]?.substring(0, 5) || "";
  }
  return timeStr.substring(0, 5);
}

// Helper: Validate UUID format
const isUUID = (id: any): id is string => {
  if (typeof id !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
};

export function useScheduleDetail() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, isError, isFetching, refetch } =
    useGetSingleScheduleDataQuery(
      { id: id as string },
      { skip: !id || id === "new" },
    );

  const [updateSchedule, { isLoading: isUpdating }] =
    useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();
  const [deleteScheduleSingleDevice] = useDeleteScheduleSingleDeviceMutation();

  const { data: allDevicesData } = useGetMyAllDevicesDataQuery(undefined);
  const allDevices = allDevicesData?.data || [];

  const isNew = id === "new";
  const schedule = data?.data;

  const [isAddScreenOpen, setIsAddScreenOpen] = useState(false);
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [isAddLowerThirdOpen, setIsAddLowerThirdOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [localLowerThirdIds, setLocalLowerThirdIds] = useState<string[] | null>(
    null,
  );
  const [localLowerThirdData, setLocalLowerThirdData] = useState<any>(null);

  // Shared state for the currently playing content item
  const [playingIndex, setPlayingIndex] = useState(0);

  // Play/Pause power state (mirrors programs page)
  const [localActive, setLocalActive] = useState(false);

  // Sync localActive from API data when schedule loads
  useEffect(() => {
    if (schedule && !isUpdating && !isFetching) {
      setLocalActive(
        schedule.status?.toLowerCase() === "playing" ||
          schedule.status?.toLowerCase() === "publish",
      );
    }
  }, [schedule, isUpdating, isFetching]);

  // Local editable state initialized from API data
  const [localName, setLocalName] = useState<string | null>(null);
  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [localContentType, setLocalContentType] = useState<string | null>(null);
  const [localRepeat, setLocalRepeat] = useState<string | null>(null);
  const [localFiles, setLocalFiles] = useState<any[] | null>(null);

  // Date & Time selection
  const [localStartTime, setLocalStartTime] = useState<string | null>(null);
  const [localEndTime, setLocalEndTime] = useState<string | null>(null);
  const [localStartDate, setLocalStartDate] = useState<string | null>(null);
  const [localEndDate, setLocalEndDate] = useState<string | null>(null);

  const [localTargets, setLocalTargets] = useState<ScheduleTarget[] | null>(
    null,
  );
  const [localPrograms, setLocalPrograms] = useState<any[] | null>(null);
  const [localDaysOfWeek, setLocalDaysOfWeek] = useState<string[] | null>(null);
  const [localDayOfMonth, setLocalDayOfMonth] = useState<number[] | null>(null);

  // Derive current values
  const name = localName ?? schedule?.name ?? "";
  const description = localDescription ?? schedule?.description ?? "";
  const contentType =
    localContentType ??
    (schedule ? mapContentType(schedule.contentType) : "all");
  const repeat = localRepeat ?? schedule?.recurrenceType ?? "once";

  const startTime =
    localStartTime ??
    (schedule?.startTime ? parseTime(schedule.startTime) : "09:00");
  const endTime =
    localEndTime ??
    (schedule?.endTime
      ? parseTime(schedule.endTime)
      : repeat.toLowerCase() === "once"
        ? ""
        : "00:00");
  const startDate =
    localStartDate ??
    (schedule?.startDate
      ? parseDate(schedule.startDate)
      : dayjs().format("YYYY-MM-DD"));
  const endDate =
    localEndDate ?? (schedule?.endDate ? parseDate(schedule.endDate) : "");

  // Map API file data to ContentItem[]
  const allContent: ContentItem[] = localFiles
    ? localFiles.map((f: any) => ({
        id: f.id,
        title: f.originalName || f.title,
        type:
          f.type === "VIDEO"
            ? "video"
            : f.type === "AUDIO" || f.type === "audio"
              ? "audio"
              : "image",
        thumbnail:
          f.type === "IMAGE"
            ? getUrl(f.url || f.thumbnail)
            : f.url
              ? getUrl(f.url)
              : f.thumbnail || "",
        video: f.type === "VIDEO" ? getUrl(f.url || f.video) : undefined,
        audio:
          f.type === "AUDIO" || f.type === "audio"
            ? getUrl(f.url || f.audio)
            : undefined,
        size: formatBytes(f.size) || f.size,
        duration: String(f.duration),
      }))
    : schedule?.files && schedule.files.length > 0
      ? schedule.files
          .filter((f) => !removedFileIds.includes(f.id))
          .map((file) => ({
            id: file.id,
            title: file.originalName,
            type:
              file.type === "VIDEO"
                ? "video"
                : file.type === "AUDIO"
                  ? "audio"
                  : "image",
            thumbnail:
              file.type === "IMAGE"
                ? getUrl(file.url)
                : file.url
                  ? getUrl(file.url)
                  : "",
            video: file.type === "VIDEO" ? getUrl(file.url) : undefined,
            audio: file.type === "AUDIO" ? getUrl(file.url) : undefined,
            size: formatBytes(file.size),
            duration: String(file.duration),
          }))
      : schedule?.programs && schedule.programs.length > 0
        ? schedule.programs
            .filter((p) => !removedFileIds.includes(p.id))
            .map((program) => ({
              id: program.id,
              title: program.name,
              type: "video",
              thumbnail: getUrl(program.videoUrl || ""),
              video: getUrl(program.videoUrl || ""),
              size: "Program",
              duration: "10",
            }))
        : [];

  const content = allContent.filter((item) => {
    if (contentType === "all") return true;
    if (contentType === "image-video")
      return item.type === "image" || item.type === "video";
    if (contentType === "audio") return item.type === "audio";
    return true;
  });

  const targets = localTargets ?? schedule?.targets ?? [];
  const programs = localPrograms ?? schedule?.programs ?? [];
  const daysOfWeek = localDaysOfWeek ?? schedule?.daysOfWeek ?? [];
  const dayOfMonth = localDayOfMonth ?? schedule?.dayOfMonth ?? [];

  const assignedScreensMap = new Map<
    string,
    { groupId: string; groupName: string; screens: any[] }
  >();

  targets.forEach(
    (
      target: ScheduleTarget & {
        device?: ScheduleTargetDevice;
        program?: ScheduleTargetProgram;
      },
    ) => {
      const programId = target.programId || "unassigned";
      const matchedProgram = programs.find(
        (program) => program.id === target.programId,
      );
      const groupName =
        target.program?.name || matchedProgram?.name || "Unassigned";

      if (!assignedScreensMap.has(programId)) {
        assignedScreensMap.set(programId, {
          groupId: programId,
          groupName,
          screens: [],
        });
      }

      const targetDevice = target.device;
      const fallbackDevice = allDevices.find(
        (device) => device.id === target.deviceId,
      );
      const resolvedDeviceId =
        target.deviceId || targetDevice?.id || fallbackDevice?.id || "";
      const resolvedDeviceName =
        targetDevice?.name || fallbackDevice?.name || "";
      const resolvedDeviceStatus =
        targetDevice?.status || fallbackDevice?.status || "OFFLINE";

      if (!resolvedDeviceId || !resolvedDeviceName) return;

      const group = assignedScreensMap.get(programId);
      const alreadyExists = !!group?.screens.some(
        (screen: any) => screen.id === resolvedDeviceId,
      );
      if (alreadyExists) return;

      group?.screens.push({
        id: resolvedDeviceId,
        name: resolvedDeviceName,
        status: resolvedDeviceStatus,
        isEnabled: target.isEnabled,
      });
    },
  );

  if (assignedScreensMap.size === 0 && programs.length > 0) {
    programs.forEach((program) => {
      const groupDevices = allDevices.filter(
        (device) => device.programId === program.id,
      );
      assignedScreensMap.set(program.id, {
        groupId: program.id,
        groupName: program.name,
        screens: groupDevices.map((device: any) => {
          const target = targets.find(
            (t) => t.programId === program.id && t.deviceId === device.id,
          );
          return {
            id: device.id,
            name: device.name,
            status: device.status,
            isEnabled: !!target && target.isEnabled,
          };
        }),
      });
    });
  }

  const assignedScreens = Array.from(assignedScreensMap.values());

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
      daysOfWeek?: string[];
      dayOfMonth?: number[];
    } = {},
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
    const pDaysOfWeek = currentParams.daysOfWeek ?? daysOfWeek;
    const pDayOfMonth = currentParams.dayOfMonth ?? dayOfMonth;

    const apiContentType =
      pContentType === "image-video"
        ? "IMAGE_VIDEO"
        : pContentType === "audio"
          ? "AUDIO"
          : pContentType === "lower-third"
            ? "LOWERTHIRD"
            : "ALL_CONTENT";

    const fileIds = localFiles
      ? localFiles.map((f: any) => f.id)
      : schedule?.files
        ? schedule.files
            .filter((f) => !removedFileIds.includes(f.id))
            .map((f) => f.id)
        : [];

    const lowerThirdIds =
      localLowerThirdIds ??
      (schedule?.lowerThirdId ? [schedule.lowerThirdId] : []);

    const validProgramIds = pPrograms.map((p: any) => p.id).filter(isUUID);
    const validDeviceIds = pTargets
      .filter((t: any) => t.isEnabled)
      .map((t: any) => t.deviceId)
      .filter(isUUID);
    const validFileIds = fileIds.filter(isUUID);
    const validLowerThirdIds = lowerThirdIds.filter(isUUID);

    const isOnce = pRepeat.toLowerCase() === "once";
    const startD = pStartDate || dayjs().format("YYYY-MM-DD");
    const endD = isOnce ? undefined : pEndDate || startD;

    return {
      name: pName,
      description: pDescription,
      contentType: apiContentType,
      recurrenceType: pRepeat.toLowerCase(),
      startDate: formatPayloadDate(startD),
      endDate: endD ? formatPayloadDate(endD, true) : undefined,
      startTime: formatPayloadTime(pStartTime, startD),
      endTime: isOnce ? undefined : formatPayloadTime(pEndTime, endD),
      daysOfWeek: pDaysOfWeek,
      dayOfMonth: pDayOfMonth,
      programIds: validProgramIds,
      deviceIds: validDeviceIds,
      fileIds: validFileIds,
      lowerThirdIds:
        validLowerThirdIds.length > 0 ? validLowerThirdIds : undefined,
      status: schedule?.status || "playing",
    };
  };

  const handleRemoveDevice = async (deviceId: string, programId: string) => {
    const nextTargets = targets.filter(
      (target) =>
        !(target.deviceId === deviceId && target.programId === programId),
    );
    const hasAnyDeviceInProgram = nextTargets.some(
      (target) => target.programId === programId,
    );
    const nextPrograms = hasAnyDeviceInProgram
      ? programs
      : programs.filter((program) => program.id !== programId);

    setLocalPrograms(nextPrograms);
    setLocalTargets(nextTargets);

    if (!isNew) {
      try {
        const response = await deleteScheduleSingleDevice({
          id: id as string,
          deviceId,
        }).unwrap();
        toast.success(response?.message || "Device removed successfully");
      } catch (err: any) {
        toast.error(
          err?.data?.message || err?.error || "Failed to remove device",
        );
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
      toast.error(
        err?.data?.message || err?.error || "Failed to delete schedule",
      );
    }
  };

  const handleSave = async () => {
    if (isNew) {
      toast.info("Create logic not yet hooked to this page");
      return;
    }

    try {
      const payload = getPayload();
      await updateSchedule({
        id: id as string,
        data: payload,
      }).unwrap();
      toast.success("Schedule updated successfully");

      // Reset local states to let them sync from refetched data
      setLocalStartTime(null);
      setLocalEndTime(null);
      setLocalStartDate(null);
      setLocalEndDate(null);
      setLocalRepeat(null);
      setLocalContentType(null);
      setLocalName(null);
      setLocalDescription(null);
      setLocalFiles(null);
      setLocalTargets(null);
      setLocalPrograms(null);
      setLocalDaysOfWeek(null);
      setLocalDayOfMonth(null);
      setRemovedFileIds([]);
      setLocalLowerThirdIds(null);

      router.push("/schedules");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.error || "Failed to update schedule",
      );
    }
  };

  const handleAddDevices = async (newDevices: Device[]) => {
    const currentTargets = targets;
    const currentPrograms = programs;

    const filteredNewDevices = newDevices.filter(
      (nd) => !currentTargets.some((ct) => ct.deviceId === nd.id),
    );

    if (filteredNewDevices.length === 0) return;

    const newTargets: ScheduleTarget[] = filteredNewDevices.map(
      (d) =>
        ({
          id: `temp-${Date.now()}-${d.id}`,
          scheduleId: (id as string) || "",
          programId: d.programId,
          deviceId: d.id,
          isEnabled: true,
        }) as ScheduleTarget,
    );

    const newProgramsToAdd = filteredNewDevices
      .map((d) => d.program)
      .filter(
        (p): p is any => !!p && !currentPrograms.some((cp) => cp.id === p.id),
      );

    const uniqueNewPrograms = Array.from(
      new Map(newProgramsToAdd.map((p) => [p.id, p])).values(),
    );

    const nextTargets = [...targets, ...newTargets];
    const nextPrograms = [...programs, ...uniqueNewPrograms];

    setLocalPrograms(nextPrograms);
    setLocalTargets(nextTargets);

    if (!isNew) {
      try {
        await updateSchedule({
          id: id as string,
          data: getPayload({ programs: nextPrograms, targets: nextTargets }),
        }).unwrap();
        toast.success("Devices added successfully");
      } catch {
        toast.error("Failed to add devices to schedule");
      }
    }
  };

  return {
    id,
    isNew,
    isLoading,
    isError,
    schedule,
    name,
    description,
    contentType,
    repeat,
    startTime,
    endTime,
    startDate,
    endDate,
    content,
    daysOfWeek,
    dayOfMonth,
    assignedScreens,
    isUpdating,
    playingIndex,
    setPlayingIndex,
    isAddScreenOpen,
    setIsAddScreenOpen,
    isAddContentOpen,
    setIsAddContentOpen,
    isAddLowerThirdOpen,
    setIsAddLowerThirdOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    localActive,
    localLowerThirdData,
    localLowerThirdIds,
    localFiles,
    removedFileIds,
    setLocalName,
    setLocalDescription,
    setLocalContentType,
    setLocalRepeat,
    setLocalStartTime,
    setLocalEndTime,
    setLocalStartDate,
    setLocalEndDate,
    setLocalDaysOfWeek,
    setLocalDayOfMonth,
    setLocalFiles,
    setRemovedFileIds,
    setLocalLowerThirdIds,
    setLocalLowerThirdData,
    refetch,
    handleSave,
    handleDeleteSchedule,
    handleConfirmDelete,
    handleRemoveDevice,
    handleAddDevices,
  };
}
