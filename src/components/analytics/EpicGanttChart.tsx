"use client";

import React, { useMemo } from "react";
import { Task } from "@/types/project";
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
import { Map, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface EpicGanttChartProps {
  epics: Task[];
  children?: React.ReactNode;
}

export const EpicGanttChart: React.FC<EpicGanttChartProps> = ({
  epics = [],
  children,
}) => {
  const { chartData, timescale, totalDays, startDate, endDate } =
    useMemo(() => {
      if (!epics || epics.length === 0) {
        return {
          chartData: [],
          timescale: [],
          totalDays: 0,
          startDate: new Date(),
          endDate: new Date(),
        };
      }

      const epicDates = epics.map((e) => {
        const start = e.createdAt ? new Date(e.createdAt) : new Date();
        const end = e.dueDate ? new Date(e.dueDate) : addDays(start, 30);
        return { start, end };
      });

      const absoluteMinDate = min(epicDates.map((d) => d.start));
      const absoluteMaxDate = max(epicDates.map((d) => d.end));

      const chartStart = startOfMonth(absoluteMinDate);
      let chartEnd = startOfMonth(addMonths(absoluteMaxDate, 2));

      if (differenceInDays(chartEnd, chartStart) < 60) {
        chartEnd = addMonths(chartStart, 2);
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

      const chartData = epics
        .map((e) => {
          const start = e.createdAt ? new Date(e.createdAt) : new Date();
          const end = e.dueDate ? new Date(e.dueDate) : addDays(start, 30);
          const safeEnd = isAfter(end, start) ? end : addDays(start, 30);

          const offsetDays = Math.max(0, differenceInDays(start, chartStart));
          const durDays = Math.max(1, differenceInDays(safeEnd, start));

          return {
            ...e,
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
    }, [epics]);

  if (!epics || epics.length === 0) {
    return (
      <div className="py-24 glass-card rounded-[2.5rem] border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Map className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
          Roadmap Empty
        </h3>
        <p className="text-sm text-muted-foreground max-w-md font-bold uppercase tracking-widest opacity-60">
          Create an Epic to start plotting out your project&apos;s timeline
          here.
        </p>
        {children}
      </div>
    );
  }

  return (
    <div className="bg-slate-950/40 rounded-[2.5rem] border border-white/5 shadow-2xl p-6 sm:p-8 overflow-hidden flex flex-col h-full min-h-[500px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Layers className="w-6 h-6 text-primary" />
            Epic Project Roadmap
          </h2>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">
            Master deliverable timeline synchronization
          </p>
        </div>
        {children}
      </div>

      <div className="relative flex-1 overflow-x-auto no-scrollbar border border-white/5 rounded-[2rem] bg-black/20">
        <div className="min-w-[900px] h-full flex flex-col relative pb-8">
          <div className="flex border-b border-white/5 bg-white/5 backdrop-blur-md sticky top-0 z-20">
            <div className="w-[220px] shrink-0 p-4 border-r border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center">
              Epic Reference
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

          <div className="absolute top-[50px] left-[220px] right-0 bottom-0 flex pointer-events-none z-0">
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
                left: `calc(220px + ${(differenceInDays(new Date(), startDate) / totalDays) * 100}%)`,
              }}
            />
          )}

          <div className="flex-1 overflow-y-auto relative z-10 pt-4 pb-12 space-y-1">
            {chartData.map((epic, idx) => (
              <div
                key={epic.id}
                className="flex items-center h-14 hover:bg-white/5 transition-colors group relative"
              >
                <div className="w-[220px] shrink-0 px-6 py-2 border-r border-white/5 h-full flex flex-col justify-center bg-transparent group-hover:bg-white/5 transition-colors">
                  <span className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                    {epic.title}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
                    {epic.taskKey || epic.status}
                  </span>
                </div>

                <div className="flex-1 relative h-full flex items-center pr-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`absolute h-8 rounded-xl border border-white/10 flex items-center px-4 overflow-hidden shadow-xl transition-all hover:ring-2 ring-primary/20 cursor-default
                       ${epic.status === "DONE" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-primary/20 border-primary/30 text-primary-foreground"}
                     `}
                    style={{
                      left: `${epic.offsetPercent}%`,
                      width: `${Math.max(epic.widthPercent, 2.5)}%`,
                    }}
                  >
                    <span className="text-[10px] font-black truncate tracking-wide uppercase whitespace-nowrap">
                      {Math.round(epic.progress || 0)}% Complete
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

export default EpicGanttChart;
