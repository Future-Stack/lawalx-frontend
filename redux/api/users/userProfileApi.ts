import { baseApi } from "../baseApi";
import { User, UserResponse } from "./userProfile.type";

export const userProfileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<UserResponse, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    userDataUpdate: builder.mutation<UserResponse, Partial<User>>({
      query: (body) => ({
        url: "/users/update-first-time-login",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetUserProfileQuery, useUserDataUpdateMutation } = userProfileApi;
