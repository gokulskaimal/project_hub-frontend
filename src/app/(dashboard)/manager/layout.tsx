"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";
import { useGetProfileQuery } from "@/store/api/userApiSlice";
import UserModal from "@/components/modals/UserModal";
import InviteModal from "@/components/modals/InviteModal";
import CreateProjectModal from "@/components/modals/CreateProjectModal";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import {
  LayoutDashboard,
  Users,
  Mail,
  CreditCard,
  Menu,
  KanbanSquare,
  CalendarDays,
  ReceiptText,
  Briefcase,
  Video,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import SocketNotification from "@/components/notifications/SocketNotification";
import ChatNotificationListener from "@/components/chat/ChatNotificationListener";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSidebar } from "@/hooks/useSidebar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import {
  ManagerModalProvider,
  useManagerModals,
} from "@/context/ManagerModalContext";

function ManagerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoggedIn, role, accessToken } = useSelector(
    (state: RootState) => state.auth,
  );

  const {
    isInviteModalOpen,
    closeInviteModal,
    isCreateProjectModalOpen,
    closeCreateProjectModal,
  } = useManagerModals();

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

  useGetProfileQuery(undefined, {
    skip: !isLoggedIn || !!user,
  });

  useEffect(() => {
    if (isReady) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (role !== "ORG_MANAGER" && role !== "SUPER_ADMIN") {
        if (role === "TEAM_MEMBER") {
          router.push("/member/dashboard");
        }
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
    { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/manager/members", icon: Users },
    { name: "Invites", href: "/manager/invites", icon: Mail },
    { name: "Plans", href: "/manager/plans", icon: CreditCard },
    { name: "Projects", href: "/manager/projects", icon: Briefcase },
    { name: "Boards", href: "/manager/boards", icon: KanbanSquare },
    { name: "Meetings", href: "/manager/meetings", icon: Video },
    { name: "Calendar", href: "/manager/calendar", icon: CalendarDays },
    { name: "Billing", href: "/manager/billing", icon: ReceiptText },
  ];

  if (
    !isMounted ||
    !isReady ||
    !isLoggedIn ||
    (role !== "ORG_MANAGER" && role !== "SUPER_ADMIN")
  )
    return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors duration-500">
      <ChatNotificationListener />

      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        links={sidebarLinks}
        pathname={pathname}
        handleLogout={handleLogout}
        role="ORG_MANAGER"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-4 md:px-8 flex items-center justify-between gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-muted-foreground hover:text-primary transition-colors shrink-0"
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 shrink-0 ml-auto font-sans">
            <SocketNotification />
            <NotificationBell />

            <div className="h-8 w-px bg-border hidden md:block mx-1"></div>

            <button
              onClick={openProfile}
              className="group flex items-center gap-3 hover:bg-background hover:shadow-sm rounded-full pl-1 pr-3 py-1 transition-all border border-transparent hover:border-border"
            >
              <UserAvatar user={user} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate max-w-[150px]">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.name || user?.firstName || "Manager"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold truncate max-w-[150px]">
                  {role?.replace("_", " ") || "Manager"}
                </p>
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-background">
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

      {/* Global Dashboard Modals provided by context */}
      <InviteModal isOpen={isInviteModalOpen} onClose={closeInviteModal} />

      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={closeCreateProjectModal}
        onSuccess={() => {
          // Optional: refresh logic
        }}
      />
    </div>
  );
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagerModalProvider>
      <ManagerLayoutContent>{children}</ManagerLayoutContent>
    </ManagerModalProvider>
  );
}
