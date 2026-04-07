/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../baseApi";
import { SuccessResponse } from "../content/content.type";
import { AddDevicePin, DeviceListResponse, DeviceResponse } from "./devices.type";

const devicesAPI = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // createDevicePin: build.mutation<SuccessResponse, CreateDevicePin>({
    //       query: (data) => ({
    //         url: "/device/pin",
    //         method: "POST",
    //         body: data,
    //       }),
    //       invalidatesTags: ["Devices"],
    //     }),
    addDevice: build.mutation<SuccessResponse, AddDevicePin>({
      query: (data) => ({
        url: "/device/pair-check",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Devices", "Activity"],
    }),
    getMyDevicesData: build.query<DeviceListResponse, void>({
      query: () => ({
        url: "/device/my-devices",
        method: "GET",
      }),
      providesTags: ["Devices"],
    }),
    // get device pin wise data 
    getDevicePinWiseData: build.query<DeviceResponse, { devicePin: string }>({
      query: ({ devicePin }) => ({
        url: `/device/info/${devicePin}`,
        method: "GET",
      }),
      providesTags: ["Devices"],
    }),
    getSingleDeviceData: build.query<DeviceListResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/device/${id}`,
        method: "GET",
      }),
      providesTags: ["Devices"],
    }),
    deleteDevice: build.mutation<any, { id: string }>({
      query: ({ id }) => ({
        url: `/device/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Devices"],
    }),
    renameDevice: build.mutation<any, { id: string, name: string }>({
      query: ({ id, name }) => ({
        url: `/device/${id}/rename`,
        method: "PATCH",
        body: { name },
      }),
      invalidatesTags: ["Devices"],
    }),
  }),
});

export const { useAddDeviceMutation, useGetMyDevicesDataQuery, useGetSingleDeviceDataQuery, useDeleteDeviceMutation, useRenameDeviceMutation, useGetDevicePinWiseDataQuery } = devicesAPI;
