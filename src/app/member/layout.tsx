"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MEMBER_LINKS } from "@/config/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/features/auth/authSlice";
import UserModal from "@/components/modals/UserModal";
import { useMemberProfile } from "@/hooks/useMemberProfile";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isLoggedIn, loading, accessToken } = useSelector((state: RootState) => state.auth);
  
  const profileHook = useMemberProfile(accessToken);
  const [userModalMode, setUserModalMode] = useState<'view' | 'edit'>('view');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, isLoggedIn, user]);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    } else if (
      !loading &&
      isLoggedIn &&
      user &&
      user.role !== "member" &&
      user.role !== "project_manager"
    ) {
      if (user.role === 'organization_manager') {
         router.push('/manager/dashboard');
      } else if (user.role === 'super_admin') {
         router.push('/admin/dashboard');
      }
    }
  }, [loading, isLoggedIn, router, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <DashboardLayout 
        title="Member Portal" 
        avatarInitial={user?.firstName?.[0] || user?.email?.[0]}
        onLogout={() => dispatch({ type: 'auth/logout' })}
        onAvatarClick={() => {
          setUserModalMode('view');
          setIsUserModalOpen(true);
        }}
      >
        {children}
      </DashboardLayout>

      <UserModal
        isOpen={isUserModalOpen}
        mode={userModalMode}
        onClose={() => setIsUserModalOpen(false)}
        setMode={setUserModalMode}
        profile={profileHook}
      />
    </>
  );
}
