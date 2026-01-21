'use client'
import React from "react"
import { Provider } from "react-redux"
import { store } from '@/store/store'
import { GoogleOAuthProvider } from "@react-oauth/google"
import { injectStore } from "@/utils/api"
import { fetchProfile, hydrateFromStorage } from "@/features/auth/authSlice";
import { SocketProvider } from "@/context/SocketContext"

// Inject store into api interceptors to avoid circular dependency
injectStore(store);

export default function Providers({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

    React.useEffect(() => {
        // [NEW] Restore User Profile on Refresh
        // 1. Hydrate basic auth state (token, role)
        store.dispatch(hydrateFromStorage());

        // 2. Fetch full profile if token exists
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
        if (token) {
            store.dispatch(fetchProfile());
        }


    }, [clientId])

    if (!clientId) {
        console.error('[GoogleOAuth] ERROR: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!')
        return <Provider store={store}>{children}</Provider>
    }

    return (
        <GoogleOAuthProvider
            clientId={clientId}
            nonce="project-hub-nonce"
        >
            <Provider store={store}>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </Provider>
        </GoogleOAuthProvider>
    )
}