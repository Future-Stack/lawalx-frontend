export type BillingCycle = "MONTHLY" | "YEARLY";

export interface YearlyDiscount {
  hasYearlyDiscount: boolean;
  discountType: string;
  yearlyDiscountRate: number;
  originalAnnualAmount: number;
  discountAmount: number;
  discountedAnnualAmount: number;
  originalAnnualCurrency: string;
  discountedAnnualCurrency: string;
}

export interface UserPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  deviceLimit: number;
  storageLimitGb: number;
  templateLimit: number;
  photoLimit: number;
  audioLimit: number;
  videoLimit: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  originalAmount: number;
  originalCurrency: string;
  billing: BillingCycle;
  yearlyDiscount: YearlyDiscount;
}

export interface ActiveScreenSize {
  size: number;
  price: number;
  currency: string;
  originalPrice: number;
  originalCurrency: string;
}

export interface PlanApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface YearlyDiscountConfig {
  id: string;
  hasYearlyDiscount: boolean;
  discountType: "PERCENTAGE" | "FIXED";
  yearlyDiscountRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivePlansParams {
  billing: BillingCycle;
  screenSize: number;
}

export interface PlanByIdParams {
  id: string;
  billing: BillingCycle;
  screenSize: number;
}

export interface VerifyCouponParams {
  code: string;
  planId: string;
  billing: BillingCycle;
  screenSize: number;
}

export interface CouponData {
  coupon: {
    code: string;
    discount: number;
  };
  originalPrice: number;
  discountPrice: number;
}

export function parseScreenSize(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = parseInt(String(value).replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 0 : n;
}

export function formatScreenSizeLabel(size: number): string {
  return `${size} inches`;
}

export function billingFromAnnual(isAnnual: boolean): BillingCycle {
  return isAnnual ? "YEARLY" : "MONTHLY";
}
