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
    <div className="flex items-center gap-3 bg-secondary/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm transition-colors duration-500">
      <Calendar className="w-3.5 h-3.5 text-primary" />
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 ${
              value === opt.value
                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            {opt.value}
          </button>
        ))}
      </div>
    </div>
  );
};
