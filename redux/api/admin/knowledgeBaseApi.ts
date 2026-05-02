import { baseApi } from "../baseApi";

export const knowledgeBaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // FAQ Endpoints
    getAllFaqsAdmin: builder.query({
      query: (params) => ({
        url: "/faq/admin/all",
        method: "GET",
        params,
      }),
      providesTags: ["FAQ"],
      transformResponse: (response: any) => response.data,
    }),
    getFaqById: builder.query({
      query: (id: string) => ({
        url: `/faq/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "FAQ", id }],
      transformResponse: (response: any) => response.data,
    }),
    getFaqStats: builder.query({
      query: () => ({
        url: "/faq/admin/stats",
        method: "GET",
      }),
      providesTags: ["FAQ"],
      transformResponse: (response: any) => response.data,
    }),
    createFaq: builder.mutation({
      query: (data) => ({
        url: "/faq/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FAQ"],
    }),
    updateFaq: builder.mutation({
      query: ({ id, data }) => ({
        url: `/faq/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["FAQ", { type: "FAQ", id }],
    }),
    deleteFaq: builder.mutation({
      query: (id: string) => ({
        url: `/faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FAQ"],
    }),

    // Video FAQ Endpoints
    getAllVideoFaqsAdmin: builder.query({
      query: (params) => ({
        url: "/video-faq/admin/all",
        method: "GET",
        params,
      }),
      providesTags: ["VideoFAQ"],
      transformResponse: (response: any) => response.data,
    }),
    getVideoFaqById: builder.query({
      query: (id: string) => ({
        url: `/video-faq/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "VideoFAQ", id }],
      transformResponse: (response: any) => response.data,
    }),
    createVideoFaq: builder.mutation({
      query: (data: FormData) => ({
        url: "/video-faq/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["VideoFAQ"],
    }),
    updateVideoFaq: builder.mutation({
      query: ({ id, data }: { id: string; data: FormData }) => ({
        url: `/video-faq/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["VideoFAQ", { type: "VideoFAQ", id }],
    }),
    deleteVideoFaq: builder.mutation({
      query: (id: string) => ({
        url: `/video-faq/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["VideoFAQ"],
    }),
  }),
});

export const {
  useGetAllFaqsAdminQuery,
  useGetFaqByIdQuery,
  useGetFaqStatsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useGetAllVideoFaqsAdminQuery,
  useGetVideoFaqByIdQuery,
  useCreateVideoFaqMutation,
  useUpdateVideoFaqMutation,
  useDeleteVideoFaqMutation,
} = knowledgeBaseApi;
