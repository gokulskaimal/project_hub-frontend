"use client";
import React from "react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background selection:bg-primary/30 py-20 lg:py-32">
      {/* Cinematic Background System */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.1)_0%,transparent_50%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container max-w-[1400px] mx-auto px-6 relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.2em] mb-12">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Production Core Active • v4.2.0
        </div>

        <h1 className="text-6xl lg:text-8xl font-black text-foreground mb-8 uppercase tracking-tighter leading-[0.9] italic">
          Forge The <br />
          <span className="text-gradient">Future Nexus</span>
        </h1>

        <p className="text-muted-foreground text-sm lg:text-lg mb-12 max-w-2xl font-bold leading-relaxed opacity-70 uppercase tracking-widest italic">
          Professional-grade project management suite for high-performance
          teams. Synchronize your organization, track every milestone, and
          accelerate project velocity.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
          <a
            href="#pricing"
            className="group relative px-10 py-5 bg-primary text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.03] active:scale-95 overflow-hidden"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
          <a
            href="#features"
            className="px-10 py-5 bg-secondary text-foreground font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl border border-white/5 shadow-xl hover:bg-secondary/80 transition-all active:scale-95"
          >
            Decipher Specs
          </a>
        </div>

        {/* Dashboard Preview Mockup - Glass Morphism */}
        <div className="w-full max-w-5xl rounded-[3rem] border border-white/5 glass-card p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-[3rem] animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-background/50 h-[400px] lg:h-[600px] p-8">
            {/* Realistic CSS Dashboard Preview */}
            <div className="w-full h-full flex gap-6 opacity-40">
              <div className="w-20 shrink-0 flex flex-col gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/5"
                  />
                ))}
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <div className="h-40 w-full rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-white/5" />
                <div className="grid grid-cols-2 gap-6 flex-1">
                  <div className="rounded-2xl bg-white/5 border border-white/5" />
                  <div className="rounded-2xl bg-white/5 border border-white/5" />
                </div>
              </div>
            </div>
            {/* Overlay Gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />

            {/* Floating Premium Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-10 rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(var(--primary),0.3)] min-w-[320px] text-center z-20">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 border border-primary/30">
                <div className="w-8 h-8 rounded-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.8)]" />
              </div>
              <h4 className="text-lg font-black text-foreground uppercase tracking-tighter italic mb-2">
                Live Status Aggregate
              </h4>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                98.4% Efficiency
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
