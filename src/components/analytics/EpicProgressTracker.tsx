"use client";

import { useMemo } from "react";
import { Layers, Target, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useGetEpicAnalyticsQuery } from "@/store/api/projectApiSlice";

interface EpicProgressTrackerProps {
  projectId: string;
}

export default function EpicProgressTracker({
  projectId,
}: EpicProgressTrackerProps) {
  const { data: epics = [], isLoading } = useGetEpicAnalyticsQuery(projectId);

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm animate-pulse transition-colors duration-500">
        <div className="h-6 w-48 bg-secondary/30 rounded mb-4" />
        <div className="space-y-4">
          <div className="h-12 bg-secondary/10 rounded" />
          <div className="h-12 bg-secondary/10 rounded" />
        </div>
      </div>
    );
  }

  if (epics.length === 0) {
    return null; // Don't show if no epics exist
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm space-y-6 transition-colors duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Epic Progress
        </h3>
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/30 px-2 py-1 rounded">
          {epics.length} Active Epics
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {epics.map((epic, index) => (
          <motion.div
            key={epic.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-black text-foreground uppercase tracking-tight truncate">
                    {epic.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                      {epic.completedStories} / {epic.totalStories} Stories
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-[11px] font-black ${epic.progress === 100 ? "text-emerald-500" : "text-primary"}`}
              >
                {Math.round(epic.progress)}%
              </span>
            </div>

            <div className="relative h-2.5 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${epic.progress}%` }}
                transition={{ duration: 1.5, ease: "circOut", delay: 0.3 }}
                className={`h-full rounded-full shadow-lg ${
                  epic.progress === 100
                    ? "bg-emerald-500 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-primary to-violet-500 shadow-primary/20"
                }`}
              />
            </div>

            {epic.progress === 100 && (
              <div className="flex items-center gap-1.5 px-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                  Deliverable Finalized
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-border/30 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground opacity-40" />
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
            Real-time Node Pulse
          </span>
        </div>
      </div>
    </div>
  );
}
