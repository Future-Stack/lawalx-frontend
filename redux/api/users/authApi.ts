import { setUser } from "../../features/auth/authSlice";
import { baseApi } from "../../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(
              setUser({
                token: data.data.accessToken,
                refreshToken: data.data.refreshToken,
              })
            );
          }
        } catch (error) {
          // console.error("Login failed:", error);
        }
      },
    }),
    forgotPassword: builder.mutation({
      query: (data: { email: string }) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: { password: string; token: string }) => ({
        url: `/auth/reset-password?token=${data.token}`,
        method: "POST",
        body: { newPassword: data.password },
      }),
    }),
    googleLogin: builder.query({
      query: () => ({
        url: "/otp/google",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGoogleLoginQuery
} = authApi;
