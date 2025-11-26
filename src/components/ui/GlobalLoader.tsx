"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function GlobalLoader() {
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  // We'll need to update RootState definition after adding uiSlice, 
  // but for now we can safely assume it will be there or default to false if not yet typed
  const uiLoading = useSelector((state: any) => state.ui?.isLoading);

  const isLoading = authLoading || uiLoading;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-8 shadow-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
