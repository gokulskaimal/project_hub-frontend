"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Task, Sprint } from "@/types/project";
import { Users } from "lucide-react";

interface MemberContributionChartProps {
  tasks: Task[];
  sprints: Sprint[];
  selectedSprintId?: string;
}

const COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
];

export default function MemberContributionChart({
  tasks,
  sprints,
  selectedSprintId,
}: MemberContributionChartProps) {
  const sprint = useMemo(() => {
    return (
      sprints.find((s) => s.id === selectedSprintId) ||
      sprints.find((s) => s.status === "ACTIVE")
    );
  }, [sprints, selectedSprintId]);

  const data = useMemo(() => {
    if (!sprint) return [];

    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);

    // Group by assignee
    const grouped = sprintTasks.reduce(
      (acc, task) => {
        const assigneeName = task.assignedUser
          ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
          : "Unassigned";

        const points = task.storyPoints || 0;

        if (!acc[assigneeName]) {
          acc[assigneeName] = 0;
        }
        acc[assigneeName] += points;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [tasks, sprint]);

  if (!sprint || data.length === 0) {
    return (
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col items-center justify-center text-center transition-colors duration-500">
        <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-gray-200" />
        </div>
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">
          No Contribution Data
        </h4>
        <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase tracking-widest leading-relaxed">
          Add story points to tasks in{" "}
          {selectedSprintId === "ACTIVE" ? "the active" : "this"} sprint to see
          individual delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col overflow-hidden relative transition-colors duration-500">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight">
              Node Operations
            </h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
              {sprint.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={8}
              stroke="none"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer shadow-xl"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950/90 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">
                        {payload[0].name}
                      </p>
                      <p className="text-xl font-black text-white">
                        {payload[0].value}{" "}
                        <span className="text-[10px] text-primary">PTS</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: "900",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                paddingTop: "24px",
              }}
              formatter={(value) => (
                <span className="text-muted-foreground font-black">
                  {value}
                </span>
              )}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            Top Contributor
          </span>
          <span className="text-[11px] font-black text-primary uppercase mt-0.5">
            {data[0]?.name || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            Live Node Sync
          </span>
        </div>
      </div>
    </div>
  );
}
