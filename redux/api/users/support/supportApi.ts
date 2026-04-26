import { baseApi } from '../../baseApi';
import { TicketResponse, TicketsResponse } from './support.types';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSupportTicket: builder.mutation<TicketResponse, FormData>({
      query: (data) => ({
        url: '/support/create-ticket',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),
    getMyTickets: builder.query<TicketsResponse, void>({
      query: () => ({
        url: '/support/my-tickets',
        method: 'GET',
      }),
      providesTags: ['SupportTicket'],
    }),
    getTicketDetails: builder.query<TicketResponse, string>({
      query: (id) => ({
        url: `/support/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'SupportTicket', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSupportTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketDetailsQuery,
} = supportApi;
