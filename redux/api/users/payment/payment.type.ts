export interface CheckoutPayload {
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
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

export interface SubscriptionPlanSummary {
  id: string;
  name: string;
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  currency: string;
  transactionId: string;
  gateway: "stripe" | "paystack" | string;
  status: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  originalAmount: number;
  originalCurrency: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL" | string;
  recurring: boolean;
  gateway: "stripe" | "paystack" | string;
  gatewaySubscriptionId: string | null;
  gatewayCustomerId: string | null;
  gatewaySubscriptionToken: string | null;
  startDate: string;
  endDate: string;
  status: string;
  deviceLimit: number;
  storageLimitGb: number;
  fileLimit: number;
  fileSizeLimitMb: number | null;
  isAdvanceEnabled: boolean;
  createdAt: string;
  plan: SubscriptionPlanSummary;
  payments: SubscriptionPayment[];
}

export interface MySubscriptionData {
  success: boolean;
  message: string;
  subscription: UserSubscription | null;
}

export interface MySubscriptionApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: MySubscriptionData;
}
