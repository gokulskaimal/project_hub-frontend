import {
  StatusDistributionItem,
  MonthlyVelocityItem,
  PerformanceMetric,
} from "@/types/analytics";

/**
 * Centralized utility for mapping API analytics data to Recharts-compatible formats.
 */

export const mapStatusDistribution = (
  data: StatusDistributionItem[] | undefined,
) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.status || "Unknown",
    value: item.count || 0,
  }));
};

export const mapPlanDistribution = (data: any[] | undefined) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.planName || "Unknown",
    value: item.count || 0,
    amount: item.totalRevenue || 0,
  }));
};

export const mapPerformanceData = (data: PerformanceMetric[] | undefined) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name || item.userId || "Unknown",
    value: item.storyPoints || item.taskCount || 0,
  }));
};

export const mapRevenueData = (
  data: MonthlyVelocityItem[] | any[] | undefined,
) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name:
      (item as any).label || (item as MonthlyVelocityItem).month || "Unknown",
    value: (item as any).amount || (item as MonthlyVelocityItem).points || 0,
  }));
};
