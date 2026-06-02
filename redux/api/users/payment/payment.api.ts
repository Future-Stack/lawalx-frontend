import { baseApi } from "../../baseApi";
import type {
  CheckoutApiResponse,
  CheckoutPayload,
  EnterpriseCheckoutPayload,
  MySubscriptionApiResponse,
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
  }),
});

export const { useGetMySubscriptionQuery, useCreateCheckoutMutation, useCreateEnterpriseCheckoutMutation } =
  userPaymentApi;
export const useCreatePaymentMutation = useCreateCheckoutMutation;
