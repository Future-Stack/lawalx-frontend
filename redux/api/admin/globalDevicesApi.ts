/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../baseApi";

export type GlobalDeviceUser = {
  id: string;
  full_name: string;
  company_name: string | null;
};

export type GlobalDevice = {
  id: string;
  devicePin: string | null;
  userId: string | null;
  programId: string | null;
  name: string;
  deviceType: string | null;
  model: string | null;
  ip: string;
  status: string;
  lastSeen: string | null;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  deviceSerial: string;
  location: string | null;
  pinExpiresAt: string | null;
  failedAttempts: number;
  lockUntil: string | null;
  pinUsed: boolean;
  deviceToken: string;
  storage: any;
  isActive: boolean;
  last_Sync: string | null;
  adminBlock: boolean;
  user: GlobalDeviceUser | null;
  program: any | null;
};

export type GlobalDevicesStats = {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  pairedDevices: number;
  onlinePercentage: number;
  avgUptime: string;
  totalStorage: string;
  usedStorage: string;
};

export type GlobalDevicesMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  period: string;
};

export type GlobalDevicesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    stats: GlobalDevicesStats;
    devices: GlobalDevice[];
    meta: GlobalDevicesMeta;
  };
};

export type GlobalDeviceDetailsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    header: {
      name: string;
      serial: string;
      id: string;
    };
    deviceInfo: {
      owner: {
        name: string;
        email: string;
      };
      model: string;
      screenSize: string;
      operatingSystem: string;
      osVersion: string;
      firmware: string;
    };
    status: {
      connection: string;
      lastSync: string;
      uptime: string;
    };
    location: {
      address: string;
      timezone: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    storage: {
      used: string;
      total: string;
      percentageFree: string;
      cache: string;
    };
    activityLogs: Array<{
      id: string;
      action: string;
      timestamp: string;
      details: string;
    }>;
  };
};

export type GlobalDevicesExportResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: any[];
};

export interface GlobalDevicesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  period?: string;
}

const globalDevicesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGlobalDevices: build.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.set("page", params.page.toString());
        if (params.limit !== undefined) queryParams.set("limit", params.limit.toString());
        if (params.search) queryParams.set("search", params.search);
        if (params.status) queryParams.set("status", params.status);
        if (params.type) queryParams.set("type", params.type);
        if (params.period) queryParams.set("period", params.period);
        return {
          url: `/device/global?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.devices.map((device: any) => ({ type: "Device" as const, id: device.id })),
              { type: "Device", id: "LIST" },
            ]
          : [{ type: "Device", id: "LIST" }],
    }),
    exportGlobalDevices: build.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.set("page", params.page.toString());
        if (params.limit !== undefined) queryParams.set("limit", params.limit.toString());
        if (params.search) queryParams.set("search", params.search);
        if (params.status) queryParams.set("status", params.status);
        if (params.type) queryParams.set("type", params.type);
        if (params.period) queryParams.set("period", params.period);
        return {
          url: `/device/global/export?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Device"],
    }),
    getGlobalDeviceDetails: build.query<GlobalDeviceDetailsResponse, string>({
      query: (id) => ({
        url: `/device/global/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Device", id }],
    }),
    deleteDevice: build.mutation({
      query: ({ id }) => ({
        url: `/device/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Device", id: "LIST" }],
    }),
    renameDevice: build.mutation({
      query: ({ id, name }) => ({
        url: `/device/${id}/rename`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Device", id: arg.id }, { type: "Device", id: "LIST" }],
    }),
  }),
});

export const {
  useGetGlobalDevicesQuery,
  useLazyExportGlobalDevicesQuery,
  useGetGlobalDeviceDetailsQuery,
  useDeleteDeviceMutation,
  useRenameDeviceMutation,
} = globalDevicesApi;
