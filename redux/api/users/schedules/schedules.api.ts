import { baseApi } from "../../baseApi";
import { SuccessResponse } from "../content/content.type";
import { GetSchedulesResponse, GetSingleScheduleResponse } from "./schedules.type";

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
      providesTags: ["Schedules"],
    }),

  }),
});

export const { useCreateScheduleMutation, useGetAllSchedulesDataQuery, useGetSingleScheduleDataQuery } = schedulesAPI;
