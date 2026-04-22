import { baseApi } from "../../../baseApi";

// Types
export interface CouponItem {
  id: string;
  name: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  useLimit: number;
  usedCount: number;
  expiryDate: string;
  applicablePlans: string[];
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
  createdAt: string;
  updatedAt: string;
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
}

export interface CouponsListData {
  data: CouponItem[];
  meta: PaginationMeta;
}

export type GetCouponsResponse = ApiResponse<CouponsListData>;
export type GetActiveCouponsResponse = ApiResponse<CouponItem[]>;
export type GetSingleCouponResponse = ApiResponse<CouponItem>;
export type CreateCouponResponse = ApiResponse<CouponItem>;
export type UpdateCouponResponse = ApiResponse<CouponItem>;
export type UpdateCouponStatusResponse = ApiResponse<CouponItem>;

export interface GetCouponsParams {
  search?: string;
  status?: "ACTIVE" | "EXPIRED" | "DISABLED";
  page?: number;
  limit?: number;
}

export interface CreateCouponPayload {
  name: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  useLimit: number;
  expiryDate: string;
  applicablePlans: string[];
}

export interface UpdateCouponPayload {
  name?: string;
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  useLimit?: number;
  expiryDate?: string;
  applicablePlans?: string[];
}

export interface UpdateCouponStatusPayload {
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
}

// API
export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCoupons: builder.query<GetCouponsResponse, GetCouponsParams>({
      query: (params) => ({
        url: `/coupon-managements`,
        method: "GET",
        params,
      }),
      providesTags: ["Subscription"],
    }),
    getActiveCoupons: builder.query<GetActiveCouponsResponse, void>({
      query: () => ({
        url: `/coupon-managements/active`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    getSingleCoupon: builder.query<GetSingleCouponResponse, string>({
      query: (id) => ({
        url: `/coupon-managements/${id}`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    createCoupon: builder.mutation<CreateCouponResponse, CreateCouponPayload>({
      query: (data) => ({
        url: `/coupon-managements`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    updateCoupon: builder.mutation<
      UpdateCouponResponse,
      { id: string; data: UpdateCouponPayload }
    >({
      query: ({ id, data }) => ({
        url: `/coupon-managements/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    updateCouponStatus: builder.mutation<
      UpdateCouponStatusResponse,
      { id: string; data: UpdateCouponStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/coupon-managements/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useLazyGetCouponsQuery,
  useGetActiveCouponsQuery,
  useLazyGetActiveCouponsQuery,
  useGetSingleCouponQuery,
  useLazyGetSingleCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useUpdateCouponStatusMutation,
} = couponsApi;
