"use client";

import React from "react";
import { Sprint, Task } from "@/types/project";
import { Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface SprintCapacityProps {
  sprints: Sprint[];
  tasks: Task[];
  activeSprintId?: string;
}

export default function SprintCapacity({
  sprints,
  tasks,
  activeSprintId,
}: SprintCapacityProps) {
  const sprint =
    sprints.find((s) => s.id === activeSprintId) ||
    sprints.find((s) => s.status === "ACTIVE");

  if (!sprint) return null;

  const completedSprints = sprints
    .filter((s) => s.status === "COMPLETED")
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
    )
    .slice(0, 3);

  let averageCapacity = 0;
  if (completedSprints.length > 0) {
    const totalPoints = completedSprints.reduce((total, s) => {
      return (
        total +
        tasks
          .filter((t) => t.sprintId === s.id && t.status === "DONE")
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
      );
    }, 0);
    averageCapacity = Math.round(totalPoints / completedSprints.length);
  }

  const currentPoints = tasks
    .filter((t) => t.sprintId === sprint.id)
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const percentage =
    averageCapacity > 0 ? (currentPoints / averageCapacity) * 100 : 0;
  const isOverloaded = percentage > 100;

  const getStatusColor = () => {
    if (percentage > 100)
      return {
        bar: "bg-rose-500 shadow-rose-500/20",
        bg: "bg-rose-500/10",
        text: "text-rose-500",
      };
    if (percentage > 85)
      return {
        bar: "bg-amber-500 shadow-amber-500/20",
        bg: "bg-amber-500/10",
        text: "text-amber-500",
      };
    return {
      bar: "bg-primary shadow-primary/20",
      bg: "bg-primary/5",
      text: "text-primary",
    };
  };

  const config = getStatusColor();

  return (
    <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm transition-all duration-500 hover:shadow-xl group overflow-hidden relative transition-colors duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground tracking-tight">
              System Load Analysis
            </h3>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">
              Real-time Sprint Capacity Balance
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            AVG Capacity
          </span>
          <span className="text-xl font-black text-foreground">
            {averageCapacity}{" "}
            <span className="text-[10px] opacity-40">PTS</span>
          </span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${config.text}`}
            >
              {Math.round(percentage)}% Node Utilization
            </span>
          </div>
          <span className="text-[11px] font-black text-foreground uppercase">
            {currentPoints} / {averageCapacity}{" "}
            <span className="text-[9px] text-muted-foreground">PTS</span>
          </span>
        </div>

        <div className="relative h-4 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/50 p-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={`h-full rounded-full transition-all duration-500 shadow-lg ${config.bar}`}
          />
          {isOverloaded && (
            <motion.div
              initial={{ left: "100%", width: 0 }}
              animate={{ left: "100%", width: `${percentage - 100}%` }}
              className="absolute top-1 bottom-1 bg-rose-400 opacity-40 rounded-r-full"
            />
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            {isOverloaded ? (
              <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">
                  Resource Critical Level
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">
                  Optimal Load Profile
                </span>
              </div>
            )}
          </div>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
            Based on last 3 runs
          </span>
        </div>
      </div>
    </div>
  );
}
