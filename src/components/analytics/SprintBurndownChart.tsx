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
  Legend,
} from "recharts";
import { Task, Sprint } from "@/types/project";
import { TrendingDown, Info } from "lucide-react";

interface SprintBurndownChartProps {
  sprint: Sprint;
  tasks: Task[];
}

export default function SprintBurndownChart({
  sprint,
  tasks,
}: SprintBurndownChartProps) {
  const data = useMemo(() => {
    if (!sprint || !sprint.startDate || !sprint.endDate) {
      return [];
    }

    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
    const totalPoints = sprintTasks.reduce(
      (acc, t) => acc + (t.storyPoints || 0),
      0,
    );

    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const startOfSprint = new Date(start);
    startOfSprint.setHours(0, 0, 0, 0);

    const pointsDoneBeforeStart = sprintTasks
      .filter(
        (t) =>
          t.status === "DONE" &&
          t.completedAt &&
          new Date(t.completedAt) < startOfSprint,
      )
      .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

    let remainingActual = totalPoints - pointsDoneBeforeStart;
    const chartData = [];

    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)),
    );

    for (let i = 0; i <= days; i++) {
      const currentDay = new Date(startOfSprint);
      currentDay.setDate(currentDay.getDate() + i);

      const idealRemaining = Math.max(
        0,
        totalPoints - (totalPoints / days) * i,
      );

      const completedToday = sprintTasks
        .filter(
          (t) =>
            t.status === "DONE" &&
            t.completedAt &&
            new Date(t.completedAt).toDateString() ===
              currentDay.toDateString(),
        )
        .reduce((acc, t) => acc + (t.storyPoints || 0), 0);

      remainingActual -= completedToday;

      chartData.push({
        day:
          days <= 7
            ? currentDay.toLocaleDateString([], { weekday: "short" })
            : `Day ${i}`,
        Ideal: Number(idealRemaining.toFixed(1)),
        Actual: currentDay <= new Date() ? Math.max(0, remainingActual) : null,
      });
    }
    return chartData;
  }, [sprint, tasks]);

  if (!sprint) return null;

  if (tasks.filter((t) => t.sprintId === sprint.id).length === 0) {
    return (
      <div className="h-[350px] w-full flex flex-col items-center justify-center text-center p-8 bg-secondary/10 rounded-[2rem] border border-dashed border-border transition-colors duration-500">
        <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm border border-border/50">
          <TrendingDown className="w-8 h-8 text-slate-200" />
        </div>
        <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-widest">
          No data available
        </h4>
        <p className="text-[10px] text-slate-300 font-bold mt-2 uppercase tracking-widest max-w-[220px]">
          No story points allocated to this sprint for velocity tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm transition-all duration-500 hover:shadow-xl group flex flex-col h-full overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <TrendingDown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              Sprint Burndown Chart
            </h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
              Ideal vs Actual Progress
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="day"
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
                        Day: {label}
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-500" />
                            <span className="text-[10px] font-black text-white/70 uppercase">
                              Ideal Path
                            </span>
                          </div>
                          <span className="text-xs font-black text-white tabular-nums">
                            {payload[0]?.value ?? 0}{" "}
                            <span className="text-[10px] opacity-40">PTS</span>
                          </span>
                        </div>
                        {payload[1]?.value !== null && (
                          <div className="flex items-center justify-between gap-8 text-primary">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                              <span className="text-[10px] font-black uppercase">
                                Actual Rem.
                              </span>
                            </div>
                            <span className="text-xs font-black tabular-nums">
                              {payload[1]?.value ?? 0}{" "}
                              <span className="text-[10px] opacity-40">
                                PTS
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: "20px" }}
              formatter={(value) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mr-4">
                  {value}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="Ideal"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="Actual"
              stroke="#6366f1"
              strokeWidth={4}
              dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 opacity-40" />
          <span>Real-time updates enabled</span>
        </div>
        <span className="opacity-40">Synced</span>
      </div>
    </div>
  );
}
