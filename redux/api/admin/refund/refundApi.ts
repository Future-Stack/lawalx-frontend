import { baseApi } from "../../baseApi";

export interface ProcessRefundRequest {
  paymentId: string;
  refundType: "FULL" | "PARTIAL" | "PRORATED";
  reason: "DUPLICATE_CHARGE" | "SERVICE_DISSATISFACTION" | "OTHER";
  refundAmount?: number;
  internalNote?: string;
  cancelSubscription?: boolean;
  sendReceipt?: boolean;
}

export interface RefundUser {
  id: string;
  username: string;
  full_name: string;
  company_name: string | null;
}

export interface RefundPayment {
  id: string;
  email: string;
  amount: number;
  transactionId: string;
  currency: string;
  status: string;
  user: RefundUser;
  originalAmount: number;
  originalCurrency: string;
  customerName: string;
}

export interface RefundData {
  id: string;
  paymentId: string;
  refundType: string;
  refundAmount: number;
  reason: string;
  gateway: string;
  gatewayRefundId: string;
  status: string;
  internalNote: string;
  processedBy: string;
  cancelSubscription: boolean;
  sendReceipt: boolean;
  createdAt: string;
  updatedAt: string;
  payment: RefundPayment;
  refundCurrency: string;
  originalRefundAmount: number;
  originalRefundCurrency: string;
}

export interface ProcessRefundResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: RefundData;
}

export const refundApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    processRefund: builder.mutation<ProcessRefundResponse, ProcessRefundRequest>({
      query: (body) => ({
        url: "/refunds",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Billing", "FinancialData"],
    }),
  }),
});

export const { useProcessRefundMutation } = refundApi;
