"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { userApiSlice } from "@/store/api/userApiSlice";
import { notifier } from "@/utils/notifier";
import { Notification } from "@/types/notification";

export default function SocketNotification() {
  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification: Notification) => {
      // Update RTK Query Cache for getNotifications
      dispatch(
        userApiSlice.util.updateQueryData(
          "getNotifications",
          undefined,
          (draft: Notification[]) => {
            const exists = draft.some(
              (n: Notification) => n.id === notification.id,
            );
            if (!exists) {
              draft.unshift(notification);
            }
          },
        ),
      );

      // Show Toast only if it's NOT a chat message (ChatNotificationListener handles that)
      if (notification.title !== "New Chat Message") {
        if (notification.type === "SUCCESS") {
          notifier.success(notification.message);
        } else {
          notifier.info(notification.message);
        }
      }
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, isConnected, dispatch]);

  return null;
}
