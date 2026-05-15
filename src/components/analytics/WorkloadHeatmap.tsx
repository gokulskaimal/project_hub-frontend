"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart2, Users } from "lucide-react";

interface MemberWorkloadItem {
  name: string;
  taskCount: number;
  totalPoints: number;
}

interface WorkloadHeatmapProps {
  data: MemberWorkloadItem[];
  loading?: boolean;
}

export const WorkloadHeatmap: React.FC<WorkloadHeatmapProps> = ({
  data = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const maxPoints = Math.max(...data.map((d) => d.totalPoints), 1);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {data.map((member, index) => {
          const percentage = (member.totalPoints / maxPoints) * 100;
          const statusColor =
            member.totalPoints > 30
              ? "bg-red-500"
              : member.totalPoints > 15
                ? "bg-amber-500"
                : "bg-primary";

          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center">
                    <Users className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                    {member.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
                    {member.taskCount} Tasks
                  </span>
                  <span className="text-[10px] font-black text-foreground">
                    {member.totalPoints} PTS
                  </span>
                </div>
              </div>

              <div className="relative h-2 w-full bg-secondary/30 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{
                    duration: 1.2,
                    delay: 0.2 + index * 0.1,
                    ease: "circOut",
                  }}
                  className={`absolute top-0 left-0 h-full rounded-full ${statusColor} shadow-lg shadow-current/20`}
                />

                {/* Visual Capacity Threshold */}
                <div className="absolute top-0 bottom-0 left-[80%] w-px bg-white/10 border-dashed" />
              </div>
            </motion.div>
          );
        })}

        {data.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center glass-card rounded-[2rem] border border-dashed border-white/5">
            <BarChart2 className="text-muted-foreground/20 w-12 h-12 mb-4" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              No workload data
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
            Balanced
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
            High Load
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
            At Risk
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorkloadHeatmap;
