import React from "react";
import { Users, Building2, CreditCard, Activity } from "lucide-react";
import { StatCard } from "../ui/StatCard";

interface PremiumStatGridProps {
  stats: {
    total: number;
    active: number;
    suspended: number;
    [key: string]: number | undefined;
  };
}

export default function PremiumStatGrid({ stats }: PremiumStatGridProps) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        label="Total Entities"
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
        value={`${Math.round(((stats.active || 0) / (stats.total || 1)) * 100)}%`}
        icon={CreditCard}
        color="purple"
      />
    </div>
  );
}
