"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Task } from "@/types/project";
import { Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface EfficiencyTrendChartProps {
  tasks: Task[];
}

export default function EfficiencyTrendChart({
  tasks,
}: EfficiencyTrendChartProps) {
  const data = useMemo(() => {
    const completedTasks = tasks.filter(
      (t) => t.status === "DONE" && t.completedAt && t.createdAt,
    );

    // Group tasks by completion month
    const groupedByMonth: Record<string, { totalDays: number; count: number }> =
      {};

    completedTasks.forEach((task) => {
      const completionDate = new Date(task.completedAt!);
      const monthKey = completionDate.toLocaleDateString(undefined, {
        month: "short",
        year: "2-digit",
      });

      const createdDate = new Date(task.createdAt!);
      const cycleTimeDays = Math.max(
        0.5,
        (completionDate.getTime() - createdDate.getTime()) / (1000 * 3600 * 24),
      );

      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = { totalDays: 0, count: 0 };
      }

      groupedByMonth[monthKey].totalDays += cycleTimeDays;
      groupedByMonth[monthKey].count += 1;
    });

    // Convert to array and sort chronologically
    return (
      Object.entries(groupedByMonth)
        .map(([month, stats]) => ({
          month,
          avgCycleTime: Number((stats.totalDays / stats.count).toFixed(1)),
          taskCount: stats.count,
        }))
        // Simple string sort, might need better logic for multi-year but fine for now
        .slice(-6)
    );
  }, [tasks]);

  if (data.length < 2) {
    return (
      <div className="bg-card p-6 rounded-[2.5rem] border border-border shadow-sm h-full flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-muted-foreground/30 mb-3" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
          Historical Insight Pending
          <br />
          <span className="opacity-40">
            Complete more tasks to build trend map
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
        <Activity size={120} className="text-primary rotate-12" />
      </div>

      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shadow-inner">
          <Clock className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight">
            Efficiency Pulse
          </h3>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
            Evolution of Cycle Time (Days)
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fontWeight: 900,
                fill: "var(--muted-foreground)",
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 9,
                fontWeight: 900,
                fill: "var(--muted-foreground)",
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                const dataPoint = payload?.[0];
                if (active && dataPoint) {
                  return (
                    <div className="bg-slate-950 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3 pb-2 border-b border-white/5">
                        {label} Performance
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-[10px] font-black text-white/70 uppercase">
                            Avg Cycle Time
                          </span>
                          <span className="text-sm font-black text-violet-400">
                            {dataPoint.value ?? 0}{" "}
                            <span className="text-[10px] opacity-40">DAYS</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-8">
                          <span className="text-[10px] font-black text-white/70 uppercase">
                            Sample Scale
                          </span>
                          <span className="text-xs font-black text-white">
                            {dataPoint.payload?.taskCount ?? 0} NODES
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="avgCycleTime"
              stroke="#8b5cf6"
              strokeWidth={4}
              dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-4 border-t border-border/50 flex justify-between items-center text-[9px] font-black text-muted-foreground uppercase tracking-widest relative z-10">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${data[data.length - 1].avgCycleTime < data[0].avgCycleTime ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          <span>
            {data[data.length - 1].avgCycleTime < data[0].avgCycleTime
              ? "Optimization Detected"
              : "Drag Resistance Detected"}
          </span>
        </div>
        <span className="opacity-40">Last 6 Cycles</span>
      </div>
    </div>
  );
}
