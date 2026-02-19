export const PRIORITY_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;

export const PROJECT_STATUS = {
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;

export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  IN_REVIEW: "IN_REVIEW",
  REVIEW: "REVIEW",
  DONE: "DONE",
  BACKLOG: "BACKLOG",
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORG_MANAGER: "ORG_MANAGER",
  TEAM_MEMBER: "TEAM_MEMBER",
} as const;

export type PriorityLevel = keyof typeof PRIORITY_LEVELS;
export type ProjectStatus = keyof typeof PROJECT_STATUS;
export type TaskStatus = keyof typeof TASK_STATUS;
export type UserRole = keyof typeof USER_ROLES;
