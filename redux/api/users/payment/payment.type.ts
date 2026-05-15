export interface CheckoutPayload {
  planId: string;
  billingCycle: "MONTHLY" | "YEARLY";
  screenSize: number;
  country: string;
  gateway: "stripe" | "paystack";
}

export interface CheckoutBreakdown {
  subtotal: number;
  tax: number;
  taxRate: string;
  total: number;
  currency: string;
}

export interface CheckoutResponseData {
  paymentId: string;
  checkoutUrl: string;
  referenceId: string;
  gateway: string;
  planName: string;
  email: string;
  country: string;
  breakdown: CheckoutBreakdown;
  message: string;
}

export interface CheckoutApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: CheckoutResponseData;
}
