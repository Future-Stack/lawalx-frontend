import { baseApi } from "../baseApi";

export const systemHealthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemHealthOverview: builder.query({
      query: () => ({
        url: "/system-health/overview",
        method: "GET",
      }),
      providesTags: ["Activity"], // Use appropriate tag if there is a specific one, or just Activity as a generic fallback. BaseApi tags: ["User", "NotificationPermission", "Notification", "Activity", "Content", "Devices", "Programs", "Schedules", "Device", "AdminSettings", "Subscription", "UserPlans", "ReportHub", "ReportHistory", "ReportPreview", "Banner", "Billing", "SupportTicket", "AdminSupportTicket", "AdminEmployee", "AdminSupporter", "SupporterTicket", "SupporterTicketStats", "FAQ", "VideoFAQ", "Preferences", "FinancialData", "Tax", "SupporterTag", "TicketTag", "AdditionalPayment", "AdditionalPaymentSigner"]
    }),
    getSystemHealthStorage: builder.query({
      query: () => ({
        url: "/system-health/storage",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    getSystemHealthPerformance: builder.query({
      query: () => ({
        url: "/system-health/performance",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    getSystemHealthServers: builder.query({
      query: () => ({
        url: "/system-health/servers",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
    getSystemHealthErrors: builder.query({
      query: () => ({
        url: "/system-health/errors",
        method: "GET",
      }),
      providesTags: ["Activity"],
    }),
  }),
});

export const {
  useGetSystemHealthOverviewQuery,
  useGetSystemHealthStorageQuery,
  useGetSystemHealthPerformanceQuery,
  useGetSystemHealthServersQuery,
  useGetSystemHealthErrorsQuery,
} = systemHealthApi;
