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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center space-y-10 rounded-[3rem] bg-card p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-[0_0_40px_rgba(var(--primary),0.3)]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_20px_rgba(var(--primary),1)]" />
          </div>
        </div>
        <div className="space-y-2 text-center relative z-10">
          <p className="text-[11px] font-black text-foreground uppercase tracking-[0.5em] animate-pulse">
            Loading...
          </p>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}
