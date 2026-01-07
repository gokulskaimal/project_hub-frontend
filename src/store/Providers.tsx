'use client'
import React from "react"
import { Provider } from "react-redux"
import {store} from '@/store/store'
import { GoogleOAuthProvider } from "@react-oauth/google"
import { injectStore } from "@/utils/api"
import { fetchProfile } from "@/features/auth/authSlice";

// Inject store into api interceptors to avoid circular dependency
injectStore(store);

export default function Providers({children} : {children : React.ReactNode}){
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
    
    React.useEffect(() => {
        // [NEW] Restore User Profile on Refresh
        const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
        if (token) {
             // Dispatching directly to store since we are in the Provider wrapper
             store.dispatch(fetchProfile());
        }

        // Debugging: Log client ID and origin
        if (typeof window !== 'undefined') {
            console.log('[GoogleOAuth] Client ID:', clientId.substring(0, 20) + '...')
            console.log('[GoogleOAuth] Current Origin:', window.location.origin)
            console.log('[GoogleOAuth] Expected Origins: http://localhost:3000')
            
            // Disable FedCM if it's causing issues
            // This forces Google to use the traditional popup method
            const nav = window.navigator as Navigator & { federatedCredential?: unknown }
            console.log('[GoogleOAuth] FedCM Status:', nav.federatedCredential ? 'Available' : 'Disabled')
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
            <Provider store={store}> {children} </Provider>
        </GoogleOAuthProvider>
    )
}