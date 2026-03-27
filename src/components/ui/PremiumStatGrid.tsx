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
  items?: StatItem[];
  // For backward compatibility
  stats?: {
    total: number;
    active: number;
    suspended: number;
    engagement?: number;
    [key: string]: any;
  };
}

export default function PremiumStatGrid({
  items,
  stats,
}: PremiumStatGridProps) {
  if (items) {
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

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        label="Total Members"
        value={stats.total || 0}
        icon={Users}
        color="blue"
      />
      <StatCard
        label="Active Status"
        value={stats.active || 0}
        icon={Activity}
        color="green"
      />
      <StatCard
        label="Alerts"
        value={stats.suspended || 0}
        icon={Building2}
        color="red"
      />
      <StatCard
        label="System Score"
        value={
          typeof stats.engagement === "number"
            ? `${Math.round(stats.engagement)}%`
            : `${Math.round(((stats.active || 0) / (stats.total || 1)) * 100)}%`
        }
        icon={CreditCard}
        color="purple"
      />
    </div>
  );
}

// Re-export icons for convenience if needed, or import them in pages.
import { Users, Building2, CreditCard, Activity } from "lucide-react";
