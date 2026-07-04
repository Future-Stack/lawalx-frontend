import { baseApi } from "../../baseApi";
import type {
  CheckoutApiResponse,
  CheckoutPayload,
  EnterpriseCheckoutPayload,
  MySubscriptionApiResponse,
  ChangePlanPayload,
  ChangePlanApiResponse,
  UserBillingHistoryResponse,
} from "./payment.type";

export const userPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMySubscription: builder.query<MySubscriptionApiResponse, void>({
      query: () => ({
        url: "/payment/my-subscription",
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    createCheckout: builder.mutation<CheckoutApiResponse, CheckoutPayload>({
      query: (data) => ({
        url: "/payment/checkout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "UserPlans"],
    }),
    createEnterpriseCheckout: builder.mutation<CheckoutApiResponse, EnterpriseCheckoutPayload>({
      query: (data) => ({
        url: "/payment/enterprise-checkout",
        method: "POST",
        body: data,
      }),
    }),
    cancelSubscription: builder.mutation<MySubscriptionApiResponse, { userId: string }>({
      query: ({ userId }) => ({
        url: `/subscribers/cancel?userId=${userId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Subscription"],
    }),
    updateRecurring: builder.mutation<MySubscriptionApiResponse, { recurring: boolean }>({
      query: (data) => ({
        url: "/payment/my-subscription/recurring",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    changePlan: builder.mutation<ChangePlanApiResponse, ChangePlanPayload>({
      query: (data) => ({
        url: "/payment/change-plan",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    getMyBillingHistory: builder.query<UserBillingHistoryResponse, void>({
      query: () => ({
        url: "/payment/my-billing-history",
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetMySubscriptionQuery,
  useCreateCheckoutMutation,
  useCreateEnterpriseCheckoutMutation,
  useCancelSubscriptionMutation,
  useUpdateRecurringMutation,
  useChangePlanMutation,
  useGetMyBillingHistoryQuery,
} = userPaymentApi;
export const useCreatePaymentMutation = useCreateCheckoutMutation;
