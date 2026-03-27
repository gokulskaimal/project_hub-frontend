"use client";
import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { injectStore } from "@/utils/api";
import { userApiSlice } from "@/store/api/userApiSlice";
import { hydrateFromStorage } from "@/features/auth/authSlice";
import { SocketProvider } from "@/context/SocketContext";

injectStore(store);

export default function Providers({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  React.useEffect(() => {
    store.dispatch(hydrateFromStorage());

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      store.dispatch(userApiSlice.endpoints.getProfile.initiate());
    }
  }, [clientId]);

  if (!clientId) {
    console.error(
      "[GoogleOAuth] ERROR: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!",
    );
    return <Provider store={store}>{children}</Provider>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId} nonce="project-hub-nonce">
      <Provider store={store}>
        <SocketProvider>{children}</SocketProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
}
