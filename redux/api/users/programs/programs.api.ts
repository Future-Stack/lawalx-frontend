import { baseApi } from "../../baseApi";
import { SuccessResponse } from "../content/content.type";
import { CreateProgramPayload, ProgramsResponse, GetProgramByIdResponse } from "./programs.type";

const programsAPI = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createProgram: build.mutation<SuccessResponse, CreateProgramPayload>({
      query: (data) => ({
        url: "/program/create-program",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Programs", "Devices"],
    }),
    getAllProgramsData: build.query<ProgramsResponse, void>({
      query: () => ({
        url: "/program/my-programs",
        method: "GET",
      }),
      providesTags: ["Programs"],
    }),
    getSingleProgramData: build.query<GetProgramByIdResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/program/get-single/${id}`,
        method: "GET",
      }),
      providesTags: ["Programs"],
    }),

    updateSingleProgram: build.mutation<SuccessResponse, { id: string, data: Partial<CreateProgramPayload> }>({
      query: ({ id, data }) => ({
        url: `/program/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Programs"],
    }),

    deleteProgram: build.mutation<SuccessResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/program/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Programs"],
    }),

    deleteTimelineItem: build.mutation<SuccessResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/program/delete-timeline-item/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Programs"],
    }),

  }),
});

export const { useCreateProgramMutation, useGetAllProgramsDataQuery, useGetSingleProgramDataQuery, useUpdateSingleProgramMutation, useDeleteProgramMutation, useDeleteTimelineItemMutation } = programsAPI;
