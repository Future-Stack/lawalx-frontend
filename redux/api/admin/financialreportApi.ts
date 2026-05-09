import { baseApi } from "../baseApi";

export const financialreportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getMrrStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/mrr-stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getMrrTrend: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/mrr-trend`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getFinancialBreakdown: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/breakdown`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getChurnStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/churn/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getChurnTrend: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/churn/trend`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getChurnRateByPlan: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/churn/rate-by-plan`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getPlanStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/plans/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getPlanRevenue: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/plans/revenue`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getPlanSubscribers: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/plans/subscribers`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTrialStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/trail/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTrialConvertByPlan: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/trail/convert-by-plan`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getArpuStats: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/arpu/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getArpuTrend: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/arpu/trend`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getExportFinancialReport: builder.query({
      query: (params) => ({
        url: `/reports-analytics/financial/export-financial-report`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
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
