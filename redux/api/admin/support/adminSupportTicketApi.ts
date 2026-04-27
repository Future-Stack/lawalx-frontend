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

export type TicketStatus = 'Opened' | 'Resolved' | 'In Progress' | 'Closed';
export type TicketPriority = 'High' | 'Medium' | 'Low' | 'Normal';

export interface Company {
  name: string;
  iconBg: string;
  iconText: string;
}

export interface Assignee {
  id?: string;
  name: string;
  initials: string;
  role?: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  company: Company;
  subject: string;
  status: TicketStatus;
  lastUpdated: string;
  priority: TicketPriority;
  assignedTo: Assignee | null;
  assignedToId?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
  raw?: any;
}

export interface AdminTicketUser {
  id: string;
  username: string;
  image_url: string | null;
  account: {
    email: string;
  };
}

export interface TicketAssignmentUser {
  username: string;
  image_url: string | null;
  role: string;
  account: {
    email: string;
  };
}

export interface TicketAssignment {
  id?: string;
  supporterId?: string;
  user: TicketAssignmentUser;
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
  assignments: TicketAssignment[];
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

export interface TicketStatsData {
  total: number;
  open: number;
  assigned: number;
  unassigned: number;
  solved: number;
}

export interface TicketStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: TicketStatsData;
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
        url: `/admin/support/${ticketId}/assign`,
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
    getTicketStatistics: builder.query<TicketStatsResponse, void>({
      query: () => ({
        url: '/admin/support/stats',
        method: 'GET',
      }),
      providesTags: ['AdminSupportTicket'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllSupportTicketsQuery,
  useLazyGetAllSupportTicketsQuery,
  useAssignSupportTicketMutation,
  useUpdateSupportTicketMutation,
  useGetTicketStatisticsQuery,
} = adminSupportTicketApi;
