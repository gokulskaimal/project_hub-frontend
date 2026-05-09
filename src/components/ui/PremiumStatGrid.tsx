import React from "react";
import { LucideIcon } from "lucide-react";
import { StatCard } from "./StatCard";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

interface PremiumStatGridProps {
  items: StatItem[];
}

export default function PremiumStatGrid({ items }: PremiumStatGridProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6 sm:mb-8">
      {items.map((item, index) => (
        <StatCard
          key={index}
          label={item.label}
          value={item.value}
          icon={item.icon}
          color={item.color}
          trend={item.trend}
        />
      ))}
    </div>
  );
}
