"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CtaSection() {
  return (
    <section id="cta" className="py-32 bg-background relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container max-w-[1400px] mx-auto px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-card p-16 rounded-[4rem] border border-white/5 bg-card/20 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <div className="w-40 h-40 border border-primary rounded-full animate-ping" />
          </div>

          <h2 className="text-5xl lg:text-6xl font-black text-foreground uppercase tracking-tighter italic mb-8 max-w-4xl mx-auto leading-[0.9]">
            Ready to Synchronize Your <br />
            <span className="text-gradient">Organization?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-[11px] font-black uppercase tracking-[0.4em] leading-relaxed opacity-60">
            Deploy the project hub architecture in seconds. <br />
            Select your node path and begin operational scaling.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/signup"
              className="group relative px-12 py-6 bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Get Started Now</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <Link
              href="/login"
              className="px-12 py-6 bg-secondary text-foreground font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl border border-white/5 shadow-xl hover:bg-secondary/80 transition-all hover:scale-[1.05] active:scale-95"
            >
              Active Node Login
            </Link>
          </div>

          <div className="mt-16 pt-10 border-t border-white/5 opacity-40">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.5em]">
              Global Network Density: 4,208 Active Operatives
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
