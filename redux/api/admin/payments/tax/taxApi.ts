import { baseApi } from "../../../baseApi";

export interface TaxRegion {
  id: string;
  region: string;
  taxRate: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaxPaginationMeta {
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
  meta?: TaxPaginationMeta;
}

export interface GetTaxesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTaxPayload {
  region: string;
  taxRate: number;
}

export interface UpdateTaxPayload {
  region?: string;
  taxRate?: number;
}

export interface UpdateTaxStatusPayload {
  isActive: boolean;
}

export const taxApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaxes: builder.query<ApiResponse<TaxRegion[]>, GetTaxesParams | void>({
      query: (params) => ({
        url: "/tax",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Tax"],
    }),
    getTaxById: builder.query<ApiResponse<TaxRegion>, string>({
      query: (id) => ({
        url: `/tax/${id}`,
        method: "GET",
      }),
      providesTags: ["Tax"],
    }),
    createTax: builder.mutation<ApiResponse<TaxRegion>, CreateTaxPayload>({
      query: (data) => ({
        url: "/tax",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),
    updateTax: builder.mutation<
      ApiResponse<TaxRegion>,
      { id: string; data: UpdateTaxPayload }
    >({
      query: ({ id, data }) => ({
        url: `/tax/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),
    updateTaxStatus: builder.mutation<
      ApiResponse<TaxRegion>,
      { id: string; data: UpdateTaxStatusPayload }
    >({
      query: ({ id, data }) => ({
        url: `/tax/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Tax"],
    }),
    deleteTax: builder.mutation<ApiResponse<TaxRegion>, string>({
      query: (id) => ({
        url: `/tax/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tax"],
    }),
  }),
});

export const {
  useGetTaxesQuery,
  useGetTaxByIdQuery,
  useCreateTaxMutation,
  useUpdateTaxMutation,
  useUpdateTaxStatusMutation,
  useDeleteTaxMutation,
} = taxApi;
