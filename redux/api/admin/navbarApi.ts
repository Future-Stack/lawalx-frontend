import { baseApi } from "../baseApi";

export interface UserPreferences {
  id: string;
  userId: string;
  theme: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  emailNotification: boolean;
  pushNotification: boolean;
  currency: "USD" | "NGN";
}

export const navbarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPreferences: builder.query<{ data: UserPreferences }, void>({
      query: () => "/settings/preferences",
      providesTags: ["Preferences"],
    }),
    updatePreferences: builder.mutation<{ data: UserPreferences }, Partial<UserPreferences>>({
      query: (body) => ({
        url: "/settings/preferences",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Preferences", "FinancialData"],
    }),
  }),
});

export const { useGetPreferencesQuery, useUpdatePreferencesMutation } = navbarApi;
