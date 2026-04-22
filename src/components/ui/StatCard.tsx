"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // e.g. "indigo", "emerald", "rose", "amber", "violet"
  loading?: boolean;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color = "indigo",
  loading = false,
  trend,
}) => {
  const colorMap: Record<
    string,
    {
      bg: string;
      text: string;
      iconBg: string;
      glow: string;
      line: string;
    }
  > = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-500",
      iconBg: "bg-indigo-500",
      glow: "shadow-indigo-500/20",
      line: "bg-indigo-500",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
      iconBg: "bg-emerald-500",
      glow: "shadow-emerald-500/20",
      line: "bg-emerald-500",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      iconBg: "bg-rose-500",
      glow: "shadow-rose-500/20",
      line: "bg-rose-500",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-500",
      iconBg: "bg-violet-500",
      glow: "shadow-violet-500/20",
      line: "bg-violet-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      iconBg: "bg-amber-500",
      glow: "shadow-amber-500/20",
      line: "bg-amber-500",
    },
  };

  const colors = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative group bg-card overflow-hidden rounded-2xl border border-border/50 p-4 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out cursor-default"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-700">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={`grid-${label}`}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#grid-${label})`} />
        </svg>
      </div>

      {/* Decorative Glow */}
      <div
        className={`absolute -right-12 -top-12 w-48 h-48 rounded-full ${colors.bg} opacity-20 group-hover:opacity-40 transition-all duration-700 blur-3xl group-hover:scale-125`}
      />

      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div
            className={`p-3 rounded-xl ${colors.bg} ${colors.text} shadow-inner group-hover:scale-110 transition-transform duration-500`}
          >
            <Icon size={20} />
          </div>
          <div className="text-right">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg border border-border/50 bg-secondary/30 text-muted-foreground whitespace-nowrap shadow-sm`}
            >
              {label}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-black text-foreground tracking-tighter select-all">
            {loading ? (
              <div className="h-10 w-24 bg-secondary/50 animate-pulse rounded-lg" />
            ) : (
              value
            )}
          </h3>

          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 h-1 rounded-full bg-secondary/50 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "33%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${colors.line} opacity-40 group-hover:opacity-100 transition-all duration-700 group-hover:w-full`}
              />
            </div>
            {trend && (
              <div
                className={`flex items-center gap-1.5 shrink-0 ${trend.isPositive ? "text-emerald-500" : "text-rose-500"}`}
              >
                <span className="text-[10px] font-black tracking-widest tabular-nums font-mono">
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${trend.isPositive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50"} shadow-lg animate-pulse`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
