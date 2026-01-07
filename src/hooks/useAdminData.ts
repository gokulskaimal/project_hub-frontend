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

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;  // users only
}

export function useAdminData(token: string | null) {
  // NOTE: We rely on the `api` interceptor to attach the token,
  // so passing `token` here is primarily for the `useEffect` dependency.

  const [loading, setLoading] = useState(false);

  const [orgsData, setOrgsData] = useState<PaginatedResponse<Org>>({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 });
  const [usersData, setUsersData] = useState<PaginatedResponse<User>>({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 });
  // Legacy fetchData removed in favor of fetchOrgs and fetchUsers
  // API call logic is now handled by the specific functions below



  const fetchOrgs = useCallback(async (params: FetchParams = {}) => {
    if (!token) return;
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: (params.page || 1).toString(),
        limit: (params.limit || 10).toString(),
        search: params.search || "",
        ...(params.status && params.status !== "ALL" ? { status: params.status } : {})
      })

      const res = await api.get(`${API_ROUTES.ADMIN.ORGS}?${query.toString()}`);
      const data = res.data.data
      setOrgsData({
        items: data.organizations || [],
        total: data.total || 0,
        page: params.page || 1,
        limit: params.limit || 10,
        totalPages: Math.ceil((data.total || 0) / (params.limit || 10))
      })
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to load orgs"))
    } finally {
      setLoading(false)
    }
  },[token]);

  const fetchUsers = useCallback(async(params : FetchParams = {}) =>{
    if(!token) return;
    try{
      setLoading(true);
      const query = new URLSearchParams({
        page : (params.page || 1).toString(),
        limit : (params.limit || 10).toString(),
        search : params.search || '',
        ...(params.status && params.status !== "ALL" ? {status : params.status} : {}),
        ...(params.role && params.role !== "ALL" ? {role : params.role} : {})
      })

      const res = await api.get(`${API_ROUTES.ADMIN.USERS}?${query.toString()}`)
      const data = res.data.data
      setUsersData({
        items : data.users || [],
        total : data.total || 0,
        page : params.page || 1,
        limit : params.limit || 10 ,
        totalPages : Math.ceil((data.total || 0 ) / (params.limit || 10))
      })
    }catch(err){
      toast.error(getFriendlyError(err , 'Failed to load users'))
    }finally{
      setLoading(false)
    }
  },[token])

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
        await fetchOrgs({page : orgsData.page});
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
        await fetchUsers({page : usersData.page});
      } catch (err) {
        toast.error(getFriendlyError(err, "Failed to delete user"));
      }
    };

    const updateOrgStatus = async (id: string, status: string) => {
      try {
        await api.put(`${API_ROUTES.ADMIN.ORGS}/${id}`, { status });
        toast.success(`Organization ${status.toLowerCase()} successfully.`);
        await fetchOrgs({page : orgsData.page});
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
        await fetchUsers({page : usersData.page});
      } catch (err) {
        toast.error(getFriendlyError(err, "Failed to update user status"));
      }
    };

    return {
      data: { 
        orgs :orgsData,
        users : usersData,
        loading 
      },
      actions: {
        fetchOrgs,
        fetchUsers,
        deleteOrg,
        deleteUser,
        updateOrgStatus,
        updateUserStatus,
      },
    };
  }
