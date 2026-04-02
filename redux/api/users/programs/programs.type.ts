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
// Create Program Payload
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
  status: WorkoutStatus;
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
  status: "PAIRED" | "UNPAIRED";
  deviceSerial: string;
  ip: string;
  location: string | null;
  adminBlock: boolean;
  targets: any[]; // update if structure known
}

// =======================
// Schedule + Target
// =======================

export interface Schedule {
  id: string;
  name: string;
  description: string;
  contentType: "IMAGE_VIDEO" | "AUDIO";
  recurrenceType: "once" | "daily" | "weekly" | "monthly";
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

  targets: Target[];
}

export interface Target {
  id: string;
  scheduleId: string;
  deviceId: string | null;
  isEnabled: boolean;
  programId: string;
}




// export enum WorkoutStatus {
//   DRAFT = "DRAFT",
//   PUBLISH = "PUBLISH",
//   ARCHIVE = "ARCHIVE",
// }

// export interface CreateProgramPayload {
//   name: string;
//   description: string;
//   serene_size?: string;
//   status?: WorkoutStatus;
//   content_ids: string[];
//   device_ids: string[];
// }

// // get all programs data type 
// export interface ApiResponse<T> {
//   statusCode: number;
//   success: boolean;
//   message: string;
//   data: T;
// }

// // Use this type for shared Program structure
// export interface Program {
//   id: string;
//   name: string;
//   description: string;
//   serene_size: string;
//   status: string; // e.g., "DRAFT"
//   userId: string;
//   created_at: string;
//   updated_at: string;
//   timeline: Timeline[];
//   devices: Device[];
//   schedules: Schedule[];
// }

// export interface Timeline {
//   id: string;
//   programId: string;
//   fileId: string;
//   position: number;
//   duration: number;
//   createdAt: string;
//   file: FileData;
// }

// export interface FileData {
//   id: string;
//   url: string;
//   filePath: string;
//   fileType: string; // e.g., "video/mp4"
//   originalName: string;
//   size: number;
//   type: string; // e.g., "VIDEO"
//   duration: number;
//   userId: string;
//   folderId: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Device {
//   id: string;
//   name: string;
//   status: string; // e.g., "ONLINE" | "OFFLINE"
//   deviceSerial: string;
//   ip: string;
//   location: string | null;
//   adminBlock: boolean;
//   targets: any[];
// }

// export interface Schedule {
//   // empty array in your examples
// }

// // ✅ Usage examples:

// // For GET ALL programs
// export type GetAllProgramsResponse = ApiResponse<Program[]>;

// // For GET SINGLE program by ID
// export type GetProgramByIdResponse = ApiResponse<Program>;