"use client";

import React from "react";
import { Project, Task, Sprint } from "@/types/project";
import ProjectForecastCard from "./ProjectForecastCard";
import EfficiencyTrendChart from "./EfficiencyTrendChart";
import ProjectBurnUpChart from "./ProjectBurnUpChart";
import { ShieldCheck, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StrategicProjectReportProps {
  project: Project;
  tasks: Task[];
  sprints: Sprint[];
}

export default function StrategicProjectReport({
  project,
  tasks,
  sprints,
}: StrategicProjectReportProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-12"
    >
      {/* Strategic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.5rem] bg-slate-950 flex items-center justify-center shadow-2xl border border-white/10 ring-4 ring-emerald-500/10">
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
              Project Report
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-60">
              See how the project is moving and how fast your team is.
            </p>
          </div>
        </div>
      </div>

      {/* Main Forecasting Engine */}
      <ProjectForecastCard project={project} tasks={tasks} sprints={sprints} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Scope Growth & Delivery Speed */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <Target className="w-4 h-4 text-primary" />
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Tasks vs Progress
            </h4>
          </div>
          <ProjectBurnUpChart project={project} tasks={tasks} />
        </div>

        {/* Team Evolution */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Team Speed Trend
            </h4>
          </div>
          <EfficiencyTrendChart tasks={tasks} />
        </div>
      </div>

      {/* Milestone Progress Tracker */}
      <div className="bg-card p-10 rounded-[3rem] border border-border shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-black text-foreground tracking-tight uppercase">
              Project Timeline
            </h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
              How close we are to finishing.
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-primary tabular-nums">
              {project.progress || 0}%
            </span>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
              Overall Progress
            </p>
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative h-4 bg-secondary/30 rounded-full border border-border/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress || 0}%` }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          />

          {/* Phase Markers */}
          <div className="absolute top-0 left-[25%] h-full w-px bg-white/20" />
          <div className="absolute top-0 left-[50%] h-full w-px bg-white/20" />
          <div className="absolute top-0 left-[75%] h-full w-px bg-white/20" />
        </div>

        <div className="grid grid-cols-4 mt-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1">
          <span>Start</span>
          <span className="text-center">Planning</span>
          <span className="text-center">Working</span>
          <span className="text-right">Finish</span>
        </div>
      </div>
    </motion.div>
  );
}
