"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { useSelector, UseSelector } from "react-redux"
import { RootState } from "@/store/store"

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false
})

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { accessToken, user , loading} = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        if (accessToken && user && !loading) {
            if(socket?.connected) return;

            const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
                auth: {
                    token: accessToken
                },
                withCredentials: true,
                reconnection : true,
                reconnectionAttempts : 5,
                reconnectionDelay : 1000,
            })

            socketInstance.on("connect", () =>{
                setIsConnected(true)
            })



            socketInstance.on("disconnect" , () =>{
                setIsConnected(false)
            })

            socketInstance.on("connect_error" , (err) =>{
                // Do not nullify socket here immediately to allow reconnection attempts
                setIsConnected(false)
            })

            setSocket(socketInstance); // <--- CRITICAL FIX: Save socket to state

            return () => {
                socketInstance.disconnect();
            }
        } else {
             if(socket){
                 socket.disconnect();
                 setSocket(null);
                 setIsConnected(false);
             }
        }
    },[accessToken , user?.id , loading])

    return(
        <SocketContext.Provider value={{socket , isConnected}}>
            {children}
        </SocketContext.Provider>
    )
}
