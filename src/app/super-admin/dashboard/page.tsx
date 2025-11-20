/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/store/store";
import axios from "axios";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";
import { getFriendlyError } from "@/utils/errors";
import { confirmWithAlert } from "@/utils/confirm";

type Org = { id: string; name: string; status?: string; createdAt?: string };
type User = { id: string; email: string; name?: string; firstName?: string; lastName?: string; role?: string; status?: string; orgId?: string };

export default function SuperAdminDashboardPage() {
  const { isLoggedIn, role, email: loggedInEmail } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Hydrate auth from localStorage on client mount
    dispatch(hydrateFromStorage());
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleOk = useMemo(() => {
    const r = (role || "").toString().toLowerCase();
    return r === "super-admin" || r === "super_admin";
  }, [role]);

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn || !roleOk) router.push("/login");
  }, [authChecked, isLoggedIn, roleOk, router]);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", []);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") setToken(localStorage.getItem("accessToken"));
  }, []);

  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [users, setUsers] = useState<User[]>([]);


  const asArray = (input: unknown): any[] => {
    if (Array.isArray(input)) return input;
    if (input && typeof input === 'object') {
      const obj = input as any;
      if (Array.isArray(obj.data)) return obj.data;
      if (obj.data && Array.isArray(obj.data.users)) return obj.data.users;
      if (obj.data && Array.isArray(obj.data.organizations)) return obj.data.organizations;
      if (Array.isArray(obj.users)) return obj.users;
      if (Array.isArray(obj.organizations)) return obj.organizations;
    }
    return [];
  };

  const fetchAll = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [orgRes, userRes] = await Promise.all([
        axios.get(`${apiBase}/api/admin/organizations`, { headers }),
        axios.get(`${apiBase}/api/admin/users`, { headers }),
      ]);
      setOrgs(asArray(orgRes.data));
      setUsers(asArray(userRes.data));
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to load admin data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, apiBase]);

  const onDeleteOrg = async (orgId: string) => {
    const ok = await confirmWithAlert("Delete this organization? This cannot be undone.", 'Yes, Delete');
    if (!ok) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiBase}/api/admin/organizations/${orgId}`, { headers });
      toast.success("Organization deleted");
      fetchAll();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to delete organization"));
    }
  };

  const onOrgStatus = async (orgId: string, nextStatus: "ACTIVE" | "BLOCKED") => {
    const ok = await confirmWithAlert(nextStatus === 'BLOCKED' ? 'Block this organization? Members will lose access.' : 'Unblock this organization?', nextStatus === 'BLOCKED' ? 'Yes, Block' : 'Yes, Unblock');
    if (!ok) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${apiBase}/api/admin/organizations/${orgId}`, { status: nextStatus }, { headers });
      toast.success(nextStatus === "BLOCKED" ? "Organization blocked" : "Organization unblocked");
      fetchAll();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to update organization status"));
    }
  };

  const onUserStatus = async (userId: string, nextStatus: "ACTIVE" | "BLOCKED") => {
    const ok = await confirmWithAlert(nextStatus === 'BLOCKED' ? 'Block this user? They will lose access.' : 'Unblock this user?', nextStatus === 'BLOCKED' ? 'Yes, Block' : 'Yes, Unblock');
    if (!ok) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${apiBase}/api/admin/users/${userId}/status`, { status: nextStatus }, { headers });
      toast.success(nextStatus === "BLOCKED" ? "User blocked" : "User unblocked");
      fetchAll();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to update user status"));
    }
  };

  const onDeleteUser = async (userId: string) => {
    const ok = await confirmWithAlert("Delete this user? This cannot be undone.", 'Yes, Delete');
    if (!ok) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiBase}/api/admin/users/${userId}`, { headers });
      toast.success("User deleted");
      fetchAll();
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to delete user"));
    }
  };

  const userDisplayName = (u: User) => {
    const full = `${u.firstName || ""} ${u.lastName || ""}`.trim();
    if (full) return full;
    if (u.name) return u.name;
    return u.email?.split("@")[0] || u.email || "User";
  };

  const onLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };
  return (
    <DashboardLayout title="Super Admin Dashboard" onLogout={onLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Organizations</h2>
              <button onClick={fetchAll} className="px-3 py-1.5 text-sm border bg-black-50 rounded hover:bg-gray-50">Refresh</button>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : (!Array.isArray(orgs) || orgs.length === 0) ? (
              <div>No organizations found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="py-2 pr-4 font-medium text-gray-900">{o.name}</td>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${((o.status || 'ACTIVE') === 'ACTIVE') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {(o.status || 'ACTIVE').toString().toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            {o.status === 'BLOCKED' ? (
                              <button className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" onClick={() => onOrgStatus(o.id, 'ACTIVE')} title="Unblock organization">Unblock</button>
                            ) : (
                              <button className="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => onOrgStatus(o.id, 'BLOCKED')} title="Block organization">Block</button>
                            )}
                            <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => onDeleteOrg(o.id)} title="Delete organization">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Users</h2>
              <button onClick={fetchAll} className="px-3 py-1.5 text-sm border rounded hover:bg-bla-50">Refresh</button>
            </div>
            {loading ? (
              <div>Loading...</div>
            ) : (!Array.isArray(users) || users.filter((u) => u.email !== loggedInEmail).length === 0) ? (
              <div>No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => u.email !== loggedInEmail)
                      .map((u) => (
                        <tr key={u.id} className="border-t">
                          <td className="py-2 pr-4">{userDisplayName(u)}</td>
                          <td className="py-2 pr-4">{u.email}</td>
                          <td className="py-2 pr-4">{(u.role || "").toString().toUpperCase()}</td>
                          <td className="py-2 pr-4">{(u.status || "ACTIVE").toString().toUpperCase()}</td>
                          <td className="py-2 pr-4">
                            <div className="flex gap-2">
                              {u.status === "BLOCKED" ? (
                                <button className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" onClick={() => onUserStatus(u.id, "ACTIVE")} title="Unblock user">Unblock</button>
                              ) : (
                                <button className="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => onUserStatus(u.id, "BLOCKED")} title="Block user">Block</button>
                              )}
                              <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => onDeleteUser(u.id)} title="Delete user">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
      </div>
    </DashboardLayout>
  );
}


