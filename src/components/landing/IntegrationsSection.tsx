import React from "react";

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 bg-background relative">
      <div className="container max-w-[1400px] mx-auto px-8 relative z-10">
        <div className="text-center mb-20 space-y-4">
          <div className="text-[10px] font-black text-primary tracking-[0.4em] uppercase mb-4 opacity-70 italic">
            Connect Your Tools
          </div>
          <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter italic">
            Everything in One Place
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed opacity-60">
            Connect all your tools. Bring designers, developers, and managers
            together in one hub.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="glass-card rounded-[2.5rem] border border-white/5 bg-card/40 p-10 shadow-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-8 opacity-50 italic">
                Available Apps
              </h4>
              <div className="flex flex-wrap gap-3 mb-10">
                {["Figma", "GitHub", "Slack", "Jira", "Notion"].map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center rounded-xl border border-white/5 bg-white/5 px-4 py-1.5 text-[10px] font-black text-foreground uppercase tracking-widest shadow-sm hover:border-primary/30 hover:bg-primary/5 transition-all cursor-crosshair"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] leading-relaxed opacity-60">
              Send and receive data between your apps. Keep designs, code, and
              messages synced.
            </p>
          </div>

          <div className="lg:col-span-2 glass-card rounded-[2.5rem] border border-white/5 bg-card/40 shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between border-b border-white/5 px-8 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
                  Figma Integration
                </span>
              </div>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
                Live Syncing
              </span>
            </div>

            <div className="p-10 flex flex-col sm:flex-row gap-10 h-full min-h-[300px]">
              <div className="flex-1 rounded-[2rem] border border-white/5 bg-gradient-to-br from-primary/10 to-purple-500/10 p-8 relative overflow-hidden group/vis">
                <div className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] mb-6 opacity-50 italic">
                  Design Preview
                </div>
                {/* Visualizer Skeleton */}
                <div className="h-40 rounded-2xl bg-background/50 border border-white/5 relative shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.1)_0%,transparent_70%)] animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-2 w-1/2 bg-white/5 rounded" />
                    <div className="h-2 w-1/3 bg-white/5 rounded" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-lg font-black text-foreground uppercase tracking-tighter italic mb-6">
                  How it works
                </h4>
                <div className="space-y-4">
                  {[
                    "Create tasks from designs",
                    "Connect code to tasks",
                    "Sync with GitHub",
                  ].map((spec) => (
                    <div key={spec} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-70">
                        {spec}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
