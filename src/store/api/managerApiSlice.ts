import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "@/utils/api";
import type { Plan } from "@/types/plan";
import type { Project, Task, Sprint } from "@/types/project";
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
    getManagerMembers: builder.query<ManagerMember[], void>({
      query: () => ({
        url: API_ROUTES.MANAGER.MEMBERS,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) =>
        extractList<ManagerMember>(response),
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
      invalidatesTags: [{ type: "ManagerMembers", id: "LIST" }],
    }),
    deleteManagerMember: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.MANAGER.MEMBERS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ManagerMembers", id: "LIST" }],
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
      invalidatesTags: [{ type: "ManagerInvites", id: "LIST" }],
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
      invalidatesTags: [{ type: "ManagerInvites", id: "LIST" }],
    }),
    getManagerInvitations: builder.query<ManagerInvitation[], void>({
      query: () => ({
        url: API_ROUTES.MANAGER.INVITATIONS,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) =>
        extractList<ManagerInvitation>(response),
      providesTags: [{ type: "ManagerInvites", id: "LIST" }],
    }),
    cancelManagerInvitation: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.MANAGER.INVITATIONS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ManagerInvites", id: "LIST" }],
    }),
    getManagerProjects: builder.query<Project[], void>({
      query: () => ({
        url: API_ROUTES.PROJECTS.ROOT,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<Project>(response),
      providesTags: [{ type: "ManagerProjects", id: "LIST" }],
    }),
    createProject: builder.mutation<Project, Partial<Project>>({
      query: (data) => ({
        url: API_ROUTES.PROJECTS.ROOT,
        method: "POST",
        data,
      }),
      transformResponse: (response: { data: Project }) => response.data,
      invalidatesTags: [{ type: "ManagerProjects", id: "LIST" }],
    }),
    deleteManagerProject: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.PROJECTS.ROOT}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ManagerProjects", id: "LIST" }],
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
      invalidatesTags: [{ type: "ManagerProjects", id: "LIST" }],
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
} = managerApiSlice;
