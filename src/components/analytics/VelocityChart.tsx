"use client";

import React from "react";
import { Sprint, Task } from "@/types/project";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Activity, Zap } from "lucide-react";

interface VelocityChartProps {
  sprints: Sprint[];
  tasks: Task[];
}

export default function VelocityChart({ sprints, tasks }: VelocityChartProps) {
  const sortedSprints = [...sprints]
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
    .slice(-5);

  const data = sortedSprints.map((sprint) => {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
    const completedPoints = sprintTasks
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const totalPoints = sprintTasks.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0,
    );

    return {
      name: sprint.name,
      completed: completedPoints,
      total: totalPoints,
      status: sprint.status,
      percentage:
        totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
    };
  });

  const completedSprints = data.filter((d) => d.status === "COMPLETED");
  const avgVelocity =
    completedSprints.length > 0
      ? Math.round(
          completedSprints.reduce((sum, d) => sum + d.completed, 0) /
            completedSprints.length,
        )
      : 0;

  return (
    <div className="bg-card rounded-[2rem] border border-border p-6 flex flex-col h-full shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Activity size={120} className="text-primary rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              System Velocity Pulse
            </h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
              Linear Delivery performance
            </p>
          </div>
        </div>
        <div className="bg-slate-950 px-4 py-2 rounded-2xl shadow-xl flex flex-col items-end">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">
            Global AVG
          </span>
          <span className="text-xl font-black text-white leading-none">
            {avgVelocity}{" "}
            <span className="text-[10px] text-white/40 font-black">PTS</span>
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 900, fill: "#94a3b8" }}
            />
            <Tooltip
              cursor={{ fill: "var(--secondary)", opacity: 0.2, radius: 12 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-950 border border-white/10 p-4 rounded-[1.5rem] shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">
                        {label} Scorecard
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            <span className="text-[10px] font-black text-white/70 uppercase">
                              Delivered
                            </span>
                          </div>
                          <span className="text-xs font-black text-white">
                            {item.completed} PTS
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8 opacity-50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-700" />
                            <span className="text-[10px] font-black text-white/70 uppercase">
                              Committed
                            </span>
                          </div>
                          <span className="text-xs font-black text-white">
                            {item.total} PTS
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="completed" radius={[10, 10, 10, 10]} barSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.status === "ACTIVE" ? "#8b5cf6" : "#6366f1"}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Finalized
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Active Run
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border/50">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
            Efficiency Metrics Tracking
          </span>
        </div>
      </div>
    </div>
  );
}
