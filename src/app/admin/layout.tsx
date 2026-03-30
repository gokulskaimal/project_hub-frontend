"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { RootState, AppDispatch } from "@/store/store";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";
import { useGetProfileQuery } from "@/store/api/userApiSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
  ReceiptText,
} from "lucide-react";

import UserModal from "@/components/modals/UserModal";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import UserAvatar from "@/components/ui/UserAvatar";
import NotificationBell from "@/components/notifications/NotificationBell";
import SocketNotification from "@/components/notifications/SocketNotification";
import { useSidebar } from "@/hooks/useSidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, role, user, accessToken } = useSelector(
    (s: RootState) => s.auth,
  );
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const [isReady, setIsReady] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"view" | "edit">("view");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const {
    isCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isMounted,
  } = useSidebar();

  // Profile Modal State
  const profileHook = useMemberProfile(accessToken);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    setIsReady(true);
  }, [dispatch]);

  const { isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: !isLoggedIn || !!user,
  });

  useEffect(() => {
    if (isReady && (!isLoggedIn || role !== "SUPER_ADMIN")) {
      router.push("/login");
    }
  }, [isReady, isLoggedIn, role, router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  const openProfile = () => {
    setUserModalMode("view");
    setIsUserModalOpen(true);
  };

  const sidebarLinks = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Organizations", href: "/admin/organizations", icon: Building2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Plans", href: "/admin/plans", icon: CreditCard },
    { name: "Invoices", href: "/admin/invoices", icon: ReceiptText },
  ];

  if (!isMounted || !isReady || !isLoggedIn || role !== "SUPER_ADMIN")
    return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        links={sidebarLinks}
        pathname={pathname}
        handleLogout={handleLogout}
        role="SUPER_ADMIN"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" /> {/* Spacer */}
          <div className="flex items-center gap-4 shrink-0 ml-auto">
            <SocketNotification />
            <NotificationBell />
            <div className="h-8 w-px bg-gray-200 hidden md:block mx-1"></div>
            <button
              onClick={openProfile}
              className="group flex items-center gap-3 pl-1 pr-3 py-1 hover:bg-white hover:shadow-sm rounded-full transition-all border border-transparent hover:border-gray-200"
            >
              <UserAvatar user={user} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Super Admin
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50/50">
          {children}
        </main>
      </div>

      <UserModal
        isOpen={isUserModalOpen}
        mode={userModalMode}
        onClose={() => setIsUserModalOpen(false)}
        setMode={setUserModalMode}
        profile={profileHook}
      />
    </div>
  );
}
