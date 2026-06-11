import { baseApi } from "../../baseApi";

export const signImageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthImage: builder.query({
      query: (type: string) => ({
        url: `/settings/auth-image/${type}`,
        method: "GET",
      }),
      providesTags: ["AuthImage"], // We will add AuthImage to baseApi tags if needed, or just let it use general cache
    }),
    uploadAuthImage: builder.mutation({
      query: ({ type, image }: { type: string; image: File }) => {
        const formData = new FormData();
        formData.append("image", image);
        return {
          url: `/settings/auth-image/${type}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["AuthImage"],
    }),
    deleteAuthImage: builder.mutation({
      query: (type: string) => ({
        url: `/settings/auth-image/${type}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AuthImage"],
    }),
  }),
});

export const {
  useGetAuthImageQuery,
  useUploadAuthImageMutation,
  useDeleteAuthImageMutation,
} = signImageApi;
