import { baseApi } from "../../baseApi";
import type {
  AdditionalPaymentCheckoutResponse,
  AdditionalPaymentDetailResponse,
  CreateAdditionalPaymentCheckoutDto,
  MyAdditionalPaymentsResponse,
} from "@/redux/api/admin/payments/additional-payment/additionalPayment.type";

export const userAdditionalPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAdditionalPayments: builder.query<MyAdditionalPaymentsResponse, void>({
      query: () => ({
        url: "/additional-payments/my",
        method: "GET",
      }),
      providesTags: ["AdditionalPayment"],
    }),

    getMyAdditionalPaymentById: builder.query<
      AdditionalPaymentDetailResponse,
      string
    >({
      query: (id) => ({
        url: `/additional-payments/${id}`,
        method: "GET",
      }),
      providesTags: ["AdditionalPayment"],
    }),

    payAdditionalPayment: builder.mutation<
      AdditionalPaymentCheckoutResponse,
      { id: string } & CreateAdditionalPaymentCheckoutDto
    >({
      query: ({ id, ...body }) => ({
        url: `/additional-payments/${id}/pay`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdditionalPayment", "Subscription"],
    }),
  }),
});

export const {
  useGetMyAdditionalPaymentsQuery,
  useGetMyAdditionalPaymentByIdQuery,
  usePayAdditionalPaymentMutation,
} = userAdditionalPaymentApi;
