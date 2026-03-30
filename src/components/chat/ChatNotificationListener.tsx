"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { useRouter } from "next/navigation";

interface ChatNotification {
  projectId: string;
  projectName: string;
  senderName: string;
  content: string;
  messageId: string;
}

export default function ChatNotificationListener() {
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: ChatNotification) => {
      // Don't show toast if we are already on the chat page of that project
      const path = window.location.pathname;
      if (
        path.includes(`/projects/${data.projectId}/chat`) ||
        path.includes(`/member/projects/${data.projectId}`)
      ) {
        return;
      }

      notifier.info(
        MESSAGES.CHAT.NEW_MESSAGE(data.senderName, data.projectName),
      );
    };

    socket.on("chat:notification", handleNotification);

    return () => {
      socket.off("chat:notification", handleNotification);
    };
  }, [socket, router]);

  return null; // This component doesn't render anything visible
}
