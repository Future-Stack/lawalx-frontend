import { baseApi } from "../../../baseApi";

// Types
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

export interface PlanItem {
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
  billing: string;
  yearlyDiscount: YearlyDiscount;
}

export interface ScreenSizeItem {
  size: number;
  price: number;
  currency: string;
  originalPrice: number;
  originalCurrency: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export type GetPlansResponse = ApiResponse<PlanItem[]>;
export type GetSinglePlanResponse = ApiResponse<PlanItem>;
export type UpdatePlanResponse = ApiResponse<PlanItem>;
export type GetScreenSizesResponse = ApiResponse<ScreenSizeItem[]>;

export interface UpdatePlanPayload {
  description?: string;
  price?: number;
  currency?: string;
  deviceLimit?: number;
  storageLimitGb?: number;
  templateLimit?: number;
  photoLimit?: number;
  audioLimit?: number;
  videoLimit?: number;
  isActive?: boolean;
}

// API
export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<GetPlansResponse, string | number | void>({
      query: (screenSize) => ({
        url: `/plans`,
        method: "GET",
        params: screenSize ? { screenSize } : {},
      }),
      providesTags: ["Subscription", "FinancialData"],
    }),
    getActiveScreenSizes: builder.query<GetScreenSizesResponse, void>({
      query: () => ({
        url: `/subscription-management/screen-size/active`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    getSinglePlan: builder.query<GetSinglePlanResponse, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: "GET",
      }),
      providesTags: ["Subscription", "FinancialData"],
    }),
    updatePlan: builder.mutation<UpdatePlanResponse, { id: string; data: UpdatePlanPayload }>({
      query: ({ id, data }) => ({
        url: `/plans/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription", "FinancialData"],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useGetActiveScreenSizesQuery,
  useGetSinglePlanQuery,
  useLazyGetSinglePlanQuery,
  useUpdatePlanMutation,
} = plansApi;
