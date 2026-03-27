import { baseApi } from "../baseApi";

export const reportHubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation({
      query: (data) => ({
        url: "/reporthub",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ReportHub"],
    }),
    getAllReports: builder.query({
      query: (params) => ({
        url: "/reporthub",
        method: "GET",
        params,
      }),
      providesTags: ["ReportHub"],
    }),
    getReportHistory: builder.query({
      query: (params) => ({
        url: "/reporthub/history",
        method: "GET",
        params,
      }),
      providesTags: ["ReportHistory"],
    }),
    getReportStats: builder.query({
      query: () => ({
        url: "/reporthub/stats",
        method: "GET",
      }),
      providesTags: ["ReportHub", "ReportHistory"],
    }),
    getReportById: builder.query({
      query: (id) => ({
        url: `/reporthub/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ReportHub", id }],
    }),
    updateReport: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/reporthub/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "ReportHub",
        { type: "ReportHub", id },
      ],
    }),
    deleteReport: builder.mutation({
      query: (id) => ({
        url: `/reporthub/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReportHub"],
    }),
    runReport: builder.mutation({
      query: (id) => ({
        url: `/reporthub/${id}/run`,
        method: "POST",
      }),
      invalidatesTags: ["ReportHistory"],
    }),
    deleteReportHistory: builder.mutation({
      query: (id) => ({
        url: `/reporthub/history/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ReportHistory"],
    }),
  }),
});

export const {
  useCreateReportMutation,
  useGetAllReportsQuery,
  useGetReportHistoryQuery,
  useGetReportStatsQuery,
  useGetReportByIdQuery,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useRunReportMutation,
  useDeleteReportHistoryMutation,
} = reportHubApi;
