/**
 * Shared analytics interfaces for Manager and Organization level reports.
 */

export interface StatusDistributionItem {
  status: string;
  count: number;
}

export interface PerformanceMetric {
  userId: string;
  name: string;
  storyPoints: number;
  taskCount: number;
}

export interface MonthlyVelocityItem {
  month: string;
  points: number;
}

export interface ProjectHealthItem {
  id: string;
  name: string;
  overdueCount: number;
  totalActiveTasks: number;
  health: "GREEN" | "AMBER" | "RED";
}

export interface MemberWorkloadItem {
  name: string;
  taskCount: number;
  totalPoints: number;
}

export interface ProjectProgressItem {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface ManagerAnalyticsData {
  performance: PerformanceMetric[];
  tasks: StatusDistributionItem[];
  projects: StatusDistributionItem[]; // Reusing distribution for project statuses
  velocity: MonthlyVelocityItem[];
  health: ProjectHealthItem[];
  workload: MemberWorkloadItem[];
}

export interface MemberAnalyticsData {
  performance: PerformanceMetric[];
  tasks: StatusDistributionItem[];
  velocity: MonthlyVelocityItem[];
}

export interface AdminAnalyticsData {
  revenue: Array<{ month: string; amount: number }>;
  organizations: {
    total: number;
    distribution: StatusDistributionItem[];
  };
  plans: Array<{ planName: string; count: number }>;
}
