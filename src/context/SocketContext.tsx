"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  syncTimestamp: number;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  syncTimestamp: 0,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [syncTimestamp, setSyncTimestamp] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, user, loading } = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    if (accessToken && user && !loading) {
      if (socket?.connected) return;

      const socketInstance = io(
        process.env.NEXT_PUBLIC_SOCKET_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:5000",
        {
          auth: {
            token: accessToken,
          },
          withCredentials: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        },
      );

      socketInstance.on("connect", () => {
        setIsConnected(true);
        setSyncTimestamp(Date.now());
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
      });

      socketInstance.on("reconnect", () => {
        setSyncTimestamp(Date.now());
      });

      socketInstance.on("connect_error", (_err) => {
        // Do not nullify socket here immediately to allow reconnection attempts
        setIsConnected(false);
      });

      setSocket(socketInstance); // <--- CRITICAL FIX: Save socket to state

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user?.id, loading]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, syncTimestamp }}>
      {children}
    </SocketContext.Provider>
  );
};
