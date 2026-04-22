import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "@/utils/api";
import type { Plan } from "@/types/plan";
import type { Project, Task, Sprint, PaginatedResponse } from "@/types/project";
import type { Invoice } from "@/types/invoice";

export interface ManagerMember {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName?: string;
  role: string;
  status?: string;
  orgId?: string;
}

export interface ManagerInvitation {
  id: string;
  _id?: string;
  email?: string;
  status?: string;
  role?: string;
  assignedRole?: string;
  createdAt?: string;
}

const extractList = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const maybeObject = response as { data?: unknown; [key: string]: unknown };
  if (Array.isArray(maybeObject?.data)) return maybeObject.data as T[];
  const nested = maybeObject?.data as { data?: unknown } | undefined;
  if (Array.isArray(nested?.data)) return nested.data as T[];
  return [];
};

import { ManagerAnalyticsData } from "@/types/analytics";

export const managerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getManagerPlans: builder.query<Plan[], void>({
      query: () => ({
        url: API_ROUTES.MANAGER.PLANS,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<Plan>(response),
    }),
    getManagerOrganization: builder.query<
      {
        name: string;
        id: string;
        planId?: string;
        subscriptionStatus?: string;
      },
      void
    >({
      query: () => ({
        url: API_ROUTES.MANAGER.ORGANIZATION,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: {
        success: boolean;
        data: {
          name: string;
          id: string;
          planId?: string;
          subscriptionStatus?: string;
        };
      }) => {
        return response.data || response;
      },
      providesTags: ["ManagerOrganization"],
    }),
    getManagerMembers: builder.query<
      PaginatedResponse<ManagerMember>,
      {
        page: number;
        limit: number;
        search?: string;
        role?: string;
        status?: string;
      }
    >({
      query: ({ page, limit, search, role, status }) => ({
        url: API_ROUTES.MANAGER.MEMBERS,
        method: "GET",
        params: {
          page,
          limit,
          search: search || "",
          role: role || "ALL",
          status: status || "ALL",
        },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: {
        data: PaginatedResponse<ManagerMember>;
      }) => response.data,
      providesTags: [{ type: "ManagerMembers", id: "LIST" }],
    }),
    updateManagerMemberStatus: builder.mutation<
      void,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `${API_ROUTES.MANAGER.MEMBERS}/${id}/status`,
        method: "PUT",
        data: { status },
      }),
      invalidatesTags: [
        { type: "ManagerMembers", id: "LIST" },
        { type: "ManagerMembers", id: "STATS" },
      ],
    }),
    deleteManagerMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.MANAGER.MEMBERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "ManagerMembers", id: "LIST" },
        { type: "ManagerMembers", id: "STATS" },
      ],
    }),
    sendInvite: builder.mutation<
      void,
      { email: string; role: string; orgId: string; expiresIn: number }
    >({
      query: (data) => ({
        url: API_ROUTES.MANAGER.INVITE,
        method: "POST",
        data,
      }),
      invalidatesTags: [
        { type: "ManagerInvites", id: "LIST" },
        { type: "ManagerInvites", id: "STATS" },
      ],
    }),
    sendInvitations: builder.mutation<
      void,
      { emails: string[]; role?: string; expiresIn?: number }
    >({
      query: (data) => ({
        url: API_ROUTES.MANAGER.BULK_INVITE,
        method: "POST",
        data,
      }),
      invalidatesTags: [
        { type: "ManagerInvites", id: "LIST" },
        { type: "ManagerInvites", id: "STATS" },
      ],
    }),
    getManagerInvitations: builder.query<
      PaginatedResponse<ManagerInvitation>,
      { page: number; limit: number; search?: string; status?: string }
    >({
      query: ({ page, limit, search, status }) => ({
        url: API_ROUTES.MANAGER.INVITATIONS,
        method: "GET",
        params: {
          page,
          limit,
          search: search || "",
          status: status || "ALL",
        },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: {
        data: PaginatedResponse<ManagerInvitation>;
      }) => response.data,
      providesTags: [{ type: "ManagerInvites", id: "LIST" }],
    }),
    cancelManagerInvitation: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.MANAGER.INVITATIONS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "ManagerInvites", id: "LIST" },
        { type: "ManagerInvites", id: "STATS" },
      ],
    }),
    getManagerProjects: builder.query<
      PaginatedResponse<Project>,
      {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        priority?: string;
      }
    >({
      query: ({ page, limit, search, status, priority }) => ({
        url: API_ROUTES.PROJECTS.ROOT,
        method: "GET",
        params: {
          page,
          limit,
          search: search || "",
          status: status || "ALL",
          priority: priority || "ALL",
        },
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: PaginatedResponse<Project> }) =>
        response.data,
      providesTags: [{ type: "ManagerProjects", id: "LIST" }],
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (data) => ({
        url: API_ROUTES.PROJECTS.ROOT,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: Project }) => response.data,
      invalidatesTags: [
        { type: "ManagerProjects", id: "LIST" },
        { type: "ManagerProjects", id: "STATS" },
        "ManagerAnalytics",
      ],
    }),
    deleteManagerProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.PROJECTS.ROOT}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "ManagerProjects", id: "LIST" },
        { type: "ManagerProjects", id: "STATS" },
        "ManagerAnalytics",
      ],
    }),
    updateManagerProject: builder.mutation<
      Project,
      { id: string; data: Partial<Project> }
    >({
      query: ({ id, data }) => ({
        url: `${API_ROUTES.PROJECTS.ROOT}/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: { data: Project }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: "ManagerProjects", id: "LIST" },
        { type: "ManagerProjects", id: "STATS" },
        { type: "MemberProjects", id: id },
        { type: "ProjectMembers", id: id },
        "ManagerAnalytics",
      ],
    }),
    getManagerInvoices: builder.query<
      { items: Invoice[]; total: number; totalPages: number },
      { page: number; limit: number }
    >({
      query: ({ page, limit }) => ({
        url: API_ROUTES.MANAGER.INVOICES,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response: {
        data: { items: Invoice[]; total: number; totalPages: number };
      }) => response.data,
      providesTags: ["ManagerInvoices"],
    }),
    getManagerMemberStats: builder.query<
      {
        total: number;
        active: number;
        inactive: number;
      },
      void
    >({
      query: () => ({
        url: API_ROUTES.MANAGER.MEMBERS_STATS,
        method: "GET",
      }),
      transformResponse: (response: {
        data: { total: number; active: number; inactive: number };
      }) => response.data,
      providesTags: [{ type: "ManagerMembers", id: "STATS" }],
    }),
    getManagerInvitationStats: builder.query<
      {
        total: number;
        pending: number;
        accepted: number;
        expired: number;
        cancelled: number;
      },
      void
    >({
      query: () => ({
        url: API_ROUTES.MANAGER.INVITATIONS_STATS,
        method: "GET",
      }),
      transformResponse: (response: {
        data: {
          total: number;
          pending: number;
          accepted: number;
          expired: number;
          cancelled: number;
        };
      }) => response.data,
      providesTags: [{ type: "ManagerInvites", id: "STATS" }],
    }),
    getManagerDashboardStats: builder.query<
      {
        members: { total: number; active: number; inactive: number };
        invites: {
          total: number;
          pending: number;
          accepted: number;
          expired: number;
          cancelled: number;
        };
        projects: {
          total: number;
          active: number;
          onHold: number;
          completed: number;
        };
      },
      void
    >({
      query: () => ({
        url: API_ROUTES.MANAGER.DASHBOARD_STATS,
        method: "GET",
      }),
      transformResponse: (response: {
        data: {
          members: { total: number; active: number; inactive: number };
          invites: {
            total: number;
            pending: number;
            accepted: number;
            expired: number;
            cancelled: number;
          };
          projects: {
            total: number;
            active: number;
            onHold: number;
            completed: number;
          };
        };
      }) => response.data,
      providesTags: [
        { type: "ManagerMembers", id: "STATS" },
        { type: "ManagerInvites", id: "STATS" },
        { type: "ManagerProjects", id: "STATS" },
      ],
    }),
    getManagerAnalytics: builder.query<ManagerAnalyticsData, string | void>({
      query: (timeframe = "YEAR") => ({
        url: API_ROUTES.MANAGER.ANALYTICS,
        method: "GET",
        params: { filter: timeframe },
      }),
      transformResponse: (response: { data: ManagerAnalyticsData }) =>
        response.data,
      providesTags: ["ManagerAnalytics"],
    }),
  }),
});

export const {
  useGetManagerPlansQuery,
  useGetManagerOrganizationQuery,
  useGetManagerMembersQuery,
  useUpdateManagerMemberStatusMutation,
  useDeleteManagerMemberMutation,
  useSendInviteMutation,
  useSendInvitationsMutation,
  useGetManagerInvitationsQuery,
  useCancelManagerInvitationMutation,
  useGetManagerProjectsQuery,
  useCreateProjectMutation,
  useDeleteManagerProjectMutation,
  useUpdateManagerProjectMutation,
  useGetManagerInvoicesQuery,
  useGetManagerMemberStatsQuery,
  useGetManagerInvitationStatsQuery,
  useGetManagerDashboardStatsQuery,
  useGetManagerAnalyticsQuery,
} = managerApiSlice;
