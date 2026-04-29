import { baseApi } from "../baseApi";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/overview?filter=${filter}`,
        method: "GET",
      }),
    }),
    getSubscriptionDistribution: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/subscription-distribution?filter=${filter}`,
        method: "GET",
      }),
    }),
    getActivityTrend: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/activity-trend?filter=${filter}`,
        method: "GET",
      }),
    }),
    getContentUsageBreakdown: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/content-usage-breakdown?filter=${filter}`,
        method: "GET",
      }),
    }),
    getDunningEffectiveness: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/dunning-effectiveness?filter=${filter}`,
        method: "GET",
      }),
    }),
    getCriticalActivity: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/critical-activity?filter=${filter}`,
        method: "GET",
      }),
    }),
    getRecentSupportTickets: builder.query({
      query: ({ limit, filter }: { limit: number; filter: string }) => ({
        url: `/dashboard/recent-support-tickets?limit=${limit}&filter=${filter}`,
        method: "GET",
      }),
    }),
    getDashboardExport: builder.query({
      query: (filter: string) => ({
        url: `/dashboard/export?filter=${filter}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetDashboardOverviewQuery,
  useGetSubscriptionDistributionQuery,
  useGetActivityTrendQuery,
  useGetContentUsageBreakdownQuery,
  useGetDunningEffectivenessQuery,
  useGetCriticalActivityQuery,
  useGetRecentSupportTicketsQuery,
  useGetDashboardExportQuery,
  useLazyGetDashboardExportQuery,
} = dashboardApi;
