"use client";
import React from "react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const featureItems = [
    {
      t: "Automated Efficiency",
      d: "Production-grade task automation and risk detection algorithms.",
      items: [
        "Automatic task creation",
        "Risk identification",
        "Smart suggestions",
      ],
    },
    {
      t: "Strategic Tracking",
      d: "Deconstruct complex milestones into actionable operation nodes.",
      items: ["Break down ideas", "Polish tasks", "Keep teams aligned"],
    },
    {
      t: "Real-time Synchrony",
      d: "Maintain total visibility across all organizational vectors.",
      items: ["Daily summaries", "Surface related work", "Align to goals"],
    },
    {
      t: "Adaptive Workflows",
      d: "Modular architecture for custom team-specific operational flows.",
      items: ["Team-specific flows", "Templates", "Approvals"],
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="container max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="text-[10px] font-black text-primary tracking-[0.4em] uppercase mb-4 opacity-70 italic">
            Operational Specs
          </div>
          <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">
            Engineered For Velocity
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
            Eliminate operational friction. Standardize mission-critical
            workflows with zero-latency synchronization.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureItems.map(({ t, d, items }, index) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg
                  className="h-20 w-20 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-8 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-black text-foreground mb-4 uppercase tracking-tighter italic">
                {t}
              </h3>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-8 leading-relaxed opacity-60">
                {d}
              </p>

              <ul className="space-y-3">
                {items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {i}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
