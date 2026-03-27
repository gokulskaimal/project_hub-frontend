import { apiSlice } from "./apiSlice";
import { API_ROUTES } from "@/utils/api";
import type { Plan } from "@/types/plan";
import type { AdminOrg, AdminUser, PaginatedResponse } from "@/types/project";
import type { Invoice } from "@/types/invoice";

const extractList = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const maybeObject = response as { data?: unknown; [key: string]: unknown };
  if (Array.isArray(maybeObject?.data)) return maybeObject.data as T[];
  const nested = maybeObject?.data as { data?: unknown } | undefined;
  if (Array.isArray(nested?.data)) return nested.data as T[];
  return [];
};

type PlanPayload = {
  name: string;
  description: string;
  price: number;
  currency: string;
  type: "STARTER" | "PRO" | "ENTERPRISE";
  features: string[];
  isActive: boolean;
  limits: {
    projects: number;
    members: number;
    storage?: number;
    messages?: number;
  };
};

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPlans: builder.query<Plan[], void>({
      query: () => ({
        url: API_ROUTES.ADMIN.PLANS,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: unknown) => extractList<Plan>(response),
      providesTags: [{ type: "AdminPlans", id: "LIST" }],
    }),
    createAdminPlan: builder.mutation<Plan, PlanPayload>({
      query: (payload) => ({
        url: API_ROUTES.ADMIN.PLANS,
        method: "POST",
        data: payload,
      }),
      transformResponse: (response: { data: Plan }) => response.data,
      invalidatesTags: [{ type: "AdminPlans", id: "LIST" }],
    }),
    updateAdminPlan: builder.mutation<Plan, { id: string; data: PlanPayload }>({
      query: ({ id, data }) => ({
        url: `${API_ROUTES.ADMIN.PLANS}/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: { data: Plan }) => response.data,
      invalidatesTags: [{ type: "AdminPlans", id: "LIST" }],
    }),
    deleteAdminPlan: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.ADMIN.PLANS}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AdminPlans", id: "LIST" }],
    }),
    getAdminOrgs: builder.query<
      PaginatedResponse<AdminOrg>,
      { page: number; limit: number; search?: string; status?: string }
    >({
      query: ({ page, limit, search, status }) => ({
        url: API_ROUTES.ADMIN.ORGANIZATIONS,
        method: "GET",
        params: {
          page,
          limit,
          search: search || "",
          ...(status && status !== "ALL" ? { status } : {}),
        },
        skipGlobalLoader: true,
      }),
      transformResponse: (
        response: unknown,
        _,
        args,
      ): PaginatedResponse<AdminOrg> => {
        const payload =
          (
            response as {
              data?: { organizations?: AdminOrg[]; total?: number };
            }
          )?.data ?? {};
        const items = payload.organizations ?? [];
        const total = payload.total ?? items.length;
        const totalPages = Math.max(1, Math.ceil(total / args.limit));
        return {
          items,
          total,
          page: args.page,
          limit: args.limit,
          totalPages,
        };
      },
      providesTags: [{ type: "AdminOrgs", id: "LIST" }],
    }),
    updateAdminOrgStatus: builder.mutation<
      void,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `${API_ROUTES.ADMIN.ORGANIZATIONS}/${id}`,
        method: "PUT",
        data: { status },
      }),
      transformResponse: (response: { data: void }) => response.data,
      invalidatesTags: [{ type: "AdminOrgs", id: "LIST" }, "AdminReports"],
    }),
    deleteAdminOrg: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.ADMIN.ORGANIZATIONS}/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: void }) => response.data,
      invalidatesTags: [{ type: "AdminOrgs", id: "LIST" }, "AdminReports"],
    }),
    getAdminUsers: builder.query<
      PaginatedResponse<AdminUser>,
      {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        role?: string;
      }
    >({
      query: ({ page, limit, search, status, role }) => ({
        url: API_ROUTES.ADMIN.USERS,
        method: "GET",
        params: {
          page,
          limit,
          search: search || "",
          ...(status && status !== "ALL" ? { status } : {}),
          ...(role && role !== "ALL" ? { role } : {}),
        },
        skipGlobalLoader: true,
      }),
      transformResponse: (
        response: unknown,
        _,
        args,
      ): PaginatedResponse<AdminUser> => {
        const payload =
          (response as { data?: { users?: AdminUser[]; total?: number } })
            ?.data ?? {};
        const items = payload.users ?? [];
        const total = payload.total ?? items.length;
        const totalPages = Math.max(1, Math.ceil(total / args.limit));
        return {
          items,
          total,
          page: args.page,
          limit: args.limit,
          totalPages,
        };
      },
      providesTags: [{ type: "AdminUsers", id: "LIST" }],
    }),
    updateAdminUserStatus: builder.mutation<
      void,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `${API_ROUTES.ADMIN.USERS}/${id}/status`,
        method: "PUT",
        data: { status },
      }),
      transformResponse: (response: { data: void }) => response.data,
      invalidatesTags: [{ type: "AdminUsers", id: "LIST" }, "AdminReports"],
    }),
    deleteAdminUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `${API_ROUTES.ADMIN.USERS}/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: { data: void }) => response.data,
      invalidatesTags: [{ type: "AdminUsers", id: "LIST" }, "AdminReports"],
    }),
    getAdminInvoices: builder.query<
      {
        items: Invoice[];
        total: number;
        totalPages: number;
        totalRevenue?: number;
      },
      {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        sort?: string;
        planType?: string;
      }
    >({
      query: ({ page, limit, search, status, sort, planType }) => ({
        url: API_ROUTES.ADMIN.INVOICES,
        method: "GET",
        params: {
          page,
          limit,
          search: search || "",
          ...(status && status !== "ALL" ? { status } : {}),
          ...(planType && planType !== "ALL" ? { planType } : {}),
          ...(sort && sort !== "latest" ? { sort } : {}),
        },
      }),
      transformResponse: (response: {
        data: {
          items: Invoice[];
          total: number;
          totalPages: number;
          totalRevenue?: number;
        };
      }) => response.data,
      providesTags: ["AdminInvoices"],
    }),
    getAdminReports: builder.query<any, void>({
      query: () => ({
        url: API_ROUTES.ADMIN.REPORTS,
        method: "GET",
        skipGlobalLoader: true,
      }),
      transformResponse: (response: { data: any }) => response.data,
      providesTags: ["AdminReports"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminPlansQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
  useGetAdminOrgsQuery,
  useUpdateAdminOrgStatusMutation,
  useDeleteAdminOrgMutation,
  useGetAdminUsersQuery,
  useUpdateAdminUserStatusMutation,
  useDeleteAdminUserMutation,
  useGetAdminInvoicesQuery,
  useGetAdminReportsQuery,
} = adminApiSlice;
