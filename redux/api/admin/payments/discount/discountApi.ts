import { baseApi } from "../../../baseApi";

// Types
export interface YearlyDiscountItem {
  id: string;
  hasYearlyDiscount: boolean;
  discountType: "PERCENTAGE" | "FIXED";
  yearlyDiscountRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export type GetYearlyDiscountsResponse = ApiResponse<YearlyDiscountItem[]>;
export type GetSingleDiscountResponse = ApiResponse<YearlyDiscountItem>;
export type UpdateDiscountResponse = ApiResponse<YearlyDiscountItem>;
export type UpdateDiscountStatusResponse = ApiResponse<YearlyDiscountItem>;

export interface UpdateDiscountPayload {
  yearlyDiscountRate: number;
  discountType: "PERCENTAGE" | "FIXED";
}

export interface UpdateDiscountStatusPayload {
  hasYearlyDiscount: boolean;
}

// API
export const discountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getYearlyDiscounts: builder.query<GetYearlyDiscountsResponse, void>({
      query: () => ({
        url: `/yearly-discount`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    getSingleDiscount: builder.query<GetSingleDiscountResponse, string>({
      query: (id) => ({
        url: `/yearly-discount/${id}`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    updateDiscount: builder.mutation<
      UpdateDiscountResponse,
      { id: string; data: UpdateDiscountPayload }
    >({
      query: ({ id, data }) => ({
        url: `/yearly-discount/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    updateDiscountStatus: builder.mutation<
      UpdateDiscountStatusResponse,
      { id: string; data: UpdateDiscountStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/yearly-discount/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetYearlyDiscountsQuery,
  useLazyGetYearlyDiscountsQuery,
  useGetSingleDiscountQuery,
  useLazyGetSingleDiscountQuery,
  useUpdateDiscountMutation,
  useUpdateDiscountStatusMutation,
} = discountApi;
