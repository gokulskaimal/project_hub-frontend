"use client";

import React, { useMemo } from "react";
import { Task, Sprint } from "@/types/project";
import { User } from "@/types/auth";
import SprintMetricsGrid from "./SprintMetricsGrid";
import SprintBurndownChart from "./SprintBurndownChart";
import MemberContributionChart from "./MemberContributionChart";
import TaskDistributionChart from "./TaskDistributionChart";
import {
  FileText,
  CheckCircle2,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import UserAvatar from "@/components/ui/UserAvatar";
import { ErrorBoundary } from "react-error-boundary";

interface SprintAnalysisReportProps {
  sprint: Sprint;
  tasks: Task[];
  sprints: Sprint[];
  members: User[];
}

export default function SprintAnalysisReport({
  sprint,
  tasks,
  sprints,
  members,
}: SprintAnalysisReportProps) {
  const sprintTasks = useMemo(() => {
    return tasks.filter((t) => t.sprintId === sprint.id);
  }, [tasks, sprint]);

  const completedTasks = useMemo(() => {
    return sprintTasks.filter((t) => t.status === "DONE");
  }, [sprintTasks]);

  const unfinishedTasks = useMemo(() => {
    return sprintTasks.filter((t) => t.status !== "DONE");
  }, [sprintTasks]);

  if (!sprint) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-16 pb-20"
    >
      {/* Header Analysis Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[1.5rem] bg-slate-950 flex items-center justify-center shadow-2xl border border-white/10 ring-4 ring-primary/5">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
              Mission Report: {sprint.name}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-60">
              Tactical performance audit & Delivery analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3 overflow-hidden p-1">
            {/* Unique assignees in this sprint */}
            {Array.from(
              new Set(sprintTasks.map((t) => t.assignedTo).filter(Boolean)),
            )
              .slice(0, 5)
              .map((userId) => {
                const member = members.find(
                  (m) => String(m.id) === String(userId),
                );
                return (
                  <div
                    key={userId}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-background"
                  >
                    <UserAvatar user={member} size="sm" />
                  </div>
                );
              })}
          </div>
          <div className="h-8 w-px bg-border/50 mx-2" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            {sprintTasks.length} NODES ENGAGED
          </span>
        </div>
      </div>

      {/* Top Level Scorecard */}
      <div className="px-1">
        <SprintMetricsGrid
          selectedSprintId={sprint.id}
          sprints={sprints}
          tasks={tasks}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Vector: Burndown */}
        <div className="lg:col-span-8">
          <ErrorBoundary
            fallback={
              <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm h-full flex items-center justify-center text-center">
                <AlertCircle className="w-8 h-8 text-destructive/50 mb-3 mx-auto" />
                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
                  Burndown Analysis Unavailable
                </p>
              </div>
            }
          >
            <SprintBurndownChart sprint={sprint} tasks={tasks} />
          </ErrorBoundary>
        </div>

        {/* Typology & Composition */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-8">
          <ErrorBoundary
            fallback={
              <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex items-center justify-center text-center min-h-[250px]">
                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
                  Typology Data Unavailable
                </p>
              </div>
            }
          >
            <TaskDistributionChart
              tasks={tasks}
              selectedSprintId={sprint.id}
              sprints={sprints}
            />
          </ErrorBoundary>
          <ErrorBoundary
            fallback={
              <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex items-center justify-center text-center min-h-[250px]">
                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">
                  Operator Data Unavailable
                </p>
              </div>
            }
          >
            <MemberContributionChart
              tasks={tasks}
              sprints={sprints}
              selectedSprintId={sprint.id}
            />
          </ErrorBoundary>
        </div>
      </div>

      {/* Operational Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        {/* Success List */}
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <CheckCircle2 size={120} className="text-emerald-500 -rotate-12" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight">
                Delivered Objectives
              </h3>
            </div>
            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">
              {completedTasks.length} SUCCESSFUL
            </span>
          </div>

          <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {completedTasks.length > 0 ? (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/30 hover:border-emerald-500/30 transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-tighter w-12 shrink-0">
                      {task.taskKey || "TASK"}
                    </span>
                    <p className="text-xs font-bold text-foreground truncate max-w-[200px]">
                      {task.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                      {task.storyPoints || 0} PTS
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-emerald-500 opacity-0 group-hover/item:opacity-100 transition-all"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  No nodes finalized in this sector
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stalled/Unfinished Context */}
        <div className="bg-card rounded-[2.5rem] border border-border shadow-sm p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <AlertCircle size={120} className="text-amber-500 rotate-12" />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-[13px] font-black text-foreground uppercase tracking-tight">
                Active Spillovers
              </h3>
            </div>
            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg">
              {unfinishedTasks.length} STALLED
            </span>
          </div>

          <div className="space-y-4 relative z-10 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {unfinishedTasks.length > 0 ? (
              unfinishedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-border/30 hover:border-amber-500/30 transition-all group/item"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <p className="text-xs font-bold text-foreground truncate max-w-[200px]">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${task.status === "IN_PROGRESS" ? "bg-primary animate-pulse" : "bg-slate-500"}`}
                        />
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest opacity-60">
                      Requires Migration
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Optimal clearance. No spillovers detected.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
