import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import api from "@/utils/api";

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
    "ManagerAnalytics",
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
    "Members",
    "Invitations",
    "Meetings",
  ],
  keepUnusedDataFor: 300,
  endpoints: () => ({}),
});
