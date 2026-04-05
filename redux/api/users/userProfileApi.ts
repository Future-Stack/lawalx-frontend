import { baseApi } from "../baseApi";

export const userProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<any, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    userDataUpdate: builder.mutation<any, any>({
      query: () => ({
        url: "/users/update-first-time-login",
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetUserProfileQuery, useUserDataUpdateMutation } = userProfileApi;
