"use client";

import React, { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Task, Project } from "@/types/project";
import { TrendingUp, Target, Rocket } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectBurnUpChartProps {
  project: Project;
  tasks: Task[];
}

export default function ProjectBurnUpChart({
  project,
  tasks,
}: ProjectBurnUpChartProps) {
  const data = useMemo(() => {
    if (!project || (!project.createdAt && !project.startDate)) {
      return [];
    }
    const startDate = new Date(project.createdAt || project.startDate || "");
    const endDate = new Date();

    // Create 12 data points between start and now
    const chartData = [];
    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)),
    );
    const step = Math.max(1, Math.floor(totalDays / 11));

    for (let i = 0; i <= totalDays; i += step) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const scopeAtPoint = tasks
        .filter(
          (t) =>
            new Date(t.createdAt || project.createdAt).getTime() <=
            currentDate.getTime(),
        )
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      const completedAtPoint = tasks
        .filter(
          (t) =>
            t.status === "DONE" &&
            t.completedAt &&
            new Date(t.completedAt).getTime() <= currentDate.getTime(),
        )
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      chartData.push({
        date: currentDate.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
        timestamp: currentDate.getTime(),
        Scope: scopeAtPoint,
        Completed: completedAtPoint,
      });

      if (i + step > totalDays && i < totalDays) {
        i = totalDays - step;
      }
    }

    return chartData;
  }, [project, tasks]);

  if (tasks.length === 0) {
    return (
      <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm h-full flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-slate-200" />
        </div>
        <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-widest">
          Node History Uninitialized
        </h4>
        <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-widest max-w-[200px]">
          Add and complete tasks to track project growth and scope creep.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm h-full flex flex-col group overflow-hidden relative transition-colors duration-500">
      <div className="absolute -top-10 -right-10 p-12 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity rotate-12">
        <Rocket size={140} className="text-primary" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              System Burn-Up Vector
            </h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
              Strategic Scope vs Completion Growth
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] relative z-10 w-full overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorScope" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
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
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-white/10 p-4 rounded-[1.5rem] shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">
                        Pulse Vector: {label}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-black text-white/70 uppercase">
                              Total Scope
                            </span>
                          </div>
                          <span className="text-xs font-black text-white">
                            {payload[0].value}{" "}
                            <span className="text-[10px] opacity-40">PTS</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-white/70 uppercase">
                              Completed
                            </span>
                          </div>
                          <span className="text-xs font-black text-white">
                            {payload[1].value}{" "}
                            <span className="text-[10px] opacity-40">PTS</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="Scope"
              stroke="#6366f1"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorScope)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="Completed"
              stroke="#10b981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorCompleted)"
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">
              Target Vector Sync
            </span>
          </div>
        </div>
        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
          Updated Realtime
        </span>
      </div>
    </div>
  );
}
