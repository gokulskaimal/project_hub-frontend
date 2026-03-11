"use client";
import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { useDispatch } from "react-redux";
import { addNotification } from "@/features/notification/notification";
import { toast } from "react-hot-toast";

export default function SocketNotification() {
  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification: {
      id: string;
      type: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
      title: string;
      message: string;
      isRead: boolean;
      createdAt: string;
      link?: string;
      [key: string]: unknown;
    }) => {
      // Add to Redux Store
      dispatch(addNotification(notification));

      // Show Toast only if it's NOT a chat message (ChatNotificationListener handles that)
      if (notification.title !== "New Chat Message") {
        toast(notification.message, {
          icon: notification.type === "SUCCESS" ? "✅" : "ℹ️",
          duration: 4000,
        });
      }
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [socket, isConnected, dispatch]);

  return null;
}
