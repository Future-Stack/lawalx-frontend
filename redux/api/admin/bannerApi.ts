import { baseApi } from "../baseApi";

export interface Banner {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  primaryButtonLabel: string;
  primaryButtonIcon: string;
  primaryButtonUrl: string;
  secondaryButtonEnabled: boolean;
  secondaryButtonLabel: string;
  secondaryButtonIcon: string;
  secondaryButtonUrl: string;
  startDate: string;
  endDate: string;
  targetUserType: string;
  backgroundStyle?: string;
  backgroundColor1?: string;
  backgroundColor2?: string;
  backgroundDirection?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  mediaPosition?: string;
  mediaShape?: string;
  uploadBanner?: string;
  bannerLinkRedirectURL?: string;
  placeholderMediaUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: {
    id: string;
    username: string;
    full_name: string;
  };
}

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBannersAdmin: builder.query({
      query: () => ({
        url: "/banners/admin/all",
        method: "GET",
      }),
      providesTags: ["Banner"],
      transformResponse: (response: any) => response.data,
    }),
    getActiveBanners: builder.query({
      query: () => ({
        url: "/banners/active",
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
    }),
    getBannerCount: builder.query({
      query: () => ({
        url: "/banners/count",
        method: "GET",
      }),
      providesTags: ["Banner"],
      transformResponse: (response: any) => response.data,
    }),
    getBannerById: builder.query({
      query: (id: string) => ({
        url: `/banners/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Banner", id }],
      transformResponse: (response: any) => response.data,
    }),
    createCustomBanner: builder.mutation({
      query: (data: FormData) => ({
        url: "/banners/custom",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
    createPrebuiltBanner: builder.mutation({
      query: (data: FormData) => ({
        url: "/banners/prebuilt",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
    updateCustomBanner: builder.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `/banners/${id}/custom`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Banner", { type: "Banner", id }],
    }),
    updatePrebuiltBanner: builder.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `/banners/${id}/prebuilt`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Banner", { type: "Banner", id }],
    }),
    deleteBanner: builder.mutation({
      query: (id: string) => ({
        url: `/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetAllBannersAdminQuery,
  useGetActiveBannersQuery,
  useGetBannerByIdQuery,
  useGetBannerCountQuery,
  useCreateCustomBannerMutation,
  useCreatePrebuiltBannerMutation,
  useUpdateCustomBannerMutation,
  useUpdatePrebuiltBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
