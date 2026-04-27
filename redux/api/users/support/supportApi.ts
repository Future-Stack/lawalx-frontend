import { baseApi } from '../../baseApi';
import { TicketResponse, TicketsResponse } from './support.types';

export interface UploadSupportFileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    tempFileId: string;
    fileUrl: string;
    fileName: string;
  };
}

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
    uploadSupportFile: builder.mutation<UploadSupportFileResponse, FormData>({
      query: (formData) => ({
        url: '/support/upload-support-file',
        method: 'POST',
        body: formData,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSupportTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketDetailsQuery,
  useUploadSupportFileMutation,
} = supportApi;
