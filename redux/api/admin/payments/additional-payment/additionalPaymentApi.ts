import { baseApi } from "../../../baseApi";
import type {
  AdditionalPaymentDetailResponse,
  AdditionalPaymentListResponse,
  AdditionalPaymentSignersResponse,
  CreateAdditionalPaymentDto,
  GetAdditionalPaymentsParams,
} from "./additionalPayment.type";

export const additionalPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdditionalPayments: builder.query<
      AdditionalPaymentListResponse,
      GetAdditionalPaymentsParams
    >({
      query: (params) => {
        const cleaned: Record<string, unknown> = {};
        (Object.keys(params) as (keyof GetAdditionalPaymentsParams)[]).forEach(
          (k) => {
            const v = params[k];
            if (v !== undefined && v !== "" && v !== null) {
              cleaned[k] = v;
            }
          },
        );
        return {
          url: "/additional-payments",
          method: "GET",
          params: cleaned,
        };
      },
      providesTags: ["AdditionalPayment", "FinancialData"],
    }),

    getAdditionalPaymentById: builder.query<
      AdditionalPaymentDetailResponse,
      string
    >({
      query: (id) => ({
        url: `/additional-payments/${id}`,
        method: "GET",
      }),
      providesTags: ["AdditionalPayment"],
    }),

    getAdditionalPaymentSigners: builder.query<
      AdditionalPaymentSignersResponse,
      { type: "AUTHORIZED_BY" | "APPROVED_BY" }
    >({
      query: (params) => ({
        url: "/additional-payments/signers",
        method: "GET",
        params,
      }),
    }),

    createAdditionalPayment: builder.mutation<
      AdditionalPaymentDetailResponse,
      CreateAdditionalPaymentDto
    >({
      query: (body) => ({
        url: "/additional-payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdditionalPayment", "FinancialData"],
    }),
  }),
});

export const {
  useGetAdditionalPaymentsQuery,
  useGetAdditionalPaymentByIdQuery,
  useGetAdditionalPaymentSignersQuery,
  useCreateAdditionalPaymentMutation,
} = additionalPaymentApi;
