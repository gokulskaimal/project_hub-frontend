"use client"
import { useEffect } from "react"
import { useSocket } from "@/context/SocketContext"
import { useDispatch } from "react-redux"
import { addNotification } from "@/features/notification/notification"
import { toast } from "react-hot-toast"

export default function SocketNotification() {
    const { socket, isConnected } = useSocket();
    const dispatch = useDispatch();

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNotification = (notification: any) => {
            // Add to Redux Store
            dispatch(addNotification(notification));
            
            // Show Toast
            toast(notification.message, {
                icon: notification.type === 'SUCCESS' ? '✅' : 'ℹ️',
                duration: 4000
            });
        };

        socket.on("notification:new", handleNotification);

        return () => {
            socket.off("notification:new", handleNotification);
        }

    }, [socket, isConnected, dispatch]);

    return null;
}