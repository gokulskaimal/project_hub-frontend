"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";
import { useGetProfileQuery } from "@/store/api/userApiSlice";
import Link from "next/link";
import UserModal from "@/components/modals/UserModal";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  CalendarDays,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import SocketNotification from "@/components/notifications/SocketNotification";
import ChatNotificationListener from "@/components/chat/ChatNotificationListener";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSidebar } from "@/hooks/useSidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn, role, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    isCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isMounted,
  } = useSidebar();
  const [isReady, setIsReady] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"view" | "edit">("view");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    setIsReady(true);
  }, [dispatch]);

  const { isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: !isLoggedIn || !!user,
  });

  useEffect(() => {
    if (isReady) {
      if (!isLoggedIn) {
        router.push("/login?redirect=/member/dashboard");
      } else if (
        role !== "TEAM_MEMBER" &&
        role !== "MEMBER" &&
        role !== "PROJECT_MANAGER" &&
        role !== "ORG_MANAGER" &&
        role !== "ADMIN" &&
        role !== "SUPER_ADMIN"
      ) {
        router.push("/");
      }
    }
  }, [isReady, isLoggedIn, role, router]);

  const profileHook = useMemberProfile(accessToken);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  const openProfile = () => {
    setUserModalMode("view");
    setIsUserModalOpen(true);
  };

  const sidebarLinks = [
    { name: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/member/projects", icon: Briefcase },
    { name: "Tasks", href: "/member/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/member/calendar", icon: CalendarDays },
  ];

  if (!isMounted || !isReady || !isLoggedIn) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <ChatNotificationListener />

      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        links={sidebarLinks}
        pathname={pathname}
        handleLogout={handleLogout}
        role="TEAM_MEMBER"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-gray-500 hover:text-blue-600 transition-colors shrink-0"
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 shrink-0 ml-auto font-sans">
            <SocketNotification />
            <NotificationBell />

            <div className="h-8 w-px bg-gray-200 hidden md:block mx-1"></div>

            <button
              onClick={openProfile}
              className="group flex items-center gap-3 hover:bg-white hover:shadow-sm rounded-full pl-1 pr-3 py-1 transition-all border border-transparent hover:border-gray-200"
            >
              <UserAvatar user={user} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[150px]">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.name || user?.firstName || "Member"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  {role?.replace("_", " ") || "Member"}
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
