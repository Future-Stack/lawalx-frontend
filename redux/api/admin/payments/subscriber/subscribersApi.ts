import { baseApi } from "../../../baseApi";

// Types
export interface SubscriberItem {
  userId: string;
  userName: string;
  email: string;
  plan: string;
  amount: number;
  currency: string;
  paymentCycle: "MONTHLY" | "YEARLY";
  nextBilling: string;
  subscriptionStatus: "ACTIVE" | "INACTIVE" | "CANCELLED" | "EXPIRED";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export type GetSubscribersResponse = ApiResponse<SubscriberItem[]>;

export interface GetSubscribersParams {
  page?: number;
  limit?: number;
  search?: string;
  plan?: string;
  status?: string;
}

// User Invoice Types
export interface UserInfo {
  id: string;
  username: string;
  fullName: string | null;
  companyName: string | null;
  officialName: string | null;
  designation: string | null;
  location: string | null;
  cityCountry: string | null;
  phoneCountry: string | null;
  phoneNumber: string | null;
  website: string | null;
  status: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInfo {
  id: string;
  userId: string;
  planId: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  status: string;
  deviceLimit: number;
  storageLimitGb: number;
  fileLimit: number;
  fileSizeLimitMb: number;
  isAdvanceEnabled: boolean;
  createdAt: string;
}

export interface PaymentInfo {
  paymentId: string;
  invoiceNumber: string;
  date: string;
  plan: string;
  subscriptionId: string;
  amountPaid: number;
  currency: string;
  status: string;
  transactionId: string;
  gateway: string;
  customerEmail: string;
}

export interface UserInvoiceData {
  user: UserInfo;
  subscriptions: SubscriptionInfo;
  payment: PaymentInfo;
}

export type GetUserInvoicesResponse = ApiResponse<UserInvoiceData>;

// API
export const subscribersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query<GetSubscribersResponse, GetSubscribersParams>({
      query: (params) => ({
        url: `/subscribers`,
        method: "GET",
        params,
      }),
      providesTags: ["Subscription", "FinancialData"],
    }),
    getUserInvoices: builder.query<GetUserInvoicesResponse, string>({
      query: (userId) => ({
        url: `/subscribers/${userId}/invoices`,
        method: "GET",
      }),
      providesTags: ["Subscription", "FinancialData"],
    }),
  }),
});

export const {
  useGetSubscribersQuery,
  useLazyGetSubscribersQuery,
  useGetUserInvoicesQuery,
  useLazyGetUserInvoicesQuery,
} = subscribersApi;
