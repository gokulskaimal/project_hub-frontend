"use client";

import React from "react";
import { Activity, ShieldCheck, ChevronRight } from "lucide-react";
import { ProgressArc } from "../ui/ProgressArc";
import { motion } from "framer-motion";

interface ProjectHealth {
  id: string;
  name: string;
  overdueCount: number;
  totalActiveTasks: number;
  health: "GREEN" | "AMBER" | "RED";
}

interface PortfolioHealthWidgetProps {
  projects: ProjectHealth[];
  loading?: boolean;
}

export const PortfolioHealthWidget: React.FC<PortfolioHealthWidgetProps> = ({
  projects = [],
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate average health based on color priority
  const calculateNumericHealth = (h: "GREEN" | "AMBER" | "RED") => {
    if (h === "GREEN") return 100;
    if (h === "AMBER") return 60;
    return 30;
  };

  const averageHealth =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (acc, p) => acc + calculateNumericHealth(p.health),
            0,
          ) / projects.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="flex flex-col items-center gap-6 p-8 glass-card rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <ShieldCheck className="w-24 h-24 text-primary" />
        </div>

        <div className="relative">
          <ProgressArc
            value={averageHealth}
            max={100}
            size={180}
            label="Integrity"
            color={
              averageHealth > 75
                ? "#10B981"
                : averageHealth > 45
                  ? "#F59E0B"
                  : "#EF4444"
            }
          />
        </div>

        <div className="w-full space-y-2 text-center pt-2">
          <div className="pb-2">
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 opacity-50">
              Portfolio Status
            </h3>
            <p className="text-sm font-black text-foreground uppercase tracking-tight">
              {averageHealth > 75
                ? "System Nominal"
                : averageHealth > 45
                  ? "At Risk"
                  : "Critical Intervention Required"}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-foreground">
                {projects.length}
              </span>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Projects
              </span>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-emerald-500">
                {projects.filter((p) => p.health === "GREEN").length}
              </span>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Stable
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Specific Health */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2 mb-4">
          Node Health Distribution
        </h4>
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-4 glass-card rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-1.5 h-8 rounded-full ${
                  project.health === "GREEN"
                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : project.health === "AMBER"
                      ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                      : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                }`}
              />
              <div className="min-w-0">
                <h5 className="text-[11px] font-black text-foreground uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h5>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  {project.overdueCount} Overdue Tasks
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
          </motion.div>
        ))}

        {projects.length === 0 && (
          <div className="py-12 glass-card rounded-[2rem] border border-dashed border-white/5 flex flex-col items-center justify-center opacity-50">
            <Activity className="w-12 h-12 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              No Active Nodes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioHealthWidget;
