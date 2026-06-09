import { baseApi } from "../baseApi";

export const usermanagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status && params.status !== "All Status") queryParams.append("status", params.status.toUpperCase());
        if (params?.plan && params.plan !== "All Plans") queryParams.append("plan", params.plan);
        if (params?.storageUsage) queryParams.append("storageUsage", params.storageUsage);

        return {
          url: `/usermanagement?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["User"],
    }),

    getUserStats: builder.query({
      query: () => ({
        url: "/usermanagement/stats",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getExportData: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.search) queryParams.append("search", params.search);
        if (params?.status && params.status !== "All Status") queryParams.append("status", params.status.toUpperCase());
        if (params?.plan && params.plan !== "All Plans") queryParams.append("plan", params.plan);
        if (params?.storageUsage) queryParams.append("storageUsage", params.storageUsage);

        return {
          url: `/usermanagement/export?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["User"],
    }),

    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/usermanagement/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    loginAsUser: builder.mutation({
      query: (userId) => ({
        url: `/usermanagement/${userId}/login-as-user`,
        method: "POST",
      }),
    }),

    adminResetPassword: builder.mutation({
      query: ({ userId, data }) => ({
        url: `/usermanagement/${userId}/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    suspendUser: builder.mutation({
      query: (userId) => ({
        url: `/usermanagement/${userId}/suspend`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),

    unsuspendUser: builder.mutation({
      query: (userId) => ({
        url: `/usermanagement/${userId}/unsuspend`,
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),

    getUserProfile: builder.query({
      query: ({ userId, currency }: { userId: string; currency?: string }) => ({
        url: `/usermanagement/${userId}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    getUserInvoices: builder.query({
      query: ({ userId, page, limit }: { userId: string; page?: number; limit?: number }) => {
        const params = new URLSearchParams();
        if (page) params.append("page", page.toString());
        if (limit) params.append("limit", limit.toString());
        return { url: `/usermanagement/${userId}/invoices?${params.toString()}`, method: "GET" };
      },
    }),

    getSingleInvoice: builder.query({
      query: ({ userId, paymentId }: { userId: string; paymentId: string }) => ({
        url: `/usermanagement/${userId}/invoices/${paymentId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetExportDataQuery,
  useLazyGetExportDataQuery,
  useDeleteUserMutation,
  useLoginAsUserMutation,
  useAdminResetPasswordMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
  useGetUserProfileQuery,
  useLazyGetUserInvoicesQuery,
  useLazyGetSingleInvoiceQuery,
} = usermanagementApi;
