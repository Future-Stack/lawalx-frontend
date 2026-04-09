export type ContentType = "IMAGE_VIDEO" | "AUDIO" | "LOWERTHIRD";

export type RecurrenceType = "daily" | "weekly" | "monthly" | "once";

export type StatusType = "playing" | "paused" | "stopped";

export type DayOfWeek =
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri"
  | "Sat"
  | "Sun";

export interface StoreMorningPromo {
  name: string;
  description?: string;

  contentType: ContentType;
  recurrenceType: RecurrenceType;

  startDate: string;
  endDate: string;

  startTime: string;
  endTime: string;

  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number[];

  programIds?: string[];
  deviceIds: string[];

  fileIds?: string[];
  lowerThirdId?: string;

  status: StatusType;
}


// get all schedules type
// export type ContentType = "IMAGE" | "VIDEO" | "IMAGE_VIDEO";
// export type RecurrenceType = "daily" | "weekly" | "monthly" | "once";
// export type StatusType = "playing" | "paused" | "stopped";

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface ScheduleTarget {
  id: string;
  scheduleId: string;
  programId: string | null;
  deviceId: string | null;
  isEnabled: boolean;
}

export interface FileData {
  id: string;
  url: string;
  filePath: string;
  fileType: string;
  originalName: string;
  size: number;
  type: "IMAGE" | "VIDEO";
  duration: number;
  userId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  serene_size: string;
  status: string;
  userId: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  recurrenceType: RecurrenceType;

  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;

  daysOfWeek: string[];
  dayOfMonth: number[];

  isActive: boolean;
  status: StatusType;

  userId: string;
  fileId: string;
  lowerThirdId: string | null;

  createdAt: string;
  updatedAt: string;

  targets: ScheduleTarget[];
  file: FileData;
  programs: Program[];
}

/** Final response type */
export type GetSchedulesResponse = ApiResponse<Schedule[]>;

/** Single schedule response type */
export type GetSingleScheduleResponse = ApiResponse<Schedule>;