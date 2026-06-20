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
  brand?: string | null;
  last4?: string | null;
  amount: number;
  originalAmount?: number;
  originalCurrency?: string;
  status: PaymentStatus;
  date: string;
  canViewInStripe: boolean;
  planName?: string;
  planDescription?: string;
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
  timeRange?: string;
}

// Stats
export interface BillingStatsData {
  totalActivePaymentsAmount: number;
  totalActivePaymentsCount: number;
  totalActivePaymentsCurrency: string;
  totalActivePaymentsOriginalAmount: number;
  totalActivePaymentsOriginalCurrency: string;
  totalFailedPaymentsAmount: number;
  totalFailedPaymentsCount: number;
  totalFailedPaymentsCurrency: string;
  totalFailedPaymentsOriginalAmount: number;
  totalFailedPaymentsOriginalCurrency: string;
  totalRefundedPaymentsAmount: number;
  totalRefundedPaymentsCount: number;
  totalRefundedPaymentsCurrency: string;
  totalRefundedPaymentsOriginalAmount: number;
  totalRefundedPaymentsOriginalCurrency: string;
  totalPartiallyRefundedPaymentsAmount: number;
  totalPartiallyRefundedPaymentsCount: number;
  totalPartiallyRefundedPaymentsCurrency: string;
  totalPartiallyRefundedPaymentsOriginalAmount: number;
  totalPartiallyRefundedPaymentsOriginalCurrency: string;
  totalCancelledPaymentsAmount: number;
  totalCancelledPaymentsCount: number;
  totalCancelledPaymentsCurrency: string;
  totalCancelledPaymentsOriginalAmount: number;
  totalCancelledPaymentsOriginalCurrency: string;
  totalPendingPaymentsAmount: number;
  totalPendingPaymentsCount: number;
  totalPendingPaymentsCurrency: string;
  totalPendingPaymentsOriginalAmount: number;
  totalPendingPaymentsOriginalCurrency: string;
  totalSuccessPaymentsAmount: number;
  totalSuccessPaymentsCount: number;
  totalSuccessPaymentsCurrency: string;
  totalSuccessPaymentsOriginalAmount: number;
  totalSuccessPaymentsOriginalCurrency: string;
}

export interface BillingStatsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: BillingStatsData;
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
      providesTags: ["Billing", "FinancialData"],
    }),

    viewInGateway: builder.query<GatewayViewResponse, string>({
      query: (paymentId) => ({
        url: `/billings/${paymentId}/view-in-gateway`,
        method: "GET",
      }),
    }),

    getBillingStats: builder.query<
      BillingStatsResponse,
      { timeRange?: string; status?: string }
    >({
      query: (params) => {
        const cleaned: Record<string, unknown> = {};
        if (params.timeRange && params.timeRange !== "ALL") {
          cleaned.timeRange = params.timeRange;
        }
        if (params.status && params.status !== "all") {
          cleaned.status = params.status;
        }
        return {
          url: "/billings/stats",
          method: "GET",
          params: cleaned,
        };
      },
      providesTags: ["Billing", "FinancialData"],
    }),
  }),
});

export const {
  useGetPaymentHistoryQuery,
  useLazyGetPaymentHistoryQuery,
  useLazyViewInGatewayQuery,
  useGetBillingStatsQuery,
} = billingsApi;
