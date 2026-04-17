import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "@/utils/api";
import type {
  Project,
  Task,
  Sprint,
  CreateSprintPayload,
  UpdateSprintPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  VelocityResponse,
  TaskHistory,
  PaginatedResponse,
  EpicAnalytics,
} from "@/types/project";
import type { User } from "@/types/auth";

const extractList = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const maybeObject = response as { data?: unknown; [key: string]: unknown };
  if (Array.isArray(maybeObject?.data)) return maybeObject.data as T[];
  const nested = maybeObject?.data as { data?: unknown } | undefined;
  if (Array.isArray(nested?.data)) return nested.data as T[];
  return [];
};

export const projectApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyProjects: builder.query<
      PaginatedResponse<Project>,
      { page?: number; limit?: number } | void
    >({
      query: (args) => ({
        url: API_ROUTES.PROJECTS.MY_PROJECTS,
        method: "GET",
        params: { page: args?.page || 1, limit: args?.limit || 1000 },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: PaginatedResponse<Project> }) =>
        response.data,
      providesTags: [{ type: "MemberProjects", id: "LIST" }],
    }),
    getMyTasks: builder.query<
      PaginatedResponse<Task>,
      { page?: number; limit?: number } | void
    >({
      query: (args) => ({
        url: API_ROUTES.PROJECTS.MY_TASKS,
        method: "GET",
        params: { page: args?.page || 1, limit: args?.limit || 1000 },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: PaginatedResponse<Task> }) =>
        response.data,
      providesTags: [{ type: "MemberTasks", id: "LIST" }],
    }),
    getMyVelocity: builder.query<VelocityResponse, number | void>({
      query: (days = 7) => ({
        url: API_ROUTES.USER.VELOCITY,
        method: "GET",
        params: { days },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => {
        if (!response || typeof response !== "object") {
          return { totalPoints: 0, days: 7, start: "", end: "" };
        }
        const data = (response as { data?: VelocityResponse }).data;
        return data || { totalPoints: 0, days: 7, start: "", end: "" };
      },
      providesTags: [{ type: "UserVelocity", id: "ME" }],
    }),
    getProjectById: builder.query<Project, string>({
      query: (projectId) => ({
        url: `${API_ROUTES.PROJECTS.BY_ID(projectId)}`,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return response[0] as Project;
        const maybeObject = response as { data?: Project };
        return maybeObject?.data || (response as Project);
      },
      providesTags: (_, __, projectId) => [
        { type: "MemberProjects", id: projectId },
      ],
    }),
    getTaskById: builder.query<Task, string>({
      query: (taskId) => ({
        url: API_ROUTES.PROJECTS.TASK_UPDATE(taskId),
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: Task }) => response.data,
      providesTags: (result, error, taskId) => [
        { type: "MemberTasks", id: taskId },
      ],
    }),
    getProjectTasks: builder.query<
      Task[],
      { projectId: string; epicId?: string; parentTaskId?: string }
    >({
      query: ({ projectId, epicId, parentTaskId }) => ({
        url: `${API_ROUTES.PROJECTS.TASKS_BY_PROJECT(projectId)}`,
        method: "GET",
        params: { epicId, parentTaskId },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<Task>(response),
      providesTags: [{ type: "MemberTasks", id: "LIST" }],
    }),
    getEpicAnalytics: builder.query<EpicAnalytics[], string>({
      query: (projectId) => ({
        url: API_ROUTES.PROJECTS.EPIC_ANALYTICS(projectId),
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: EpicAnalytics[] }) =>
        response.data || [],
    }),
    getProjectSprints: builder.query<Sprint[], string>({
      query: (projectId) => ({
        url: API_ROUTES.PROJECTS.SPRINTS_BY_PROJECT(projectId),
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<Sprint>(response),
      providesTags: (result, error, projectId) => [
        { type: "ProjectSprints", id: projectId },
      ],
    }),
    createSprint: builder.mutation<Sprint, CreateSprintPayload>({
      query: (data) => ({
        url: API_ROUTES.PROJECTS.SPRINT_CREATE,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: Sprint }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectSprints", id: projectId },
      ],
    }),
    updateSprint: builder.mutation<
      Sprint,
      { id: string; data: UpdateSprintPayload; projectId: string }
    >({
      query: ({ id, data }) => ({
        url: API_ROUTES.PROJECTS.SPRINT_UPDATE(id),
        method: "PUT",
        data,
      }),
      transformResponse: (response: { data: Sprint }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectSprints", id: projectId },
      ],
    }),
    deleteSprint: builder.mutation<void, { id: string; projectId: string }>({
      query: ({ id }) => ({
        url: API_ROUTES.PROJECTS.SPRINT_DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectSprints", id: projectId },
      ],
    }),
    createTask: builder.mutation<
      Task,
      { projectId: string; data: CreateTaskPayload }
    >({
      query: ({ projectId, data }) => ({
        url: API_ROUTES.PROJECTS.TASKS_BY_PROJECT(projectId),
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: Task }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [
        { type: "MemberTasks", id: "LIST" },
      ],
    }),
    updateTask: builder.mutation<
      Task,
      { id: string; data: UpdateTaskPayload; projectId: string }
    >({
      query: ({ id, data }) => ({
        url: API_ROUTES.PROJECTS.TASK_UPDATE(id),
        method: "PUT",
        data,
      }),
      transformResponse: (response: { data: Task }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [
        { type: "MemberTasks", id: "LIST" },
      ],
    }),
    deleteTask: builder.mutation<void, { id: string; projectId: string }>({
      query: ({ id }) => ({
        url: API_ROUTES.PROJECTS.TASK_DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "MemberTasks", id: "LIST" },
      ],
    }),
    getProjectVelocity: builder.query<
      VelocityResponse,
      { projectId: string; days?: number }
    >({
      query: ({ projectId, days = 7 }) => ({
        url: API_ROUTES.PROJECTS.VELOCITY(projectId),
        method: "GET",
        params: { days },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => {
        const payload = (response as { data?: VelocityResponse })?.data;
        return payload || { totalPoints: 0, days: 7, start: "", end: "" };
      },
    }),
    toggleTaskTimer: builder.mutation<
      Task,
      { id: string; action: "start" | "stop"; projectId: string }
    >({
      query: ({ id, action }) => ({
        url: API_ROUTES.PROJECTS.TASK_TIMER(id),
        method: "POST",
        data: { action },
      }),
      transformResponse: (response: { data: Task }) => response.data,
      invalidatesTags: (result, error, { projectId }) => [
        { type: "MemberTasks", id: "LIST" },
      ],
    }),
    getTaskHistory: builder.query<TaskHistory[], string>({
      query: (taskId) => ({
        url: API_ROUTES.PROJECTS.TASK_HISTORY(taskId),
        method: "GET",
      }),
      transformResponse: (response: {
        success: boolean;
        data: TaskHistory[];
      }) => response.data || [],
    }),
    addComment: builder.mutation<Task, { taskId: string; text: string }>({
      query: ({ taskId, text }) => ({
        url: API_ROUTES.PROJECTS.TASK_COMMENTS(taskId),
        method: "POST",
        data: { text },
      }),
      transformResponse: (response: { data: Task }) => response.data,
      invalidatesTags: (result, error, { taskId }) => [
        { type: "MemberTasks", id: taskId },
        { type: "MemberTasks", id: "LIST" },
      ],
    }),
    addAttachment: builder.mutation<
      Task,
      {
        taskId: string;
        url: string;
        name?: string;
        size?: number;
        type?: string;
      }
    >({
      query: ({ taskId, ...data }) => ({
        url: API_ROUTES.PROJECTS.TASK_ATTACHMENTS(taskId),
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: Task }) => response.data,
      invalidatesTags: (result, error, { taskId }) => [
        { type: "MemberTasks", id: taskId },
        { type: "MemberTasks", id: "LIST" },
      ],
    }),
    getOrganizationUsers: builder.query<
      User[],
      { page?: number; limit?: number } | void
    >({
      query: (args) => ({
        url: API_ROUTES.MANAGER.MEMBERS,
        method: "GET",
        params: { page: args?.page || 1, limit: args?.limit || 1000 },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<User>(response),
      providesTags: [{ type: "ManagerMembers", id: "LIST" }],
    }),
    getProjectMembers: builder.query<User[], string>({
      query: (projectId) => ({
        url: API_ROUTES.PROJECTS.MEMBERS(projectId),
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<User>(response),
      providesTags: (result, error, projectId) => [
        { type: "ProjectMembers", id: projectId },
      ],
    }),
  }),
});

export const {
  useGetMyProjectsQuery,
  useGetMyTasksQuery,
  useGetMyVelocityQuery,
  useGetTaskByIdQuery,
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
  useGetEpicAnalyticsQuery,
  useGetProjectSprintsQuery,
  useCreateSprintMutation,
  useUpdateSprintMutation,
  useDeleteSprintMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectVelocityQuery,
  useToggleTaskTimerMutation,
  useGetTaskHistoryQuery,
  useAddCommentMutation,
  useAddAttachmentMutation,
  useGetOrganizationUsersQuery,
  useGetProjectMembersQuery,
} = projectApiSlice;
