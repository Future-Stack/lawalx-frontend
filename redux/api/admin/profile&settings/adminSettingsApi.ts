import { baseApi } from "../../baseApi";

export const adminSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Profile
    getAdminProfile: builder.query({
      query: () => ({
        url: "/adminprofiles/profile",
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    updateAdminProfile: builder.mutation({
      query: (data) => ({
        url: "/adminprofiles/update",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
    uploadProfilePhoto: builder.mutation({
      query: (formData) => ({
        url: "/adminprofiles/upload-photo",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    // Preferences
    getAdminPreferences: builder.query({
      query: () => ({
        url: "/adminprofiles/preferences",
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    updateAdminPreferences: builder.mutation({
      query: (data) => ({
        url: "/adminprofiles/preferences",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    // Security
    getAdminSecurity: builder.query({
      query: () => ({
        url: "/adminprofiles/security",
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    updateAdminSecurity: builder.mutation({
      query: (data) => ({
        url: "/adminprofiles/security",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
    changeAdminPassword: builder.mutation({
      query: (data) => ({
        url: "/adminprofiles/change-password",
        method: "PATCH",
        body: data,
      }),
    }),

    // Sessions
    getAdminSessions: builder.query({
      query: () => ({
        url: "/adminprofiles/sessions",
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    endAdminSession: builder.mutation({
      query: (id: string) => ({
        url: `/adminprofiles/sessions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminSettings"],
    }),
    endAllOtherAdminSessions: builder.mutation({
      query: () => ({
        url: "/adminprofiles/sessions/other",
        method: "DELETE",
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    // Team Management
    getTeamEmployees: builder.query({
      query: () => ({
        url: "/adminprofiles/employees",
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    addTeamEmployee: builder.mutation({
      query: (data) => ({
        url: "/adminprofiles/employees",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    // Activity Logs
    getAdminActivityLogs: builder.query({
      query: (params?: { search?: string; date?: string; role?: string }) => ({
        url: "/adminprofiles/activity-logs",
        method: "GET",
        params,
      }),
    }),

    // Role Templates
    getRoleTemplates: builder.query({
      query: () => ({
        url: "/adminprofiles/roles",
        method: "GET",
      }),
      providesTags: ["AdminSettings"],
    }),
    createRoleTemplate: builder.mutation({
      query: (data) => ({
        url: "/adminprofiles/roles",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),
    updateRoleTemplate: builder.mutation({
      query: ({ id, ...data }: { id: string; [key: string]: any }) => ({
        url: `/adminprofiles/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["AdminSettings"],
    }),

    // System Info
    getSystemInfo: builder.query({
      query: () => ({
        url: "/adminprofiles/system-info",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUploadProfilePhotoMutation,
  useGetAdminPreferencesQuery,
  useUpdateAdminPreferencesMutation,
  useGetAdminSecurityQuery,
  useUpdateAdminSecurityMutation,
  useChangeAdminPasswordMutation,
  useGetAdminSessionsQuery,
  useEndAdminSessionMutation,
  useEndAllOtherAdminSessionsMutation,
  useGetTeamEmployeesQuery,
  useAddTeamEmployeeMutation,
  useGetAdminActivityLogsQuery,
  useGetRoleTemplatesQuery,
  useCreateRoleTemplateMutation,
  useUpdateRoleTemplateMutation,
  useGetSystemInfoQuery,
} = adminSettingsApi;
