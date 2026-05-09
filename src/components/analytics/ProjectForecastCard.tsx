"use client";

import React, { useMemo } from "react";
import { Project, Task, Sprint } from "@/types/project";
import {
  Rocket,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Clock,
} from "lucide-react";

interface ProjectForecastCardProps {
  project: Project;
  tasks: Task[];
  sprints: Sprint[];
}

export default function ProjectForecastCard({
  project,
  tasks,
  sprints,
}: ProjectForecastCardProps) {
  const analytics = useMemo(() => {
    // 1. Calculate Average Velocity (Points/Week) from COMPLETED sprints
    const completedSprints = sprints.filter((s) => s.status === "COMPLETED");
    const totalPointsDelivered = tasks
      .filter(
        (t) =>
          t.status === "DONE" &&
          t.sprintId &&
          completedSprints.some((s) => s.id === t.sprintId),
      )
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Simple baseline: if no completed sprints, use active sprint + backlog ratio
    const avgVelocity =
      completedSprints.length > 0
        ? totalPointsDelivered / Math.max(1, completedSprints.length)
        : 15; // Conservative industry baseline

    // 2. Remaining Scope
    const remainingPoints = tasks
      .filter((t) => t.status !== "DONE" && t.type !== "EPIC")
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // 3. Forecast Time
    const weeksToComplete =
      avgVelocity > 0 ? remainingPoints / avgVelocity : Infinity;
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(
      estimatedCompletionDate.getDate() + weeksToComplete * 7,
    );

    // 4. Comparison with Deadline
    const deadline = new Date(project.endDate);
    const isOverdue = estimatedCompletionDate > deadline;
    const bufferDays = Math.floor(
      (deadline.getTime() - estimatedCompletionDate.getTime()) /
        (1000 * 3600 * 24),
    );

    return {
      avgVelocity,
      remainingPoints,
      estimatedCompletionDate,
      isOverdue,
      bufferDays,
      weeksToComplete: weeksToComplete.toFixed(1),
    };
  }, [project, tasks, sprints]);

  return (
    <div className="bg-slate-950 rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
      {/* Decorative Aura */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 transition-colors duration-1000 ${analytics.isOverdue ? "bg-red-500" : "bg-primary"}`}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-6">
          <div
            className={`p-5 rounded-3xl border transition-colors ${analytics.isOverdue ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-primary/10 border-primary/20 text-primary"}`}
          >
            <Rocket
              className={`w-8 h-8 ${analytics.isOverdue ? "" : "animate-pulse"}`}
            />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
              Launch Forecast
            </h3>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-1">
              Predictive Delivery Intelligence
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end text-right">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
              Team Throughput
            </span>
          </div>
          <span className="text-2xl font-black text-white leading-none tabular-nums">
            {analytics.avgVelocity.toFixed(1)}{" "}
            <span className="text-xs text-white/30 uppercase ml-1">
              pts/cycle
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 relative z-10">
        {/* Estimated Date Card */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/[0.08] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
              Estimated Arrival
            </span>
          </div>
          <p className="text-xl font-black text-white">
            {analytics.estimatedCompletionDate.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-[9px] font-bold text-white/30 uppercase mt-1">
            ~ {analytics.weeksToComplete} development cycles
          </p>
        </div>

        {/* Remaining Points */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:bg-white/[0.08] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
              Remaining Scope
            </span>
          </div>
          <p className="text-xl font-black text-white">
            {analytics.remainingPoints}{" "}
            <span className="text-[10px] text-white/30">PTS</span>
          </p>
          <p className="text-[9px] font-bold text-white/30 uppercase mt-1">
            Across {tasks.filter((t) => t.status !== "DONE").length} active
            nodes
          </p>
        </div>

        {/* Buffer / Risk Status */}
        <div
          className={`border p-6 rounded-[2rem] transition-all ${analytics.isOverdue ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}
        >
          <div className="flex items-center gap-3 mb-4">
            {analytics.isOverdue ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">
              Deadline Buffer
            </span>
          </div>
          <p
            className={`text-xl font-black ${analytics.isOverdue ? "text-red-500" : "text-emerald-500"}`}
          >
            {analytics.bufferDays > 0
              ? `+${analytics.bufferDays}`
              : analytics.bufferDays}{" "}
            <span className="text-[10px]">DAYS</span>
          </p>
          <p
            className={`text-[9px] font-bold uppercase mt-1 ${analytics.isOverdue ? "text-red-500/50" : "text-emerald-500/50"}`}
          >
            {analytics.isOverdue
              ? "Strategic Delay Detected"
              : "Mission On Track"}
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/20" />
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none">
            Last Pulse Sync: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <button className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:text-white transition-colors">
          Configure Baseline Parameters →
        </button>
      </div>
    </div>
  );
}
