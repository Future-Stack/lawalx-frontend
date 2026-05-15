import { baseApi } from "../../baseApi";
import type { CheckoutApiResponse, CheckoutPayload } from "./payment.type";

export const userPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckout: builder.mutation<CheckoutApiResponse, CheckoutPayload>({
      query: (data) => ({
        url: "/payment/checkout",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "UserPlans"],
    }),
  }),
});

export const { useCreateCheckoutMutation } = userPaymentApi;
export const useCreatePaymentMutation = useCreateCheckoutMutation;
