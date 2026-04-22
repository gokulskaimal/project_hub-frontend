import Link from "next/link";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 font-sans">
      <div className="relative group max-w-lg w-full">
        {/* Background Decorative Matrix Effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px] opacity-50 group-hover:bg-primary/30 transition-all duration-1000" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] opacity-50 group-hover:bg-secondary/20 transition-all duration-1000" />

        <div className="relative z-10 text-center bg-card/40 backdrop-blur-3xl p-8 md:p-14 rounded-[3.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Internal HUD Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />

          <div className="mx-auto w-28 h-28 bg-background/50 rounded-full flex items-center justify-center mb-10 border border-white/5 shadow-inner relative">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" />
            <AlertCircle className="w-12 h-12 text-primary" strokeWidth={1} />
          </div>

          <div className="space-y-4 mb-12">
            <h1 className="text-6xl md:text-8xl font-black text-foreground/10 absolute top-10 left-1/2 -translate-x-1/2 select-none tracking-tighter">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter uppercase relative z-10">
              Page Not Found
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-primary/30" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">
                The requested page does not exist.
              </p>
              <div className="h-px w-8 bg-primary/30" />
            </div>
          </div>

          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest leading-relaxed mb-12 max-w-xs mx-auto opacity-70"></p>

          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-3 w-full px-8 py-5 bg-foreground text-background font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-black/40 overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <Home className="w-5 h-5 relative z-10 group-hover:text-white transition-colors" />
            <span className="relative z-10 group-hover:text-white transition-colors text-xs">
              Home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
