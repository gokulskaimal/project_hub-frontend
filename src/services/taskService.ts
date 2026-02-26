import api from "@/utils/api";

export interface TimeLog {
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export interface TaskComment {
  id?: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  project?: { name: string };
  orgId: string;
  taskKey?: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "REVIEW" | "DONE" | "BACKLOG";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  type: "STORY" | "BUG" | "TASK";
  storyPoints: number;
  sprintId?: string;
  dueDate?: string;
  assignedTo?: string;
  assignedToUser?: { firstName: string; lastName: string; email: string };
  createdAt?: string;
  updatedAt?: string;
  timeLogs?: TimeLog[];
  totalTimeSpent?: number;
  attachments?: string[];
  comments?: TaskComment[];
}

export interface CreateTaskData {
  projectId: string;
  title: string;
  description: string;
  priority?: string;
  type: "STORY" | "BUG" | "TASK";
  storyPoints: number;
  sprintId?: string;
  dueDate?: string;
  assignedTo?: string;
}

export const taskService = {
  getProjetTasks: async (projectId: string): Promise<Task[]> => {
    const response = await api.get(`/projects/${projectId}/tasks`);
    return response.data.data;
  },
  getMyTasks: async (): Promise<Task[]> => {
    const response = await api.get("projects/tasks/my-tasks");
    return response.data.data;
  },
  createTask: async (projectId: string, data: CreateTaskData) => {
    const response = await api.post(`/projects/${projectId}/tasks`, {
      ...data,
      projectId,
    });
    return response.data;
  },
  updateTask: async (taskId: string, data: Partial<Task>) => {
    const response = await api.put(`projects/tasks/${taskId}`, data);
    return response.data.data;
  },
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`projects/tasks/${taskId}`);
    return response.data;
  },
  toggleTimer: async (taskId: string, action: "start" | "stop") => {
    const response = await api.post(`/projects/tasks/${taskId}/timer`, {
      action,
    });
    return response.data;
  },
  addComment: async (taskId: string, text: string) => {
    const response = await api.post(`/projects/tasks/${taskId}/comments`, {
      text,
    });
    return response.data.data;
  },
  addAttachment: async (taskId: string, url: string) => {
    const response = await api.post(`/projects/tasks/${taskId}/attachments`, {
      url,
    });
    return response.data.data;
  },
};
