"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import type { RootState, AppDispatch } from "@/store/store";
import {
  logout,
  hydrateFromStorage,
  fetchProfile,
} from "@/features/auth/authSlice";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import UserModal from "@/components/modals/UserModal";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import UserAvatar from "@/components/ui/UserAvatar";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Profile Modal State
  const profileHook = useMemberProfile(accessToken);
  const [userModalMode, setUserModalMode] = useState<"view" | "edit">("view");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    setIsReady(true);
  }, [dispatch]);

  useEffect(() => {
    if (isReady && isLoggedIn && !user) {
      dispatch(fetchProfile());
    }
  }, [isReady, isLoggedIn, user, dispatch]);

  useEffect(() => {
    if (isReady && (!isLoggedIn || role !== "super-admin")) {
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
  ];

  if (!isReady || !isLoggedIn || role !== "super-admin") return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">PH</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">ProjectHub</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 bg-blue-50 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-gray-500"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" /> {/* Spacer */}
          <div className="flex items-center gap-4">
            <button
              onClick={openProfile}
              className="flex items-center gap-3 pl-1 pr-3 py-1 hover:bg-gray-50 rounded-full transition-colors border border-transparent hover:border-gray-200"
            >
              <UserAvatar user={user} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
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
