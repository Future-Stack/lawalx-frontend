/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../baseApi";

export interface PreferencesData {
  theme?: "LIGHT" | "DARK";
  language?: string;
  dateFormat?: "DMY" | "MDY" | "YMD";
  timeFormat?: "H12" | "H24";
  emailNotification?: boolean;
  pushNotification?: boolean;
}

export const preferencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPreferences: builder.query<any, void>({
      query: () => ({
        url: "/settings/preferences",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    // updatePreferences: builder.mutation<any, PreferencesData>({
    //   query: (body) => ({
    //     url: "/settings/preferences",
    //     method: "PATCH",
    //     body,
    //   }),
    //   invalidatesTags: ["User"],
    // }),
  }),
});

export const { useGetPreferencesQuery } = preferencesApi;
