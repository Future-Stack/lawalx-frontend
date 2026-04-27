import { baseApi } from "../../baseApi";

// Enums & Types
export enum EmployeeRole {
  ADMIN = 'ADMIN',
  SUPPORTER = 'SUPPORTER',
}

export enum SupporterRole {
  DEVICE_SUPPORT = 'DEVICE_SUPPORT',
  PAYMENT_SUPPORT = 'PAYMENT_SUPPORT',
  TECH_SUPPORT = 'TECH_SUPPORT',
  ACCOUNT_SUPPORT = 'ACCOUNT_SUPPORT',
  ORDER_SUPPORT = 'ORDER_SUPPORT',
  GENERAL_SUPPORT = 'GENERAL_SUPPORT',
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: 'Available' | 'Busy';
  activeTickets: number;
  ticketTags: string[];
}

export interface CreateSupporterDto {
  username: string;
  email: string;
  password?: string;
  employeeRole: EmployeeRole | string;
  supporterRole: SupporterRole[] | string[];
  skills: string[];
}

export interface SupporterUser {
  id: string;
  full_name?: string | null;
  username: string;
  role: string;
  account: {
    email: string;
  };
}

export interface EmployeeData {
  id: string;
  userId: string;
  supporterRole: string[];
  skills: string[];
  workload: number;
  workItems: any[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  user: SupporterUser;
}

export interface GetAllEmployeesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: EmployeeData[];
}

export interface UpdateSupporterDto {
  workload?: number;
  skills?: string[];
  supporterRole?: string;
}

export interface GetAllEmployeesParams {
  filterFullWorkload?: boolean;
}

export const adminSupporterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createEmployee: builder.mutation<{ success: boolean; message: string; data: any }, CreateSupporterDto>({
      query: (body) => ({
        url: '/admin/support/create-employees',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminEmployee', 'AdminSupporter'],
    }),
    getAllEmployees: builder.query<GetAllEmployeesResponse, GetAllEmployeesParams | void>({
      query: (params) => ({
        url: '/admin/support/all-employees',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['AdminEmployee'],
    }),
    getAllSupporters: builder.query<GetAllEmployeesResponse, GetAllEmployeesParams | void>({
      query: (params) => ({
        url: '/admin/support/all-supporters',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['AdminSupporter'],
    }),
    updateSupporter: builder.mutation<{ success: boolean; message: string; data: any }, { supporterId: string; body: UpdateSupporterDto }>({
      query: ({ supporterId, body }) => ({
        url: `/admin/support/${supporterId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminEmployee', 'AdminSupporter'],
    }),
    deleteSupporterHard: builder.mutation<{ success: boolean; message: string; data: any }, string>({
      query: (supporterId) => ({
        url: `/admin/support/${supporterId}/hard`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminEmployee', 'AdminSupporter'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateEmployeeMutation,
  useGetAllEmployeesQuery,
  useGetAllSupportersQuery,
  useUpdateSupporterMutation,
  useDeleteSupporterHardMutation,
} = adminSupporterApi;
