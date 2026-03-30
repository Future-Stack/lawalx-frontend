/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from "../baseApi";
import { ApiResponse } from "../users/content/content.type";
import { SubscriptionPayload } from "./subscription.type";


const subscriptionAPI = baseApi.injectEndpoints({
    endpoints: (build) => ({
        createPayment: build.mutation<ApiResponse<{ url: string }>, SubscriptionPayload>({
            query: (data) => ({
                url: "/payments",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Subscription"],
        }),
    }),
});

export const { useCreatePaymentMutation } = subscriptionAPI;
