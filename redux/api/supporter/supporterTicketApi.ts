
/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface SupporterTag {
  id: string;
  name: string;
  key: string;
  isGlobal: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketTag {
  id: string;
  name: string;
  key: string;
  isGlobal: boolean;
  addedBy: string;
  createdAt: string;
}

export interface GetTagsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SupporterTag[];
}

export interface CreateTagResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SupporterTag;
}

export interface UpdateTagResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: SupporterTag;
}

export interface GetTicketTagsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TicketTag[];
}

export interface GenericApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: unknown;
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
    getTags: builder.query<GetTagsResponse, void>({
      query: () => ({
        url: '/supporter/support/tags',
        method: 'GET',
      }),
      providesTags: ['SupporterTag'],
    }),
    createTag: builder.mutation<CreateTagResponse, { name: string }>({
      query: (body) => ({
        url: '/supporter/support/tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupporterTag'],
    }),
    updateTag: builder.mutation<UpdateTagResponse, { id: string; name: string }>({
      query: ({ id, ...body }) => ({
        url: `/supporter/support/tags/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['SupporterTag', 'TicketTag'],
    }),
    deleteTag: builder.mutation<GenericApiResponse, string>({
      query: (id) => ({
        url: `/supporter/support/tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupporterTag', 'TicketTag'],
    }),
    getTicketTags: builder.query<GetTicketTagsResponse, string>({
      query: (ticketId) => ({
        url: `/supporter/support/tickets/${ticketId}/tags`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'TicketTag', id: arg }],
    }),
    attachTagToTicket: builder.mutation<GenericApiResponse, { ticketId: string; tagId: string }>({
      query: ({ ticketId, tagId }) => ({
        url: `/supporter/support/tickets/${ticketId}/tags`,
        method: 'POST',
        body: { tagId },
      }),
      invalidatesTags: (result, error, { ticketId }) => [{ type: 'TicketTag', id: ticketId }],
    }),
    removeTagFromTicket: builder.mutation<GenericApiResponse, { ticketId: string; tagId: string }>({
      query: ({ ticketId, tagId }) => ({
        url: `/supporter/support/tickets/${ticketId}/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { ticketId }) => [{ type: 'TicketTag', id: ticketId }],
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
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
  useGetTicketTagsQuery,
  useAttachTagToTicketMutation,
  useRemoveTagFromTicketMutation,
} = supporterTicketApi;
