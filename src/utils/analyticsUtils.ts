/**
 * Centralized utility for mapping API analytics data to Recharts-compatible formats.
 */

export const mapStatusDistribution = (data: any[] | undefined) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.status || item._id || "Unknown",
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

export const mapPerformanceData = (data: any[] | undefined) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.name || item.userId || "Unknown",
    value: item.storyPoints || item.completedCount || 0,
  }));
};

export const mapRevenueData = (data: any[] | undefined) => {
  if (!data || !Array.isArray(data)) return [];
  return data.map((item) => ({
    name: item.label || item.month || "Unknown",
    value: item.amount || item.points || 0,
  }));
};
