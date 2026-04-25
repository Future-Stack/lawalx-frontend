import { baseApi } from "../../baseApi";

// Enums & Types
export enum AdminTicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'InProgress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export enum AdminTicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface AdminTicketUser {
  id: string;
  username: string;
  image_url: string | null;
  account: {
    email: string;
  };
}

export interface AdminSupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  file: string[];
  issueType: string[];
  priority: AdminTicketPriority | string;
  status: AdminTicketStatus | string;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  adminNote: string | null;
  customId: string;
  user: AdminTicketUser;
  assignments: any[];
}

export interface GetAllTicketsParams {
  ticketId?: string;
  customId?: string;
  status?: AdminTicketStatus | string;
  priority?: AdminTicketPriority | string;
  userName?: string;
}

export interface GetAllTicketsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: AdminSupportTicket[];
}

export interface AssignTicketDto {
  supporterId: string;
}

export interface UpdateTicketDto {
  priority?: string;
  status?: string;
  adminNote?: string;
  supporterId?: string;
}

export const adminSupportTicketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllSupportTickets: builder.query<GetAllTicketsResponse, GetAllTicketsParams | void>({
      query: (params) => ({
        url: '/admin/support/all-tickets',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['AdminSupportTicket'],
    }),
    assignSupportTicket: builder.mutation<{ success: boolean; message: string; data: any }, { ticketId: string; body: AssignTicketDto }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/assign/${ticketId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminSupportTicket'],
    }),
    updateSupportTicket: builder.mutation<{ success: boolean; message: string; data: any }, { ticketId: string; body: UpdateTicketDto }>({
      query: ({ ticketId, body }) => ({
        url: `/admin/support/ticket/${ticketId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminSupportTicket'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllSupportTicketsQuery,
  useAssignSupportTicketMutation,
  useUpdateSupportTicketMutation,
} = adminSupportTicketApi;
