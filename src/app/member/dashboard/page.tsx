"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/store/store";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserModal from "@/components/modals/UserModal"; // Assuming this is created
import { useMemberProfile } from "@/hooks/useMemberProfile"; // Assuming this hook is available

export default function MemberDashboardPage() {
  const { isLoggedIn, role, accessToken, user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [authChecked, setAuthChecked] = useState(false);

  // --- 1. Auth Check & Hydration ---
  useEffect(() => {
    dispatch(hydrateFromStorage());
    setAuthChecked(true);
  }, [dispatch]);

  const isMember = useMemo(() => {
    const r = (role || "").toString().toLowerCase();
    return ['member', 'user', 'team_member', 'team-member'].includes(r);
  }, [role]);

  useEffect(() => {
    // Redirect if not authenticated or not a member role
    if (authChecked && (!isLoggedIn || !isMember)) {
      router.push("/login");
    }
  }, [authChecked, isLoggedIn, isMember, router]);

  // --- 2. Profile Logic Hook (Uses token for API calls) ---
  const profile = useMemberProfile(accessToken);
  
  // --- 3. Modal State & Handlers ---
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const openModal = (mode: 'view' | 'edit') => {
    setModalMode(mode);
    setShowUserModal(true);
    // Trigger data fetch when modal opens
    profile.actions.loadProfile();
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  // --- 4. Render ---
  if (!authChecked || !isLoggedIn || !isMember) return null; // Render nothing until auth check is complete

  return (
    <DashboardLayout 
      title="Member Dashboard" 
      onLogout={handleLogout}
      avatarUrl={user?.avatar}
      avatarInitial={user?.name?.[0] || user?.email?.[0]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Work</h2>
            <div className="flex gap-2">
              <button 
                className={`px-3 py-1.5 text-sm border rounded text-gray-900 hover:bg-gray-50 transition-colors`} 
                onClick={() => openModal("view")}
              >
                View Profile
              </button>
              <button 
                className={`px-3 py-1.5 text-sm border rounded text-gray-900 hover:bg-gray-50 transition-colors`} 
                onClick={() => openModal("edit")}
              >
                Edit Profile
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">Your projects and tasks will appear here.</div>
        </section>
        
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Assigned Tasks</span><span>0</span></div>
            <div className="flex justify-between"><span>Open Tickets</span><span>0</span></div>
            <div className="flex justify-between"><span>Active Projects</span><span>0</span></div>
          </div>
        </section>
      </div>

      <UserModal 
        isOpen={showUserModal}
        mode={modalMode}
        setMode={setModalMode}
        onClose={() => setShowUserModal(false)}
        profile={profile}
        // Note: Profile information is derived directly from the hook state
      />
    </DashboardLayout>
  );
}