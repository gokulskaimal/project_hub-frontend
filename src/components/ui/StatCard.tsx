import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string; // e.g. "blue", "green", "red", "purple"
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
  color = "blue",
  loading = false,
  trend,
}) => {
  const colorMap: Record<
    string,
    { bg: string; text: string; iconBg: string; shadow: string }
  > = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      iconBg: "bg-blue-600",
      shadow: "shadow-blue-200",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      iconBg: "bg-green-600",
      shadow: "shadow-green-200",
    },
    red: {
      bg: "bg-red-50",
      text: "text-red-600",
      iconBg: "bg-red-600",
      shadow: "shadow-red-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      iconBg: "bg-purple-600",
      shadow: "shadow-purple-200",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      iconBg: "bg-orange-600",
      shadow: "shadow-orange-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      iconBg: "bg-emerald-600",
      shadow: "shadow-emerald-200",
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="relative group bg-white overflow-hidden rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 ease-out cursor-default">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity duration-500">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Glow */}
      <div
        className={`absolute -right-12 -top-12 w-32 h-32 sm:w-48 sm:h-48 rounded-full ${colors.bg} opacity-20 group-hover:opacity-60 transition-all duration-700 blur-3xl group-hover:scale-150`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <div
            className={`p-2.5 sm:p-4 rounded-2xl ${colors.bg} ${colors.text} shadow-inner group-hover:scale-110 transition-transform duration-500`}
          >
            <Icon size={18} className="sm:w-6 sm:h-6" />
          </div>
          <div className="text-right">
            <span
              className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border-2 ${colors.bg} ${colors.text} border-opacity-30 whitespace-nowrap shadow-sm`}
            >
              {label}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <h3 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tighter mb-1 select-all">
            {loading ? (
              <div className="h-8 sm:h-12 w-20 sm:w-32 bg-gray-100 animate-pulse rounded-xl" />
            ) : (
              value
            )}
          </h3>
          <div className="flex items-center justify-between">
            <div
              className={`h-1 w-8 sm:w-12 rounded-full ${colors.iconBg} opacity-30 group-hover:w-full transition-all duration-700`}
            />
            {trend && (
              <div
                className={`flex items-center gap-1.5 ml-2 ${trend.isPositive ? "text-emerald-600" : "text-red-600"}`}
              >
                <span className="text-[10px] font-black tracking-widest tabular-nums font-mono">
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${trend.isPositive ? "bg-emerald-500" : "bg-red-500"} animate-pulse`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
