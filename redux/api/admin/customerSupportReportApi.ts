import { baseApi } from "../baseApi";

export interface SupportStats {
  totalTickets: {
    value: number;
    change: number;
  };
  resolvedTickets: {
    value: number;
    resolutionRate: number;
    change: number;
  };
  avgResponseTime: {
    value: number;
    unit: string;
    change: number;
  };
  avgResolutionTime: {
    value: number;
    unit: string;
    change: number;
  };
  filter: string;
  label: string;
}

export interface SupportTrendItem {
  label: string;
  total: number;
  resolved: number;
}

export interface RecentTicket {
  ticketId: string;
  customer: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  responseTime: string;
}

export interface SupportCategory {
  name: string;
  count: number;
  percentage: number;
}

export interface ResponseTrendItem {
  label: string;
  avgResponse: number;
}

export interface SupportInsight {
  title: string;
  description: string;
  type: "positive" | "neutral" | "negative";
  icon: string;
}

export const customerSupportReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSupportStats: builder.query<{ data: SupportStats }, string>({
      query: (type) => `/support-report/stats?type=${type}`,
    }),
    getSupportTrend: builder.query<{ data: SupportTrendItem[] }, string>({
      query: (type) => `/support-report/trend?type=${type}`,
    }),
    getRecentTickets: builder.query<{ data: RecentTicket[]; meta: { total: number; page: number; limit: number; totalPages: number } }, { page: number; limit: number }>({
      query: ({ page, limit }) => `/support-report/recent?page=${page}&limit=${limit}`,
    }),
    getSupportCategories: builder.query<{ data: SupportCategory[] }, string>({
      query: (type) => `/support-report/categories?type=${type}`,
    }),
    getResponseTrend: builder.query<{ data: ResponseTrendItem[] }, string>({
      query: (type) => `/support-report/response-trend?type=${type}`,
    }),
    getSupportInsights: builder.query<{ data: SupportInsight[] }, string>({
      query: (type) => `/support-report/insights?type=${type}`,
    }),
    getExportSupportReport: builder.query<{ success: boolean; data: any; message?: string }, string>({
      query: (type) => `/support-report/export?type=${type}`,
    }),
  }),
});

export const {
  useGetSupportStatsQuery,
  useGetSupportTrendQuery,
  useGetRecentTicketsQuery,
  useGetSupportCategoriesQuery,
  useGetResponseTrendQuery,
  useGetSupportInsightsQuery,
  useGetExportSupportReportQuery,
  useLazyGetExportSupportReportQuery,
} = customerSupportReportApi;
