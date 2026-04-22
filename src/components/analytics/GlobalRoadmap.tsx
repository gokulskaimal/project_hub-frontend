"use client";

import React, { useMemo, useState } from "react";
import { Project } from "@/types/project";
import {
  format,
  differenceInDays,
  addDays,
  min,
  max,
  startOfMonth,
  addMonths,
  isBefore,
  isAfter,
} from "date-fns";
import { Briefcase, Rocket, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface GlobalRoadmapProps {
  projects: Project[];
}

export const GlobalRoadmap: React.FC<GlobalRoadmapProps> = ({
  projects = [],
}) => {
  const [filterView, setFilterView] = useState<"ALL" | "ACTIVE">("ALL");

  const { chartData, timescale, totalDays, startDate, endDate } =
    useMemo(() => {
      if (!projects || projects.length === 0) {
        return {
          chartData: [],
          timescale: [],
          totalDays: 0,
          startDate: new Date(),
          endDate: new Date(),
        };
      }

      const visibleProjects = projects.filter((p) =>
        filterView === "ALL" ? true : p.status === "ACTIVE",
      );

      if (visibleProjects.length === 0) {
        return {
          chartData: [],
          timescale: [],
          totalDays: 0,
          startDate: new Date(),
          endDate: new Date(),
        };
      }

      const projectDates = visibleProjects.map((p) => {
        const start = p.createdAt ? new Date(p.createdAt) : new Date();
        const end = p.endDate ? new Date(p.endDate) : addDays(start, 45);
        return { start, end };
      });

      const absoluteMinDate = min(projectDates.map((d) => d.start));
      let absoluteMaxDate = max(projectDates.map((d) => d.end));

      const chartStart = startOfMonth(absoluteMinDate);
      let chartEnd = startOfMonth(addMonths(absoluteMaxDate, 2));

      if (differenceInDays(chartEnd, chartStart) < 90) {
        chartEnd = addMonths(chartStart, 3);
      }

      const tDays = differenceInDays(chartEnd, chartStart) || 1;

      const timescaleArr = [];
      let currentScaleMonth = chartStart;
      while (isBefore(currentScaleMonth, chartEnd)) {
        const nextMonth = addMonths(currentScaleMonth, 1);
        const daysInMonth = differenceInDays(nextMonth, currentScaleMonth);
        timescaleArr.push({
          label: format(currentScaleMonth, "MMM yyyy"),
          widthPercent: (daysInMonth / tDays) * 100,
        });
        currentScaleMonth = nextMonth;
      }

      const chartData = visibleProjects
        .map((p) => {
          const start = p.createdAt ? new Date(p.createdAt) : new Date();
          const end = p.endDate ? new Date(p.endDate) : addDays(start, 45);
          const safeEnd = isAfter(end, start) ? end : addDays(start, 30);

          const offsetDays = Math.max(0, differenceInDays(start, chartStart));
          const durDays = Math.max(1, differenceInDays(safeEnd, start));

          return {
            ...p,
            realStart: start,
            realEnd: safeEnd,
            offsetPercent: (offsetDays / tDays) * 100,
            widthPercent: (durDays / tDays) * 100,
          };
        })
        .sort((a, b) => a.realStart.getTime() - b.realStart.getTime());

      return {
        chartData,
        timescale: timescaleArr,
        totalDays: tDays,
        startDate: chartStart,
        endDate: chartEnd,
      };
    }, [projects, filterView]);

  if (!projects || projects.length === 0) return null;

  return (
    <div className="bg-slate-950/40 rounded-[2.5rem] border border-white/5 shadow-2xl p-6 sm:p-8 overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Rocket className="w-6 h-6 text-primary" />
            Global Organization Roadmap
          </h2>
          <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">
            Strategic multi-node synchronization
          </p>
        </div>

        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setFilterView("ALL")}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterView === "ALL" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-white"}`}
          >
            All Nodes
          </button>
          <button
            onClick={() => setFilterView("ACTIVE")}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterView === "ACTIVE" ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-white"}`}
          >
            Active Only
          </button>
        </div>
      </div>

      <div className="relative flex-1 overflow-x-auto no-scrollbar border border-white/5 rounded-[2rem] bg-black/20">
        <div className="min-w-[1000px] h-full flex flex-col relative pb-8">
          <div className="flex border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-20">
            <div className="w-[240px] shrink-0 p-4 border-r border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center">
              System Designation
            </div>
            <div className="flex-1 flex relative">
              {timescale.map((month, i) => (
                <div
                  key={i}
                  className="p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-l border-white/5"
                  style={{ width: `${month.widthPercent}%` }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-[50px] left-[240px] right-0 bottom-0 flex pointer-events-none z-0">
            {timescale.map((month, i) => (
              <div
                key={i}
                className="border-l border-white/5 h-full"
                style={{ width: `${month.widthPercent}%` }}
              />
            ))}
          </div>

          {isAfter(new Date(), startDate) && isBefore(new Date(), endDate) && (
            <div
              className="absolute top-[50px] bottom-0 w-0.5 bg-primary/50 z-10 pointer-events-none shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              style={{
                left: `calc(240px + ${(differenceInDays(new Date(), startDate) / totalDays) * 100}%)`,
              }}
            />
          )}

          <div className="flex-1 overflow-y-auto relative z-10 pt-4 pb-12 space-y-1">
            {chartData.map((project, idx) => (
              <div
                key={project.id}
                className="flex items-center h-14 hover:bg-white/5 transition-colors group relative"
              >
                <div className="w-[240px] shrink-0 px-6 py-2 border-r border-white/5 h-full flex flex-col justify-center bg-transparent group-hover:bg-white/5 transition-colors">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
                    Status: {project.status}
                  </span>
                </div>

                <div className="flex-1 relative h-full flex items-center pr-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`absolute h-8 rounded-xl border border-white/10 flex items-center px-4 overflow-hidden shadow-xl transition-all hover:ring-2 ring-primary/20 
                       ${
                         project.status === "ACTIVE"
                           ? "bg-primary/20 border-primary/30 text-primary-foreground"
                           : project.status === "COMPLETED"
                             ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                             : "bg-white/5 border-white/10 text-muted-foreground"
                       }
                     `}
                    style={{
                      left: `${project.offsetPercent}%`,
                      width: `${Math.max(project.widthPercent, 2)}%`,
                    }}
                  >
                    <Briefcase className="w-3 h-3 shrink-0 mr-2 opacity-50" />
                    <span className="text-[10px] font-black truncate tracking-wide uppercase">
                      {format(project.realStart, "MMM d")} -{" "}
                      {format(project.realEnd, "MMM d")}
                    </span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalRoadmap;
