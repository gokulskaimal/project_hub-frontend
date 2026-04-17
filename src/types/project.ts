export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED" | "PLANNING" | "ON_HOLD";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  startDate: string;
  endDate: string;
  teamMemberIds?: string[];
  members?: Array<{ firstName?: string; lastName?: string; email?: string }>;
  progress?: number;
  budget?: number;
  tags?: string[];
  tasksPerWeek?: number;
  key?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  orgId?: string;
  taskKey?: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE" | "BACKLOG";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type?: "STORY" | "BUG" | "TASK" | "EPIC";
  epicId?: string;
  assignedTo?: string;
  assignedUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  dueDate?: string;
  completedAt?: string;
  storyPoints?: number;
  sprintId?: string;
  parentTaskId?: string;
  dependencies?: TaskDependency[];
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    type?: string;
  }>;
  comments?: Array<{
    id: string;
    userId: string;
    text: string;
    createdAt: string;
  }>;
  subtasks?: Task[];
  timeLogs?: TimeLog[];
  totalTimeSpent?: number;
  updatedAt?: string;
  project?: {
    name: string;
  };
}

export interface TaskDependency {
  taskId: string;
  type: "BLOCKS" | "IS_BLOCKED_BY" | "RELATES_TO";
}

export interface TaskComment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface TimeLog {
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface AdminOrg {
  id: string;
  name: string;
  email?: string;
  status?: string;
  createdAt?: string;
  currentUserCount?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  orgId?: string;
  organizationName?: string;
}

export interface VelocityResponse {
  totalPoints: number;
  days: number;
  start: string;
  end: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "PLANNING";
  goal?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSprintPayload {
  projectId: string;
  name: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  goal?: string;
}

export interface UpdateSprintPayload {
  name?: string;
  description?: string;
  status?: Sprint["status"];
  startDate?: string | Date;
  endDate?: string | Date;
  goal?: string;
}

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description?: string;
  priority: Task["priority"];
  type: "STORY" | "BUG" | "TASK" | "EPIC";
  epicId?: string;
  parentTaskId?: string;
  dueDate?: string | Date;
  assignedTo?: string;
  storyPoints?: number;
  dependencies?: TaskDependency[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  type?: Task["type"];
  epicId?: string;
  dueDate?: string | Date;
  assignedTo?: string;
  storyPoints?: number;
  parentTaskId?: string;
  dependencies?: TaskDependency[];
  sprintId?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action:
    | "CREATED"
    | "STATUS_CHANGED"
    | "ASSIGNEE_CHANGED"
    | "SPRINT_CHANGED"
    | "UPDATED"
    | "DELETED";
  details?: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
  timestamp?: string;
}

export interface EpicAnalytics {
  id: string;
  title: string;
  description?: string;
  progress: number;
  totalStories: number;
  completedStories: number;
  status?: string;
}
