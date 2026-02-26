import api from "@/utils/api";

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: string; // Date string from JSON
  endDate: string; // Date string from JSON
  status: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  goal?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSprintData {
  projectId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
}

export interface UpdateSprintData {
  name?: string;
  description?: string;
  status?: "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  goal?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export const sprintService = {
  getProjectSprints: async (projectId: string): Promise<Sprint[]> => {
    // Ensuring route matches backend implementation plan
    const response = await api.get(`/projects/${projectId}/sprints`);
    return response.data.data;
  },
  createSprint: async (data: CreateSprintData) => {
    const response = await api.post(`/projects/sprints`, data);
    return response.data;
  },
  updateSprint: async (sprintId: string, data: UpdateSprintData) => {
    const response = await api.put(`/projects/sprints/${sprintId}`, data);
    return response.data.data;
  },
  deleteSprint: async (sprintId: string) => {
    const response = await api.delete(`/projects/sprints/${sprintId}`);
    return response.data;
  },
};
