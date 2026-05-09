import { baseApi } from "../../baseApi";

export const billingPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBillingOverview: builder.query({
      query: (params) => ({
        url: `/billingandpayment/overview`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTransactionReport: builder.query({
      query: (params) => ({
        url: `/billingandpayment/transaction-report`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRecentTransactions: builder.query({
      query: (params) => ({
        url: `/billingandpayment/recent-transactions`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getPaymentMethods: builder.query({
      query: (params) => ({
        url: `/billingandpayment/payment-methods`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTransactionVolume: builder.query({
      query: (params) => ({
        url: `/billingandpayment/transaction-volume`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getAgingReport: builder.query({
      query: (params) => ({
        url: `/billingandpayment/aging-report`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getFailedPaymentsAnalysis: builder.query({
      query: (params) => ({
        url: `/billingandpayment/failed-payments-analysis`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getDelinquencyReport: builder.query({
      query: (params) => ({
        url: `/billingandpayment/delinquency-report`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getRefundReport: builder.query({
      query: (params) => ({
        url: `/billingandpayment/refund-report`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getTaxReport: builder.query({
      query: (params) => ({
        url: `/billingandpayment/tax-report`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getDsoAnalysis: builder.query({
      query: (params) => ({
        url: `/billingandpayment/dso-analysis`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
    getBillingExportAll: builder.query({
      query: (params) => ({
        url: `/billingandpayment/export-all`,
        method: "GET",
        params,
      }),
      providesTags: ["FinancialData"],
    }),
  }),
});

export const {
  useGetBillingOverviewQuery,
  useGetTransactionReportQuery,
  useGetRecentTransactionsQuery,
  useGetPaymentMethodsQuery,
  useGetTransactionVolumeQuery,
  useGetAgingReportQuery,
  useGetFailedPaymentsAnalysisQuery,
  useGetDelinquencyReportQuery,
  useGetRefundReportQuery,
  useGetTaxReportQuery,
  useGetDsoAnalysisQuery,
  useLazyGetBillingExportAllQuery,
} = billingPaymentApi;
