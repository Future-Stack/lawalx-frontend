/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../../baseApi";
import { NotificationPreferencesResponse, NotificationUpdateType, PasswordUpdate, Preferences, ProfileResponse, SessionsResponse } from "./settings.type";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettingsUserProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: "/settings/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    getSettingsSessions: builder.query<SessionsResponse, void>({
      query: () => ({
        url: "/settings/sessions",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
     getSettingsNotification: builder.query<NotificationPreferencesResponse, void>({
      query: () => ({
        url: "/settings/notifications",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateSittingsProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: "/settings/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateSettingsNotification: builder.mutation<any,NotificationUpdateType>({
      query: (body) => ({
        url: "/settings/notifications",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateSettingsProfilePreferences: builder.mutation<any, Preferences>({
      query: (body) => ({
        url: "/settings/preferences",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    changePassword: builder.mutation<any, PasswordUpdate>({
      query: (body) => ({
        url: "/settings/password",
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const { useGetSettingsUserProfileQuery, useGetSettingsSessionsQuery, useGetSettingsNotificationQuery, useUpdateSettingsProfilePreferencesMutation,useUpdateSettingsNotificationMutation, useUpdateSittingsProfileMutation, useChangePasswordMutation } = settingsApi;
