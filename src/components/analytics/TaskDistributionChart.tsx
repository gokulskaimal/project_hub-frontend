"use client";

import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Task, Sprint } from "@/types/project";
import { Layers } from "lucide-react";

interface TaskDistributionChartProps {
  tasks: Task[];
  selectedSprintId?: string;
  sprints: Sprint[];
}

export default function TaskDistributionChart({
  tasks,
  selectedSprintId,
  sprints,
}: TaskDistributionChartProps) {
  const sprint = useMemo(() => {
    return (
      sprints.find((s) => s.id === selectedSprintId) ||
      sprints.find((s) => s.status === "ACTIVE")
    );
  }, [sprints, selectedSprintId]);

  const data = useMemo(() => {
    if (!sprint) return [];

    const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);

    const initialCounts = {
      STORY: 0,
      BUG: 0,
      TASK: 0,
      EPIC: 0,
    };

    const counts = sprintTasks.reduce(
      (acc, t) => {
        const type = t.type || "TASK";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      initialCounts as Record<string, number>,
    );

    return [
      { subject: "Stories", A: counts.STORY, fullMark: sprintTasks.length },
      { subject: "Bugs", A: counts.BUG, fullMark: sprintTasks.length },
      { subject: "Tasks", A: counts.TASK, fullMark: sprintTasks.length },
      { subject: "Strategic", A: counts.EPIC, fullMark: sprintTasks.length },
    ];
  }, [tasks, sprint]);

  if (!sprint || data.every((d) => d.A === 0)) {
    return (
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm h-full flex flex-col items-center justify-center text-center">
        <Layers className="w-8 h-8 text-muted-foreground/30 mb-3" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          Incomplete Typology Mapping
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
        <Layers size={100} className="text-primary -rotate-12" />
      </div>

      <div className="flex items-center gap-4 mb-8 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
          <Layers className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight">
            Work Typology
          </h3>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
            Sprint Balance signature
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[250px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 10,
                fontWeight: 900,
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, "auto"]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Volume"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-950 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                        {payload[0].payload.subject}
                      </p>
                      <p className="text-lg font-black text-white">
                        {payload[0].value}{" "}
                        <span className="text-[10px] text-primary">NODES</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center relative z-10">
        <div className="flex flex-col">
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
            Predominant Vector
          </span>
          <span className="text-[10px] font-black text-primary uppercase mt-0.5">
            {[...data].sort((a, b) => b.A - a.A)[0].subject}
          </span>
        </div>
        <div className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">
          Balance Analytics
        </div>
      </div>
    </div>
  );
}
