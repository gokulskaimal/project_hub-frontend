'use client'
import React from "react"
import { Provider } from "react-redux"
import {store} from '@/store/store'
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function Providers({children} : {children : React.ReactNode}){
    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
            <Provider store={store}> {children} </Provider>
        </GoogleOAuthProvider>
    )
}