import { baseApi } from "../baseApi";

export const financialreportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["Activity"],
    }),
    getMrrStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/mrr-stats`,
        method: "GET",
        params,
      }),
    }),
    getMrrTrend: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/mrr-trend`,
        method: "GET",
        params,
      }),
    }),
    getFinancialBreakdown: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/breakdown`,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetFinancialStatsQuery,
  useGetMrrStatsQuery,
  useGetMrrTrendQuery,
  useGetFinancialBreakdownQuery,
} = financialreportApi;
