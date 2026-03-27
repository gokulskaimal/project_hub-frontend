import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import api, { API_ROUTES } from "@/utils/api";
import type { Plan } from "@/types/plan";
import type {
  AuthResponse,
  LoginPayload,
  GoogleSignInPayload,
  RegisterManagerPayload,
  RegisterManagerResponse,
  VerifyOtpPayload,
  CompleteSignupPayload,
  AcceptInvitePayload,
  User,
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
} from "@/types/auth";
import type { Notification } from "@/types/notification";
import type {
  Project,
  Task,
  Sprint,
  PaginatedResponse,
  CreateSprintPayload,
  UpdateSprintPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  AdminOrg,
  AdminUser,
  VelocityResponse,
  TaskHistory,
} from "@/types/project";
import type { Invoice } from "@/types/invoice";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
  skipGlobalLoader?: boolean;
};

const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    { status?: number; data?: unknown }
  > =>
  async ({ url, method = "GET", data, params, headers, skipGlobalLoader }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        params,
        headers,
        skipGlobalLoader,
      });
      return { data: result.data };
    } catch (error) {
      const err = error as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? err.message,
        },
      };
    }
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

// Local project payload for creation/updates if different from domain model
type ProjectPayload = Partial<Project>;

const extractList = <T>(response: unknown): T[] => {
  if (Array.isArray(response)) return response as T[];
  const maybeObject = response as { data?: unknown; [key: string]: unknown };
  if (Array.isArray(maybeObject?.data)) return maybeObject.data as T[];
  const nested = maybeObject?.data as { data?: unknown } | undefined;
  if (Array.isArray(nested?.data)) return nested.data as T[];
  return [];
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    "AdminPlans",
    "AdminOrgs",
    "AdminUsers",
    "ManagerMembers",
    "ManagerInvites",
    "ManagerProjects",
    "MemberProjects",
    "MemberTasks",
    "UserVelocity",
    "ProjectSprints",
    "ManagerOrganization",
    "UserProfile",
    "Notifications",
    "AdminInvoices",
    "ManagerInvoices",
    "AdminReports",
    "ProjectMembers",
  ],
  keepUnusedDataFor: 300,
  endpoints: () => ({}),
});
