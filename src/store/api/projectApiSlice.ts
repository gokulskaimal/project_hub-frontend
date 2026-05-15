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
import type {
  Meeting,
  CreateMeetingPayload,
  UpdateMeetingPayload,
} from "@/types/meeting";

const extractList = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const maybeObject = response as {
    data?: unknown;
    [key: string]: unknown;
  };

  // Handle nested data property
  const data = maybeObject?.data;
  if (Array.isArray(data)) return data as T[];

  // Handle paginated response structure (data.items)
  if (
    data &&
    typeof data === "object" &&
    "items" in data &&
    Array.isArray((data as { items: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }

  // Handle double nested data property (common in some axios setups)
  const nestedData = data as { data?: unknown } | undefined;
  if (Array.isArray(nestedData?.data)) return nestedData?.data as T[];

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
      providesTags: (_result, _error, taskId) => [
        { type: "MemberTasks", id: taskId },
      ],
    }),
    getProjectTasks: builder.query<
      PaginatedResponse<Task> | Task[],
      {
        projectId: string;
        epicId?: string;
        parentTaskId?: string;
        page?: number;
        limit?: number;
        isInBacklog?: boolean;
        type?: string;
      }
    >({
      query: ({
        projectId,
        epicId,
        parentTaskId,
        page,
        limit,
        isInBacklog,
        type,
      }) => ({
        url: `${API_ROUTES.PROJECTS.TASKS_BY_PROJECT(projectId)}`,
        method: "GET",
        params: { epicId, parentTaskId, page, limit, isInBacklog, type },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => {
        const maybeObject = response as {
          data?: PaginatedResponse<Task> | Task[];
        };
        if (maybeObject?.data && "items" in (maybeObject.data as object)) {
          return maybeObject.data as PaginatedResponse<Task>;
        }
        return extractList<Task>(response);
      },
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
      providesTags: ["EpicAnalytics"],
    }),
    getProjectSprints: builder.query<Sprint[], string>({
      query: (projectId) => ({
        url: API_ROUTES.PROJECTS.SPRINTS_BY_PROJECT(projectId),
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<Sprint>(response),
      providesTags: (_result, _error, projectId) => [
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
      invalidatesTags: (_result, _error, { projectId: _projectId }) => [
        { type: "ProjectSprints", id: _projectId },
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
      invalidatesTags: (_result, _error, { projectId: _projectId }) => [
        { type: "ProjectSprints", id: _projectId },
        "ManagerAnalytics",
      ],
    }),
    deleteSprint: builder.mutation<void, { id: string; projectId: string }>({
      query: ({ id }) => ({
        url: API_ROUTES.PROJECTS.SPRINT_DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId: _projectId }) => [
        { type: "ProjectSprints", id: _projectId },
        "ManagerAnalytics",
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
      invalidatesTags: (_result, _error, { projectId: _projectId }) => [
        { type: "MemberTasks", id: "LIST" },
        { type: "UserVelocity", id: "ME" },
        "MemberAnalytics",
        "ManagerAnalytics",
        "EpicAnalytics",
        "ProjectVelocity",
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
      async onQueryStarted(
        { id, data, projectId },
        { dispatch, queryFulfilled, getState },
      ) {
        // Scan ALL cached getProjectTasks queries matching this projectId
        // This handles all query variants (different page, limit, epicId params)
        const state = getState() as {
          api: { queries: Record<string, unknown> };
        };
        const patches: { undo: () => void }[] = [];

        Object.entries(state.api.queries).forEach(([key, entry]) => {
          if (!key.startsWith("getProjectTasks(")) return;
          const originalArgs = (
            entry as {
              originalArgs?: Parameters<
                typeof projectApiSlice.endpoints.getProjectTasks.initiate
              >[0];
            }
          )?.originalArgs;
          if (!originalArgs || originalArgs.projectId !== projectId) return;

          const patch = dispatch(
            projectApiSlice.util.updateQueryData(
              "getProjectTasks",
              originalArgs,
              (draft) => {
                const draftData = draft as { items?: Task[] } | Task[];
                const items = Array.isArray(draftData)
                  ? draftData
                  : draftData.items;
                if (items && Array.isArray(items)) {
                  const taskIndex = items.findIndex((t: Task) => t.id === id);
                  if (taskIndex !== -1) {
                    // If this query is specifically for the backlog, and the task is being assigned to a sprint,
                    // we must remove it from the backlog list instead of just updating it.
                    if (originalArgs.isInBacklog === true && data.sprintId) {
                      items.splice(taskIndex, 1);
                    } else {
                      Object.assign(items[taskIndex], data);
                    }
                  }
                }
              },
            ),
          );
          patches.push(patch);
        });

        try {
          await queryFulfilled;
          // Optimistic patch is already applied — no refetch needed
        } catch {
          // Undo all patches if the server request fails
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: "MemberTasks", id: "LIST" },
        { type: "MemberTasks", id },
        { type: "UserVelocity", id: "ME" },
        "MemberAnalytics",
        "ManagerAnalytics",
        "EpicAnalytics",
        "ProjectVelocity",
      ],
    }),
    deleteTask: builder.mutation<void, { id: string; projectId: string }>({
      query: ({ id }) => ({
        url: API_ROUTES.PROJECTS.TASK_DELETE(id),
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { projectId: _projectId }) => [
        { type: "MemberTasks", id: "LIST" },
        { type: "UserVelocity", id: "ME" },
        "MemberAnalytics",
        "ManagerAnalytics",
        "EpicAnalytics",
        "ProjectVelocity",
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
      providesTags: ["ProjectVelocity"],
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
      invalidatesTags: (_result, _error, { projectId: _projectId }) => [
        { type: "MemberTasks", id: "LIST" },
        { type: "UserVelocity", id: "ME" },
        "MemberAnalytics",
        "ManagerAnalytics",
        "EpicAnalytics",
        "ProjectVelocity",
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
      providesTags: ["TaskHistory"],
    }),
    addComment: builder.mutation<Task, { taskId: string; text: string }>({
      query: ({ taskId, text }) => ({
        url: API_ROUTES.PROJECTS.TASK_COMMENTS(taskId),
        method: "POST",
        data: { text },
      }),
      transformResponse: (response: { data: Task }) => response.data,
      invalidatesTags: (_result, _error, { taskId }) => [
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
      providesTags: (_result, _error, projectId) => [
        { type: "ProjectMembers", id: projectId },
      ],
    }),
    getSprintMeetings: builder.query({
      query: (sprintId) => ({
        url: API_ROUTES.MEETINGS.SPRINT_MEETINGS(sprintId),
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: Meeting[] }) => response.data || [],
      providesTags: ["Meetings"],
    }),
    createMeeting: builder.mutation<Meeting, CreateMeetingPayload>({
      query: (data) => ({
        url: API_ROUTES.MEETINGS.CREATE_MEETING,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: Meeting }) => response.data,
      invalidatesTags: ["Meetings"],
    }),
    getMyMeetings: builder.query<
      {
        items: Meeting[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      },
      { page?: number; limit?: number; status: "SCHEDULED" | "HISTORY" }
    >({
      query: (params) => ({
        url: API_ROUTES.MEETINGS.MY_MEETINGS,
        method: "GET",
        params,
        skipGlobalLoader: true,
      }),
      transformResponse: (response: {
        data: {
          items: Meeting[];
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }) => response.data,
      providesTags: ["Meetings"],
    }),
    completeMeeting: builder.mutation<Meeting, string>({
      query: (roomId) => ({
        url: API_ROUTES.MEETINGS.MEETINGS_COMPLETE(roomId),
        method: "PATCH",
      }),
      transformResponse: (response: { data: Meeting }) => response.data,
      invalidatesTags: ["Meetings"],
    }),
    updateMeeting: builder.mutation<
      Meeting,
      { roomId: string } & UpdateMeetingPayload
    >({
      query: ({ roomId, ...data }) => ({
        url: API_ROUTES.MEETINGS.MEETINGS_UPDATE(roomId),
        method: "PUT",
        data,
      }),
      transformResponse: (response: { data: Meeting }) => response.data,
      invalidatesTags: ["Meetings"],
    }),
    deleteMeeting: builder.mutation<void, string>({
      query: (roomId) => ({
        url: API_ROUTES.MEETINGS.MEETINGS_DELETE(roomId),
        method: "DELETE",
      }),
      transformResponse: (response: { data: void }) => response.data,
      invalidatesTags: ["Meetings"],
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
  useGetSprintMeetingsQuery,
  useCreateMeetingMutation,
  useGetMyMeetingsQuery,
  useCompleteMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
} = projectApiSlice;
