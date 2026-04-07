// types/device.ts
export type DeviceStatus = "WAITING" | "PAIRED" | "ONLINE" | "OFFLINE";

export interface Device {
  id: number;
  name: string;
  mac: string;
  location: string;
  lat?: number;
  lng?: number;
  screen: string;
  status: DeviceStatus;
  lastSynced: string;
  storage: string;
}