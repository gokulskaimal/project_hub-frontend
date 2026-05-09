"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Critical System Breach:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center max-w-lg bg-card p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)] border border-white/5 glass-card relative overflow-hidden">
        <div className="absolute inset-0 bg-destructive/5 animate-pulse" />
        <div className="relative z-10">
          <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(var(--destructive),0.2)] border border-destructive/20 text-destructive">
            <AlertTriangle className="w-12 h-12" />
          </div>

          <h2 className="text-4xl font-black text-destructive mb-4 uppercase tracking-tighter">
            System Overload
          </h2>
          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-12 opacity-60 leading-relaxed italic text-center">
            A critical logic corruption has been detected in the current data
            stream.
            <span className="block mt-2 text-destructive/60 not-italic font-mono">
              [ {error.message || "Unknown Logic Exception"} ]
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-secondary text-foreground font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl hover:bg-secondary/80 active:scale-95 border border-white/5"
            >
              <Home className="w-5 h-5" />
              <span>Neutralize</span>
            </Link>
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-5 bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Recursive Fix</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
