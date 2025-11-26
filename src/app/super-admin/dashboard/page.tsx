"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/store/store";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";
import { useAdminData, User, Org } from "@/hooks/useAdminData"; 
import Table from "@/components/Table"; 

export default function SuperAdminDashboardPage() {
  const { isLoggedIn, role, accessToken, user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isReady, setIsReady] = useState(false);

  // --- 1. Auth Check & Hydration ---
  useEffect(() => {
    dispatch(hydrateFromStorage());
    setIsReady(true);
  }, [dispatch]);

  useEffect(() => {
    if (isReady && (!isLoggedIn || role !== "super-admin")) router.push("/login");
  }, [isReady, isLoggedIn, role, router]);

  // --- 2. Data Logic Hook ---
  const { data, actions } = useAdminData(accessToken);

  useEffect(() => {
    // Initial fetch on mount or token change
    actions.fetchData();
  }, [actions.fetchData]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  const getOrgStatusStyle = (status: string | undefined) => {
    const s = (status || 'ACTIVE').toUpperCase();
    if (s === 'ACTIVE') return 'bg-green-100 text-green-800';
    if (s === 'BLOCKED' || s === 'SUSPENDED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  if (!isReady || !isLoggedIn || role !== "super-admin") return null;

  return (
    <DashboardLayout 
      title="Platform Admin" 
      onLogout={handleLogout}
      avatarUrl={user?.avatar}
      avatarInitial={user?.name?.[0] || user?.email?.[0]}
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Organizations Table */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Organizations</h2>
            <button onClick={actions.fetchData} className="text-sm text-blue-600 hover:underline">Refresh Data</button>
          </div>
          {data.loading ? <p>Loading Organizations...</p> : (
            <Table<Org> 
              columns={[
                { key: 'name', header: 'Name' },
                { key: 'status', header: 'Status', render: (row) => (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrgStatusStyle(row.status)}`}>
                    {(row.status || 'ACTIVE').toUpperCase()}
                  </span>
                )},
                { key: 'id', header: 'Actions', render: (row) => (
                  <div className="flex gap-2">
                    {row.status === 'ACTIVE' ? (
                      <button onClick={() => actions.updateOrgStatus(row.id, 'SUSPENDED')} className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-xs font-medium disabled:opacity-50" disabled={data.loading}>
                        Block
                      </button>
                    ) : (
                      <button onClick={() => actions.updateOrgStatus(row.id, 'ACTIVE')} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium disabled:opacity-50" disabled={data.loading}>
                        Unblock
                      </button>
                    )}
                    <button onClick={() => actions.deleteOrg(row.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium disabled:opacity-50" disabled={data.loading}>
                      Delete
                    </button>
                  </div>
                )}
              ]} 
              data={data.orgs} 
            />
          )}
        </section>

        {/* Users Table */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-lg p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
            <button onClick={actions.fetchData} className="text-sm text-blue-600 hover:underline">Refresh Data</button>
          </div>
          {data.loading ? <p>Loading Users...</p> : (
            <Table<User> 
              columns={[
                { key: 'email', header: 'Email' },
                { key: 'role', header: 'Role' },
                { key: 'orgId', header: 'Organization', render: (row) => {
                  const orgName = data.orgs.find(o => o.id === row.orgId)?.name;
                  return <span className="text-sm text-gray-700">{orgName || 'N/A'}</span>;
                }},
                { key: 'status', header: 'Status', render: (row) => (
                   <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getOrgStatusStyle(row.status)}`}>
                    {(row.status || 'ACTIVE').toUpperCase()}
                  </span>
                )},
                { key: 'id', header: 'Actions', render: (row) => (
                  <div className="flex gap-2">
                    {row.status === 'ACTIVE' ? (
                      <button onClick={() => actions.updateUserStatus(row.id, 'INACTIVE')} className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-xs font-medium disabled:opacity-50" disabled={data.loading}>
                        Block
                      </button>
                    ) : (
                      <button onClick={() => actions.updateUserStatus(row.id, 'ACTIVE')} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-medium disabled:opacity-50" disabled={data.loading}>
                        Unblock
                      </button>
                    )}
                    <button onClick={() => actions.deleteUser(row.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-medium disabled:opacity-50" disabled={data.loading}>
                      Delete
                    </button>
                  </div>
                )}
              ]} 
              data={data.users} 
            />
          )}
        </section>
      </div>
      <footer className="mt-6 text-sm text-gray-500">
        Note: Admin dashboard functionality relies on the cascading logic in your Organization Management Use Case.
      </footer>
    </DashboardLayout>
  );
}