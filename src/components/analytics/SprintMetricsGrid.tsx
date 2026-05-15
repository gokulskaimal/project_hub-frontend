"use client";

import React from "react";
import { Task, Sprint } from "@/types/project";
import { CheckCircle2, Target, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface SprintMetricsGridProps {
  selectedSprintId?: string;
  sprints: Sprint[];
  tasks: Task[];
}

export default function SprintMetricsGrid({
  selectedSprintId,
  sprints,
  tasks,
}: SprintMetricsGridProps) {
  const sprint =
    sprints.find((s) => s.id === selectedSprintId) ||
    sprints.find((s) => s.status === "ACTIVE");

  if (!sprint) {
    return (
      <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm text-center mb-6 transition-colors duration-500">
        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">
          Select a sprint to view performance metrics
        </p>
      </div>
    );
  }

  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
  const totalPoints = sprintTasks.reduce(
    (sum, t) => sum + (t.storyPoints || 0),
    0,
  );
  const completedPoints = sprintTasks
    .filter((t) => t.status === "DONE")
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  const totalTasks = sprintTasks.length;
  const completedTasks = sprintTasks.filter((t) => t.status === "DONE").length;
  const completionRate =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Say/Do Ratio: Actual Delivery vs Committed Points
  // Typically measured at the end of the sprint
  const sayDoRatio = completionRate;

  const metrics = [
    {
      label: "Sprint Velocity",
      value: `${completedPoints} / ${totalPoints}`,
      sub: "Total Story Points",
      icon: Target,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completion Rate",
      value: `${sayDoRatio}%`,
      sub: "Commitment Reliability",
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      label: "Tasks Completed",
      value: `${completedTasks} / ${totalTasks}`,
      sub: "Task completion",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Sprint Status",
      value: sprint.status,
      sub: "Current phase",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            className="p-5 rounded-[2rem] bg-card border border-border shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <Icon size={64} className={metric.color} />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div
                className={`p-2.5 rounded-2xl ${metric.bg} ${metric.color} shadow-inner`}
              >
                <Icon size={18} />
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-[20px] font-black text-foreground tracking-tighter leading-tight uppercase">
                {metric.value}
              </h4>
              <p className="text-[10px] font-black text-foreground uppercase tracking-tight mt-1">
                {metric.label}
              </p>
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-40">
                {metric.sub}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
