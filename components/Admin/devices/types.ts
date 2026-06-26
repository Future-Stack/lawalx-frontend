export interface Device {
  id: string;
  device: string;
  model: string;
  customer: string;
  location: string;
  type: string;
  status: 'Online' | 'Offline' | 'Syncing' | string;
  storage: string;
  storageUsed: number;
  storageTotal: number;
  storagePercent: number;
  storageDisplay: string;
  uptime: string;
  daysAgo: number;
  lastSyncDate?: Date;
  lastSync?: string;
  last_Sync?: string | null;
  lat: number;
  lng: number;
}
