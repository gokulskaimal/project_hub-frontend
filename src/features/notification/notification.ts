import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async () => {
    const response = await axiosInstance.get("/notifications");
    return response.data;
  },
);

export const markRead = createAsyncThunk(
  "notifications/markAsRead",
  async (id: string) => {
    await axiosInstance.put(`/notifications/${id}/read`);
    return id;
  },
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async () => {
    await axiosInstance.put("/notifications/read-all");
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.items.unshift(action.payload);
      state.unreadCount++;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(
        (n: Notification) => !n.isRead,
      ).length;
    });
    builder.addCase(markRead.fulfilled, (state, action) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount--;
      }
    });
    builder.addCase(markAllRead.fulfilled, (state) => {
      state.items.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
