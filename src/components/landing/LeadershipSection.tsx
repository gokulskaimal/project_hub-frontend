"use client";
import React from "react";
import { motion } from "framer-motion";

export default function LeadershipSection() {
  const roadmapItems = [
    {
      name: "User Authentication",
      status: "COMPLETED",
      progress: 100,
      metric: "99.9% Security Audit",
      color: "bg-emerald-500",
    },
    {
      name: "Data Hub",
      status: "IN_PROGRESS",
      progress: 65,
      metric: "Accuracy: 99.9%",
      color: "bg-primary",
    },
    {
      name: "App Connections",
      status: "STABILIZING",
      progress: 40,
      metric: "Latency: 12ms",
      color: "bg-purple-500",
    },
    {
      name: "Project Lifecycle",
      status: "PLANNING",
      progress: 15,
      metric: "v4.5.0 Deployment",
      color: "bg-blue-500",
    },
  ];

  return (
    <section
      id="leadership"
      className="py-24 bg-background relative selection:bg-primary/30"
    >
      <div className="container max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="text-[10px] font-black text-primary tracking-[0.4em] uppercase mb-4 opacity-70 italic">
            For Managers
          </div>
          <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">
            Clear Reporting
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
            Real-time updates for modern managers. Understand your project
            progress with simple charts.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card rounded-[2.5rem] border border-white/5 bg-card/40 p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">
                Active Roadmap
              </span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                  Real-time Updates
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {roadmapItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-foreground uppercase tracking-tighter italic">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      {item.metric}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={`h-full rounded-full ${item.color} shadow-[0_0_15px_rgba(var(--primary),0.3)]`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] border border-white/5 bg-card/40 p-10 shadow-2xl flex flex-col">
            <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-10 opacity-50 italic">
              Project Health
            </h4>
            <div className="space-y-6 flex-1">
              {[
                { metric: "Work Speed", value: "+42%", trend: "UP" },
                { metric: "Errors Found", value: "-12%", trend: "DOWN" },
                {
                  metric: "Success Rate",
                  value: "98.4%",
                  trend: "STABLE",
                },
                { metric: "Teamwork", value: "HIGH", trend: "OPTIMAL" },
              ].map((m) => (
                <div
                  key={m.metric}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group"
                >
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] group-hover:text-foreground transition-colors">
                    {m.metric}
                  </span>
                  <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40 italic">
                All Working • 12 Active Projects
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
