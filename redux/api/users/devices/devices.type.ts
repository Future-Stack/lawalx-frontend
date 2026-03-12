// pair pin 
export interface AddDevicePin {
    pin: string;
    name?: string;
}

// get my devices type 
export type Device = {
  id: string;
  deviceSerial: string;
  devicePin: string | null;
  pinExpiresAt: string;
  deviceToken: string;
  name: string;
  status: "PAIRED" | "OFFLINE" | "ONLINE" | string;
  lastSeen: string;
  pinUsed: boolean;
  failedAttempts: number;
  lockUntil: string | null;
  last_Sync: string | null;
  adminBlock: boolean;
  deviceType: string | null;
  model: string | null;
  ip: string;
  location: string | null;
  metadata: any | null;
  storage: any | null;
  isActive: boolean;
  userId: string;
  programId: string | null;
  createdAt: string;
  updatedAt: string;
  program: any | null;
};

export type DeviceListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Device[];
};

// device pin create type 
// export interface CreateDevicePin {
//   deviceSerial: string;
// }
