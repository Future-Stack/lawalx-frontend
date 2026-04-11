import { baseApi } from "../../baseApi";
import { SuccessResponse } from "../content/content.type";
import { GetSchedulesResponse, GetSingleScheduleResponse, LowerThirdPayload } from "./schedules.type";

const schedulesAPI = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createSchedule: build.mutation<SuccessResponse, any>({
      query: (data) => ({
        url: "/schedule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    createLowerThird: build.mutation<SuccessResponse, LowerThirdPayload>({
      query: (data) => ({
        url: "/lower-third",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    getAllSchedulesData: build.query<GetSchedulesResponse, void>({
      query: () => ({
        url: "/schedule",
        method: "GET",
      }),
      providesTags: ["Schedules"],
    }),
    getSingleScheduleData: build.query<GetSingleScheduleResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/schedule/${id}`,
        method: "GET",
      }),
      providesTags: ["Schedules", "Content"],
    }),
    updateSchedule: build.mutation<SuccessResponse, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/schedule/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Schedules"],
    }),
    deleteSchedule: build.mutation<SuccessResponse, string>({
      query: (id) => ({
        url: `/schedule/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Schedules"],
    }),
  }),
});

export const {
  useCreateScheduleMutation,
  useCreateLowerThirdMutation,
  useGetAllSchedulesDataQuery,
  useGetSingleScheduleDataQuery,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = schedulesAPI;
