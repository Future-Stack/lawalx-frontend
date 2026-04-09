export interface DashboardData {
  totalDevices: number;
  newDevicesThisWeek: number;
  onlineDevices: number;
  offlineDevices: number;
  usedStorageGb: number;
  totalStorageGb: number;
}

export interface DashboardStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: DashboardData;
}

// get all devices 
export type Device = {
  name: string;
  status: "ONLINE" | "OFFLINE";
  location: { lat: number; lng: number } | string | null;
  metadata: Record<string, any> | null;
  updatedAt: string;
};

export type RecentDevicesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Device[];
};