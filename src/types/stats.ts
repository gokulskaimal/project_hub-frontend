export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  verified: number;
  unverified: number;
  byRole: Record<string, number>;
}

export interface OrgStats {
  total: number;
  active: number;
  inactive: number;
  byStatus: Record<string, number>;
}

export interface AdminDashboardStats {
  users: UserStats;
  organizations: OrgStats;
}

export interface AdminReport {
  overview: {
    totalUsers: number;
    totalOrganizations: number;
  };
  users: UserStats;
  organizations: OrgStats;
}

export interface DashboardStats {
  total: number;
  active: number;
  suspended: number;
  engagement?: number;
  [key: string]: unknown;
}
