import { useState, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { API_ROUTES } from "@/utils/api";
import { getFriendlyError } from "@/utils/errors";
import { confirmWithAlert } from "@/utils/confirm";
import api from "@/utils/api";
export type Org = {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  currentUserCount?: number;
};
export type User = {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  orgId?: string;
};

export function useAdminData(token: string | null) {
  // NOTE: We rely on the `api` interceptor to attach the token,
  // so passing `token` here is primarily for the `useEffect` dependency.

  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Helper to safely extract arrays from API response
  const normalize = <T>(data: unknown, key?: string): T[] => {
    if (!data || typeof data !== "object") return [];

    const dataObj = data as Record<string, unknown>;
    // Backend API routes often return { success: true, data: [...] }
    const d = dataObj.data || dataObj;

    if (Array.isArray(d)) return d as T[];

    // Handle paginated response { data: { organizations: [...], total: ... } }
    if (key && d && typeof d === "object" && !Array.isArray(d)) {
      const dObj = d as Record<string, unknown>;
      if (Array.isArray(dObj[key])) {
        return dObj[key] as T[];
      }
    }
    return [];
  };

  const fetchData = useCallback(async () => {
    // Client-side guard (middleware handles server-side)
    if (!token) return;

    try {
      setLoading(true);

      const [orgRes, userRes] = await Promise.all([
        api.get(API_ROUTES.ADMIN.ORGS),
        api.get(API_ROUTES.ADMIN.USERS),
      ]);

      setOrgs(normalize<Org>(orgRes.data, "organizations"));
      setUsers(normalize<User>(userRes.data, "users"));
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to load admin data"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteOrg = async (id: string) => {
    if (
      !(await confirmWithAlert(
        "Are you sure you want to delete this organization and all its users?",
        "Yes, Delete",
      ))
    )
      return;
    try {
      // DELETE /api/admin/orgs/:id
      await api.delete(`${API_ROUTES.ADMIN.ORGS}/${id}`);
      toast.success("Organization deleted successfully.");
      fetchData();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to delete organization"));
    }
  };

  const deleteUser = async (id: string) => {
    if (
      !(await confirmWithAlert(
        "Are you sure you want to delete this user?",
        "Yes, Delete",
      ))
    )
      return;
    try {
      // DELETE /api/admin/users/:id
      await api.delete(`${API_ROUTES.ADMIN.USERS}/${id}`);
      toast.success("User deleted successfully.");
      fetchData();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to delete user"));
    }
  };

  const updateOrgStatus = async (id: string, status: string) => {
    try {
      await api.put(`${API_ROUTES.ADMIN.ORGS}/${id}`, { status });
      toast.success(`Organization ${status.toLowerCase()} successfully.`);
      fetchData();
    } catch (err) {
      toast.error(
        getFriendlyError(err, "Failed to update organization status"),
      );
    }
  };

  const updateUserStatus = async (id: string, status: string) => {
    try {
      await api.put(`${API_ROUTES.ADMIN.USERS}/${id}/status`, { status });
      toast.success(`User ${status.toLowerCase()} successfully.`);
      fetchData();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to update user status"));
    }
  };

  return {
    data: { orgs, users, loading },
    actions: {
      fetchData,
      deleteOrg,
      deleteUser,
      updateOrgStatus,
      updateUserStatus,
    },
  };
}
