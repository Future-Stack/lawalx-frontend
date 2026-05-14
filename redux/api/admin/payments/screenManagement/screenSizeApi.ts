import { baseApi } from "../../../baseApi";

// Types
export interface ScreenSize {
  id: string;
  size: number;
  price: number;
  currency: string;
  originalPrice: number;
  originalCurrency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenSizeMeta {
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
  meta?: ScreenSizeMeta;
}

export interface ScreenSizeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: boolean;
}

export interface CreateScreenSizePayload {
  size: number;
  price: number;
}

export interface UpdateScreenSizePayload {
  size?: number;
  price?: number;
}

export interface UpdateScreenSizeStatusPayload {
  isActive: boolean;
}

// API
export const screenSizeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllScreenSizes: builder.query<ApiResponse<ScreenSize[]>, ScreenSizeQueryParams | void>({
      query: (params) => ({
        url: `/subscription-management/screen-size`,
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Subscription"],
    }),
    getScreenSizeById: builder.query<ApiResponse<ScreenSize>, string>({
      query: (id) => ({
        url: `/subscription-management/screen-size/${id}`,
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),
    createScreenSize: builder.mutation<ApiResponse<ScreenSize>, CreateScreenSizePayload>({
      query: (data) => ({
        url: `/subscription-management/screen-size`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    updateScreenSize: builder.mutation<ApiResponse<ScreenSize>, { id: string; data: UpdateScreenSizePayload }>({
      query: ({ id, data }) => ({
        url: `/subscription-management/screen-size/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    updateScreenSizeStatus: builder.mutation<ApiResponse<ScreenSize>, { id: string; data: UpdateScreenSizeStatusPayload }>({
      query: ({ id, data }) => ({
        url: `/subscription-management/screen-size/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Subscription"],
    }),
    deleteScreenSize: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/subscription-management/screen-size/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetAllScreenSizesQuery,
  useGetScreenSizeByIdQuery,
  useCreateScreenSizeMutation,
  useUpdateScreenSizeMutation,
  useUpdateScreenSizeStatusMutation,
  useDeleteScreenSizeMutation,
} = screenSizeApi;
