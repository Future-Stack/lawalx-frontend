import { baseApi } from "../../baseApi";
import type {
  ActivePlansParams,
  ActiveScreenSize,
  PlanApiResponse,
  PlanByIdParams,
  UserPlan,
  YearlyDiscountConfig,
  VerifyCouponParams,
  CouponData,
} from "./plan.type";

export const userPlanApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivePlans: builder.query<PlanApiResponse<UserPlan[]>, ActivePlansParams>({
      query: ({ billing, screenSize }) => ({
        url: "/plans/active",
        method: "GET",
        params: { billing, screenSize },
      }),
      providesTags: ["UserPlans"],
    }),
    getPlanById: builder.query<PlanApiResponse<UserPlan>, PlanByIdParams>({
      query: ({ id, billing, screenSize }) => ({
        url: `/plans/${id}`,
        method: "GET",
        params: { billing, screenSize },
      }),
      providesTags: (_result, _error, { id }) => [{ type: "UserPlans", id }],
    }),
    getActiveScreenSizes: builder.query<
      PlanApiResponse<ActiveScreenSize[]>,
      void
    >({
      query: () => ({
        url: "/subscription-management/screen-size/active",
        method: "GET",
      }),
      providesTags: ["UserPlans"],
    }),
    getYearlyDiscounts: builder.query<
      PlanApiResponse<YearlyDiscountConfig[]>,
      void
    >({
      query: () => ({
        url: "/yearly-discount",
        method: "GET",
      }),
      providesTags: ["UserPlans"],
    }),
    verifyCoupon: builder.mutation<PlanApiResponse<CouponData>, VerifyCouponParams>({
      query: ({ code, planId, billing, screenSize }) => ({
        url: "/coupon-managements/verify-coupon",
        method: "GET",
        params: { code, planId, billing, screenSize },
      }),
    }),
  }),
});

export const {
  useGetActivePlansQuery,
  useGetPlanByIdQuery,
  useGetActiveScreenSizesQuery,
  useGetYearlyDiscountsQuery,
  useVerifyCouponMutation,
} = userPlanApi;
