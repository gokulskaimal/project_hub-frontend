"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
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
            if (window.location.pathname.includes(`/projects/${data.projectId}`)) {
                return;
            }

            toast((t) => (
                <div 
                    onClick={() => {
                        toast.dismiss(t.id);
                        router.push(`/member/projects/${data.projectId}`);
                    }}
                    className="cursor-pointer flex flex-col gap-1"
                >
                    <p className="font-bold text-sm">New message in {data.projectName}</p>
                    <p className="text-xs text-gray-600">
                        <span className="font-semibold">{data.senderName}:</span> {data.content.substring(0, 30)}{data.content.length > 30 ? "..." : ""}
                    </p>
                </div>
            ), {
                position: "top-right",
                duration: 4000,
            });
        };

        socket.on("chat:notification", handleNotification);

        return () => {
            socket.off("chat:notification", handleNotification);
        };
    }, [socket, router]);

    return null; // This component doesn't render anything visible
}