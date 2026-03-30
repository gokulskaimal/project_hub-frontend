"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function GlobalLoader() {
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  // Read ui loading flag from typed RootState; default to false when missing
  const uiLoading = useSelector(
    (state: RootState) => state.ui?.isLoading ?? false,
  );

  const isLoading = authLoading || uiLoading;

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4 rounded-xl bg-white p-8 shadow-xl">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
