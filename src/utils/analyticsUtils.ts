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

export interface PlanDistributionItem {
  planName: string;
  count: number;
  totalRevenue?: number;
}

export const mapPlanDistribution = (
  data: PlanDistributionItem[] | undefined,
) => {
  if (!data || !Array.isArray(data)) return [];
  const mergedMap = new Map<
    string,
    { name: string; value: number; amount: number }
  >();

  data.forEach((item) => {
    const name = item.planName || "Unknown";
    const existing = mergedMap.get(name);
    if (existing) {
      existing.value += item.count || 0;
      existing.amount += item.totalRevenue || 0;
    } else {
      mergedMap.set(name, {
        name: name,
        value: item.count || 0,
        amount: item.totalRevenue || 0,
      });
    }
  });

  return Array.from(mergedMap.values());
};

export const mapPerformanceData = (data: PerformanceMetric[] | undefined) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name || item.userId || "Unknown",
    value: item.storyPoints || item.taskCount || 0,
  }));
};

export interface RevenueItem {
  label?: string;
  month?: string;
  amount: number;
}

export const mapRevenueData = (
  data: (MonthlyVelocityItem | RevenueItem)[] | undefined,
) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name:
      (item as RevenueItem).label ||
      (item as MonthlyVelocityItem).month ||
      "Unknown",
    value:
      (item as RevenueItem).amount || (item as MonthlyVelocityItem).points || 0,
  }));
};
