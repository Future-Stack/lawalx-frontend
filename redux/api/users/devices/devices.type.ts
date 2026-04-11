// pair pin 
export interface AddDevicePin {
    pin: string;
    name?: string;
    programId?: string;
}

export type TimelineFile = {
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
  type: string;
  duration: number;
};

export type TimelineItem = {
  id: string;
  programId: string;
  position: number;
  duration: number;
  createdAt: string;
  fileId: string;
  file: TimelineFile;
};

export type Program = {
  id: string;
  name: string;
  description: string;
  serene_size: string; // Backend uses serene_size instead of screen_size
  status: string;
  userId: string;
  created_at: string;
  updated_at: string;
  videoUrl: string;
  timeline: TimelineItem[];
};

export type Location = {
  lat: number;
  lng: number;
};

// get my devices type 
export type Device = {
  id: string;
  deviceSerial: string;
  devicePin: string | null;
  pinExpiresAt: string;
  deviceToken: string;
  name: string;
  status: "WAITING" | "PAIRED" | "ONLINE" | "OFFLINE" | string;
  lastSeen: string;
  pinUsed: boolean;
  failedAttempts: number;
  lockUntil: string | null;
  last_Sync: string | null;
  adminBlock: boolean;
  deviceType: string | null;
  model: string | null;
  ip: string;
  location: Location | null;
  metadata: any | null;
  storage: string; // The JSON says this is a string "64000000000"
  user: {
    totalStorage: number;
    usedStorage: number;
  } | null;
  isActive: boolean;
  userId: string;
  programId: string | null;
  createdAt: string;
  updatedAt: string;
  program: Program | null;
};

export type DeviceListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Device[];
};

// get device data api type 
export type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
};

export type DeviceData = {
  name: string;
  status: "WAITING" | "PAIRED" | "ONLINE" | "OFFLINE";
  deviceSerial: string;
  location: Location;
  storage: string;
};

export type DeviceResponse = ApiResponse<DeviceData>;
