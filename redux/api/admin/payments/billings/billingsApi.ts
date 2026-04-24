import { baseApi } from "../../../baseApi";

// ── Enums & Types ─────────────────────────────────────────────────────────────

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CANCELLED";

export interface BillingUser {
  id: string;
  name: string;
  email: string;
}

export interface PaymentHistoryItem {
  paymentId: string;
  invoice: string;
  user: BillingUser;
  paymentMethod: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  canViewInStripe: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentHistoryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: PaymentHistoryItem[];
  meta: PaginationMeta;
}

export interface GetPaymentHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus | "";
  period?: string;
}

// View-in-gateway
export interface GatewayViewData {
  paymentId: string;
  gateway: string;
  transactionId: string;
  viewUrl: string;
  paystackTransactionId?: string;
}

export interface GatewayViewResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: GatewayViewData;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const billingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentHistory: builder.query<
      PaymentHistoryResponse,
      GetPaymentHistoryParams
    >({
      query: (params) => {
        // Strip empty/undefined params so they don't appear in the URL
        const cleaned: Record<string, unknown> = {};
        (Object.keys(params) as (keyof GetPaymentHistoryParams)[]).forEach(
          (k) => {
            const v = params[k];
            if (v !== undefined && v !== "" && v !== null) {
              cleaned[k] = v;
            }
          }
        );
        return {
          url: "/billings/payment-history",
          method: "GET",
          params: cleaned,
        };
      },
      providesTags: ["Billing"],
    }),

    viewInGateway: builder.query<GatewayViewResponse, string>({
      query: (paymentId) => ({
        url: `/billings/${paymentId}/view-in-gateway`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetPaymentHistoryQuery,
  useLazyGetPaymentHistoryQuery,
  useLazyViewInGatewayQuery,
} = billingsApi;
