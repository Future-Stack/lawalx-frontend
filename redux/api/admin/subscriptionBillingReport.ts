import { baseApi } from "../baseApi";

export const subscriptionBillingReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptionBillingStats: builder.query({
      query: (params) => ({
        url: `/billing-report/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getSubscriptionBillingTrend: builder.query({
      query: (params) => ({
        url: `/billing-report/transaction/trend`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getSubscriptionBillingRecentTransactions: builder.query({
      query: (params) => ({
        url: `/billing-report/recent-transaction`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getSubscriptionBillingTransactionSummary: builder.query({
      query: (params) => ({
        url: `/billing-report/transaction-summary`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getFailedPaymentTrends: builder.query({
      query: (params) => ({
        url: `/failed-payment/trends`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getFailedPaymentReasons: builder.query({
      query: (params) => ({
        url: `/failed-payment/reasons`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTaxReportStats: builder.query({
      query: (params) => ({
        url: `/tax-reports/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTaxBreakdown: builder.query({
      query: (params) => ({
        url: `/tax-reports/breakdown`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTaxRegionAnalytics: builder.query({
      query: (params) => ({
        url: `/tax-reports/region-analytics`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRefundsStats: builder.query({
      query: (params) => ({
        url: `/refunds/stats`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRefundsDetails: builder.query({
      query: (params) => ({
        url: `/refunds/details`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRefundsReasons: builder.query({
      query: (params) => ({
        url: `/refunds/reasons`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRefundsChargebackHealth: builder.query({
      query: (params) => ({
        url: `/refunds/chargeback-health`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRefundsImpactAnalysis: builder.query({
      query: (params) => ({
        url: `/refunds/refund-impact-analysis`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
  }),
});

export const {
  useGetSubscriptionBillingStatsQuery,
  useGetSubscriptionBillingTrendQuery,
  useGetSubscriptionBillingRecentTransactionsQuery,
  useGetSubscriptionBillingTransactionSummaryQuery,
  useGetFailedPaymentTrendsQuery,
  useGetFailedPaymentReasonsQuery,
  useGetTaxReportStatsQuery,
  useGetTaxBreakdownQuery,
  useGetTaxRegionAnalyticsQuery,
  useGetRefundsStatsQuery,
  useGetRefundsDetailsQuery,
  useGetRefundsReasonsQuery,
  useGetRefundsChargebackHealthQuery,
  useGetRefundsImpactAnalysisQuery,
} = subscriptionBillingReportApi;
