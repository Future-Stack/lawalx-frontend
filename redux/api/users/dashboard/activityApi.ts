import { baseApi } from "../../baseApi";
import { DashboardStatsResponse, RecentDevicesResponse } from "./dashboard.type";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllActivities: build.query<any, void>({
      query: () => ({
        url: "/activity/all",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    getAllDevices: build.query<RecentDevicesResponse, void>({
      query: () => ({
        url: `/userdashboard/recent-devices?limit=7`,
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    getAllStats: build.query<DashboardStatsResponse, void>({
      query: () => ({
        url: "/userdashboard/stats",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    deleteActivity: build.mutation<any, string>({
      query: (id) => ({
        url: `/activity/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Activity"],
    }),
  }),
});

export const { useGetAllActivitiesQuery, useGetAllStatsQuery, useDeleteActivityMutation, useGetAllDevicesQuery } = activityApi;
