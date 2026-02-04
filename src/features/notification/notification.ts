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
  async (id: string, { dispatch }) => {
    await axiosInstance.put(`/notifications/${id}/read`);
    dispatch(fetchNotifications());
    return id;
  },
);

export const markAllRead = createAsyncThunk(
  "notifications/markAllAsRead",
  async (_, { dispatch }) => {
    await axiosInstance.put("/notifications/read-all");
    dispatch(fetchNotifications());
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      // Prevent duplicates
      const exists = state.items.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        state.unreadCount++;
      }
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
      // Return new state to guarantee re-render
      const newItems = state.items.map((n) =>
        n.id === action.payload ? { ...n, isRead: true } : n,
      );
      return {
        ...state,
        items: newItems,
        unreadCount: newItems.filter((n) => !n.isRead).length,
      };
    });
    builder.addCase(markAllRead.fulfilled, (state) => {
      // Return new state to guarantee re-render
      const newItems = state.items.map((n) => ({ ...n, isRead: true }));
      return {
        ...state,
        items: newItems,
        unreadCount: 0,
      };
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
