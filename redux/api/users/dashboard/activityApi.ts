/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../baseApi";
import { DashboardStatsResponse, RecentDevicesResponse } from "./dashboard.type";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllActivities: build.query<any, { page?: number; limit?: number } | void>({
      query: (params) => {
        const url = params
          ? `/activity/all?page=${params.page || 1}&limit=${params.limit || 10}`
          : "/activity/all";
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Activity", "Devices", "Programs", "Content", "Schedules", "UserPlans", "Subscription", "Banner", "User"],
    }),
    getAllDevices: build.query<RecentDevicesResponse, void>({
      query: () => ({
        url: `/userdashboard/recent-devices?limit=7`,
        method: "GET",
      }),
      providesTags: ["Activity", "Devices"],
    }),
    getAllStats: build.query<DashboardStatsResponse, void>({
      query: () => ({
        url: "/userdashboard/stats",
        method: "GET",
      }),
      providesTags: ["Activity", "Devices", "Content", "Programs"],
    }),
    deleteActivity: build.mutation<any, string>({
      query: (id) => ({
        url: `/activity/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Activity", "Devices"],
    }),

    deleteAllActivityBulkSystem: build.mutation<any, { ids: string[] }>({
      query: (ids) => ({
        url: "/activity/bulk",
        method: "DELETE",
        body: ids
      }),
      invalidatesTags: ["Activity"]
    }),

  }),
});

export const { useGetAllActivitiesQuery, useGetAllStatsQuery, useDeleteActivityMutation, useGetAllDevicesQuery, useDeleteAllActivityBulkSystemMutation } = activityApi;
