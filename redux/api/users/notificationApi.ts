/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi } from "../baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyNotifications: builder.query<any, void>({
      query: () => ({
        url: "/notification/my-notification",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    readAllNotifications: builder.mutation<any, void>({
      query: () => ({
        url: "/notification/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    readNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/read/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),
    softDeleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/soft-delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    hardDeleteNotification: builder.mutation<any, string>({
      query: (id) => ({
        url: `/notification/hard-delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
    deleteNotificationBulkSystem: builder.mutation<any, { ids: string[] }>({
      query: (ids) => ({
        url: "/notification/bulk",
        method: "DELETE",
        body: ids
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useSoftDeleteNotificationMutation,
  useHardDeleteNotificationMutation,
  useDeleteNotificationBulkSystemMutation,
} = notificationApi;
