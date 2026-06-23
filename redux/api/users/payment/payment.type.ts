export interface CheckoutPayload {
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  screenSize: number;
  country: string;
  gateway: "stripe" | "paystack";
  deviceQuantity: number;
  couponCode?: string;
}

export interface EnterpriseCheckoutPayload {
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  screenSize: number;
  country: string;
  gateway: "stripe" | "paystack";
  deviceQuantity?: number;
  couponCode?: string;
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

export interface ChangePlanPayload {
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  screenSize: number;
  deviceQuantity?: number;
  country: string;
  couponCode?: string;
  gateway: "stripe" | "paystack";
}

export interface ChangePlanBreakdown {
  subtotal: number;
  remainingCredit: number;
  couponDiscount: number;
  tax: number;
  taxRate: string;
  total: number;
  currency: string;
}

export interface ChangePlanResponseData {
  paymentId: string;
  checkoutUrl: string;
  referenceId: string;
  gateway: string;
  changeType: "UPGRADE" | "DOWNGRADE";
  currentPlan: string;
  targetPlan: string;
  effectiveDate: string;
  breakdown: ChangePlanBreakdown;
  message: string;
}

export interface ChangePlanApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ChangePlanResponseData;
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
  gateway: "stripe" | "paystack" | string | null;
  gatewaySubscriptionId: string | null;
  gatewayCustomerId: string | null;
  gatewaySubscriptionToken: string | null;
  startDate: string;
  endDate: string;
  status: string;
  cancelledAt: string | null;
  deviceLimit: number;
  storageLimitGb: number;
  templateLimit: number;
  photoLimit: number;
  audioLimit: number;
  videoLimit: number;
  features: string[];
  screenSize: number | null;
  deviceQuantity: number;
  isAdvanceEnabled: boolean | null;
  scheduledPlanId: string | null;
  scheduledBillingCycle: string | null;
  scheduledScreenSize: number | null;
  scheduledDeviceQuantity: number | null;
  scheduledEffectiveDate: string | null;
  scheduledPaymentId: string | null;
  createdAt: string;
  plan: SubscriptionPlanSummary;
  payments: SubscriptionPayment[];
  deviceUsage?: {
    used: number;
    total: number;
    remaining: number;
  };
  storageUsage?: {
    usedGb: number;
    totalGb: number;
    remainingGb: number;
  };
  scheduledPlanChange?: {
    subscriptionId: string;
    plan: SubscriptionPlanSummary;
    billingCycle: string;
    effectiveDate: string;
    deviceQuantity: number;
    screenSize: number;
  } | null;
}

export interface MySubscriptionApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: UserSubscription | null;
}
