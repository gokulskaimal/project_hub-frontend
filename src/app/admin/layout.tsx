"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/store/store";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, role, user } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    setIsReady(true);
  }, [dispatch]);

  useEffect(() => {
    if (isReady && (!isLoggedIn || role !== "super-admin")) {
      router.push("/login");
    }
  }, [isReady, isLoggedIn, role, router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  if (!isReady || !isLoggedIn || role !== "super-admin") return null;

  return (
    <DashboardLayout 
      title="Platform Admin" 
      onLogout={handleLogout}
      avatarUrl={user?.avatar}
      avatarInitial={user?.name?.[0] || user?.email?.[0]}
    >
      {children}
    </DashboardLayout>
  );
}
