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
  customCss: string;
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
    createBanner: builder.mutation({
      query: (data: FormData) => ({
        url: "/banners",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Banner"],
    }),
    updateBanner: builder.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `/banners/${id}`,
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
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;
