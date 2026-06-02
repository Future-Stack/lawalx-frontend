import { baseApi } from "../baseApi";
import { SubmitEnterpriseRequestPayload, SubmitEnterpriseRequestResponse, EnterpriseSubscriptionInfoPayload } from "./enterpriseRequests.type";

export const enterpriseRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitEnterpriseRequest: builder.mutation<SubmitEnterpriseRequestResponse, SubmitEnterpriseRequestPayload>({
      query: (data) => ({
        url: "/enterprise-requests",
        method: "POST",
        body: data,
      }),
    }),
    submitEnterpriseSubscriptionInfo: builder.mutation<
      unknown,
      { ticketId: string; data: EnterpriseSubscriptionInfoPayload }
    >({
      query: ({ ticketId, data }) => ({
        url: `/enterprise-requests/tickets/${ticketId}/subscription-info`,
        method: "POST",
        body: data,
      }),
    }),
    updateEnterpriseSubscriptionInfo: builder.mutation<
      unknown,
      { ticketId: string; data: EnterpriseSubscriptionInfoPayload }
    >({
      query: ({ ticketId, data }) => ({
        url: `/enterprise-requests/tickets/${ticketId}/subscription-info`,
        method: "PATCH",
        body: data,
      }),
    }),
    getEnterpriseSubscriptionInfo: builder.query<{ statusCode: number; success: boolean; message: string; data: EnterpriseSubscriptionInfoPayload }, string>({
      query: (ticketId) => ({
        url: `/enterprise-requests/tickets/${ticketId}/subscription-info`,
        method: "GET",
      }),
    }),
    deleteEnterpriseSubscriptionInfo: builder.mutation<unknown, string>({
      query: (ticketId) => ({
        url: `/enterprise-requests/tickets/${ticketId}/subscription-info`,
        method: "DELETE",
      }),
    }),
    sendEnterpriseProposal: builder.mutation<unknown, string>({
      query: (ticketId) => ({
        url: `/enterprise-requests/tickets/${ticketId}/send-proposal`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useSubmitEnterpriseRequestMutation,
  useSubmitEnterpriseSubscriptionInfoMutation,
  useUpdateEnterpriseSubscriptionInfoMutation,
  useGetEnterpriseSubscriptionInfoQuery,
  useDeleteEnterpriseSubscriptionInfoMutation,
  useSendEnterpriseProposalMutation,
} = enterpriseRequestsApi;
