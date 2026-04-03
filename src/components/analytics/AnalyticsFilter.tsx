import React from "react";
import { Calendar } from "lucide-react";

export type TimeFrame = "DAY" | "WEEK" | "MONTH" | "YEAR";

interface AnalyticsFilterProps {
  value: TimeFrame;
  onChange: (value: TimeFrame) => void;
}

export const AnalyticsFilter: React.FC<AnalyticsFilterProps> = ({
  value,
  onChange,
}) => {
  const options: { label: string; value: TimeFrame }[] = [
    { label: "Last 24 Hours", value: "DAY" },
    { label: "Last 7 Days", value: "WEEK" },
    { label: "Last 30 Days", value: "MONTH" },
    { label: "Total Year", value: "YEAR" },
  ];

  return (
    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
      <Calendar className="w-3.5 h-3.5 text-blue-600" />
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${
              value === opt.value
                ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
          >
            {opt.value}
          </button>
        ))}
      </div>
    </div>
  );
};
