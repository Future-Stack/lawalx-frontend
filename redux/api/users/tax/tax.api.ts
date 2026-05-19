import { baseApi } from "../../baseApi";
import type { ActiveTaxRegion, TaxApiResponse } from "./tax.type";

export const userTaxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveTaxRegions: builder.query<TaxApiResponse<ActiveTaxRegion[]>, void>({
      query: () => ({
        url: "/tax/active",
        method: "GET",
      }),
      providesTags: ["Tax", "UserPlans"],
    }),
  }),
});

export const { useGetActiveTaxRegionsQuery } = userTaxApi;
