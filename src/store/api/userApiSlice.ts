import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "@/utils/api";
import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/types/auth";
import type { Notification } from "@/types/notification";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => ({
        url: API_ROUTES.USER.PROFILE,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      providesTags: ["UserProfile"],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfilePayload>({
      query: (data) => ({
        url: API_ROUTES.USER.PROFILE,
        method: "PUT",
        data,
      }),
      transformResponse: (response: { data: UserProfile }) => response.data,
      invalidatesTags: ["UserProfile"],
    }),
    changePassword: builder.mutation<void, ChangePasswordPayload>({
      query: (data) => ({
        url: API_ROUTES.USER.CHANGE_PASSWORD,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: void }) => response.data,
    }),
    uploadAvatar: builder.mutation<{ url: string }, FormData>({
      query: (formData) => ({
        url: API_ROUTES.UPLOAD.BASE,
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      }),
      transformResponse: (response: { data: { url: string } }) => response.data,
    }),
    getNotifications: builder.query<Notification[], void>({
      query: () => ({
        url: API_ROUTES.NOTIFICATIONS.GET_ALL,
        method: "GET",
      }),
      providesTags: ["Notifications"],
      transformResponse: (response: { data: Notification[] }) =>
        response.data || [],
    }),
    markNotificationAsRead: builder.mutation<void, string>({
      query: (id) => ({
        url: API_ROUTES.NOTIFICATIONS.READ_ONE(id),
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: API_ROUTES.NOTIFICATIONS.READ_ALL,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} = userApiSlice;
