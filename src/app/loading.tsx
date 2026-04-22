export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-6">
      <div className="relative flex flex-col items-center">
        {/* Deep Field Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-[80px] animate-pulse" />

        <div className="relative group">
          {/* Main Tactical Spinner */}
          <div className="h-28 w-28 animate-[spin_3s_linear_infinite] rounded-full border-[10px] border-primary/5 border-t-primary shadow-[0_0_60px_rgba(var(--primary),0.2)]"></div>

          {/* Sub-Internal Counter-Rotation */}
          <div className="absolute inset-2 h-24 w-24 animate-[spin_2s_linear_infinite_reverse] rounded-full border-[6px] border-secondary/20 border-t-secondary/60 opacity-60"></div>

          {/* Central Data Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-primary rounded-sm rotate-45 animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
          </div>

          {/* Scanning Line HUD Effect */}
          <div className="absolute -inset-4 border border-primary/10 rounded-full animate-ping opacity-20" />
        </div>

        <div className="mt-12 space-y-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-[12px] font-black text-foreground uppercase tracking-[0.6em] animate-pulse">
              Loading...
            </h2>
            <div className="h-1 w-24 bg-secondary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-1/2 rounded-full" />
            </div>
          </div>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-50 tabular-nums">
            Please wait...
          </p>
        </div>
      </div>
    </div>
  );
}
