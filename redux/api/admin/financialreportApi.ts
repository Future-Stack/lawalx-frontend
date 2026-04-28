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
    getChurnStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/churn/stats`,
        method: "GET",
        params,
      }),
    }),
    getChurnTrend: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/churn/trend`,
        method: "GET",
        params,
      }),
    }),
    getChurnRateByPlan: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/churn/rate-by-plan`,
        method: "GET",
        params,
      }),
    }),
    getPlanStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/plans/stats`,
        method: "GET",
        params,
      }),
    }),
    getPlanRevenue: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/plans/revenue`,
        method: "GET",
        params,
      }),
    }),
    getPlanSubscribers: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/plans/subscribers`,
        method: "GET",
        params,
      }),
    }),
    getTrialStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/trail/stats`,
        method: "GET",
        params,
      }),
    }),
    getTrialConvertByPlan: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/trail/convert-by-plan`,
        method: "GET",
        params,
      }),
    }),
    getArpuStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/arpu/stats`,
        method: "GET",
        params,
      }),
    }),
    getArpuTrend: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/arpu/trend`,
        method: "GET",
        params,
      }),
    }),
    getExportFinancialReport: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/export-financial-report`,
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
  useGetChurnStatsQuery,
  useGetChurnTrendQuery,
  useGetChurnRateByPlanQuery,
  useGetPlanStatsQuery,
  useGetPlanRevenueQuery,
  useGetPlanSubscribersQuery,
  useGetTrialStatsQuery,
  useGetTrialConvertByPlanQuery,
  useGetArpuStatsQuery,
  useGetArpuTrendQuery,
  useGetExportFinancialReportQuery,
  useLazyGetExportFinancialReportQuery,
} = financialreportApi;
