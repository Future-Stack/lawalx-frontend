// =======================
// Programs API Enums
// =======================

export enum WorkoutStatus {
  DRAFT = "DRAFT",
  PUBLISH = "PUBLISH",
  ARCHIVE = "ARCHIVE",
}

// =======================
// Programs API Types
// =======================

export interface SuccessResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

export interface ProgramsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Program[];
}

export interface GetProgramByIdResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: Program;
}

// =======================
// Create/Update Program Payload
// =======================

export interface CreateProgramPayload {
  name: string;
  description: string;
  serene_size?: string;
  status?: WorkoutStatus;
  content_ids: string[];
  device_ids: string[];
}

// =======================
// Program
// =======================

export interface Program {
  id: string;
  name: string;
  description: string;
  serene_size: string;
  status: WorkoutStatus | string;
  userId: string;
  created_at: string;
  updated_at: string;
  videoUrl: string;

  timeline: Timeline[];
  devices: Device[];
  schedules: Schedule[];
}

// =======================
// Timeline + File
// =======================

export interface Timeline {
  id: string;
  programId: string;
  position: number;
  duration: number;
  createdAt: string;
  fileId: string;
  file: ProgramFile;
}

export interface ProgramFile {
  id: string;
  originalName: string;
  size: number;
  userId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  filePath: string;
  fileType: string;
  url: string;
  type: "VIDEO" | "IMAGE" | "AUDIO" | "CONTENT" | "FILE";
  duration: number;
}

// =======================
// Device
// =======================

export interface Device {
  id: string;
  name: string;
  status: "ONLINE" | "OFFLINE" | "PAIRED" | "UNPAIRED" | string;
  deviceSerial: string;
  ip: string;
  location: {
    lat: number;
    lng: number;
  } | null;
  isActive?: boolean;
  adminBlock: boolean;
  targets: any[];
}

// =======================
// Schedule + Target
// =======================

export interface Schedule {
  id: string;
  name: string;
  description: string;
  contentType: string;
  recurrenceType: "once" | "daily" | "weekly" | "monthly" | string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  status: string;
  userId: string;
  updatedAt: string;
  createdAt: string;
  lowerThirdId: string | null;
  fileId: string;
  dayOfMonth: number[];
  daysOfWeek: string[];
  targets: ScheduleTarget[];
  file: {
    originalName: string;
  };
}

export interface ScheduleTarget {
  id: string;
  scheduleId: string;
  deviceId: string | null;
  isEnabled: boolean;
  programId: string;
}

// Legacy / Alternative naming aliases
export type ApiResponse = GetProgramByIdResponse;
export type TimelineItem = Timeline;
export type File = ProgramFile;
export type Target = ScheduleTarget;