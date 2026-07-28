import { baseApi } from '../baseApi';

export const impersonationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPendingRequests: builder.query({
      query: () => ({
        url: `/usermanagement/impersonate-requests/my-requests`,
        method: 'GET',
      }),
      providesTags: ['ImpersonationRequest'],
    }),

    respondToImpersonateRequest: builder.mutation({
      query: ({ requestId, status }: { requestId: string; status: 'APPROVED' | 'REJECTED' }) => ({
        url: `/usermanagement/impersonate-requests/${requestId}/respond`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['ImpersonationRequest'],
    }),
  }),
});

export const {
  useGetMyPendingRequestsQuery,
  useRespondToImpersonateRequestMutation,
} = impersonationApi;
