import { baseApi } from "../baseApi";

// Response Types
export interface SupporterTicketUser {
  id: string;
  username: string;
  full_name: string;
  image_url: string | null;
  account: {
    email: string;
  };
}

export interface SupporterTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  file: string[];
  issueType: string[];
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  adminNote: string | null;
  customId: string;
  user: SupporterTicketUser;
  messages?: any[];
}

export interface GetAssignedTicketsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SupporterTicket[];
}

export interface GetAssignedTicketDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SupporterTicket;
}

export interface SupporterStatsData {
  total: number;
  resolved: number;
  inProgress: number;
  open: number;
  closed: number;
}

export interface GetSupporterStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SupporterStatsData;
}

export interface ResolveTicketResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    message: string;
  };
}

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

// API Injection
export const supporterTicketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignedTickets: builder.query<GetAssignedTicketsResponse, void>({
      query: () => ({
        url: '/supporter/support/assigned-tickets',
        method: 'GET',
      }),
      providesTags: ['SupporterTicket'],
    }),
    getSupporterStats: builder.query<GetSupporterStatsResponse, void>({
      query: () => ({
        url: '/supporter/support/stats',
        method: 'GET',
      }),
      providesTags: ['SupporterTicketStats'],
    }),
    getAssignedTicketDetails: builder.query<GetAssignedTicketDetailsResponse, string>({
      query: (ticketId: string) => ({
        url: `/supporter/support/assigned-tickets/${ticketId}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg: string) => [{ type: 'SupporterTicket', id: arg }],
    }),
    resolveTicket: builder.mutation<ResolveTicketResponse, string>({
      query: (ticketId: string) => ({
        url: `/supporter/support/resolve-ticket/${ticketId}`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, arg: string) => [
        { type: 'SupporterTicket', id: arg },
        'SupporterTicket',
        'SupporterTicketStats'
      ],
    }),
    updateSupporterProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/supporter/support/update-profile',
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAssignedTicketsQuery,
  useGetSupporterStatsQuery,
  useGetAssignedTicketDetailsQuery,
  useResolveTicketMutation,
  useUpdateSupporterProfileMutation,
} = supporterTicketApi;
