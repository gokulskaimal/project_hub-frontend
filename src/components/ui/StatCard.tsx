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
    <div className="relative group bg-white overflow-hidden rounded-xl border border-gray-50 p-2.5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Decorative Glow - Reduced on mobile */}
      <div
        className={`absolute -right-8 -top-8 sm:-right-6 sm:-top-6 w-20 h-20 sm:w-32 sm:h-32 rounded-full ${colors.bg} opacity-20 sm:opacity-50 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-150 blur-2xl`}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-6">
          <div
            className={`p-1.5 sm:p-3 ${colors.bg} ${colors.text} rounded-lg sm:rounded-xl group-hover:${colors.iconBg} group-hover:text-white transition-all duration-300 shadow-sm`}
          >
            <Icon size={14} className="sm:w-6 sm:h-6" />
          </div>
          <span
            className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded border ${colors.bg} ${colors.text} border-opacity-30 whitespace-nowrap`}
          >
            {label}
          </span>
        </div>

        <div>
          <h3 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {loading ? (
              <div className="h-6 sm:h-9 w-16 sm:w-24 bg-gray-100 animate-pulse rounded-lg" />
            ) : (
              value
            )}
          </h3>
          <div className="flex items-center justify-between mt-0.5 sm:mt-2">
            <p className="text-[9px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
              Stat
            </p>
            {trend && (
              <span
                className={`text-[9px] sm:text-[10px] font-black ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
