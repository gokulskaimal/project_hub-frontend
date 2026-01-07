'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { logout, fetchProfile } from '@/features/auth/authSlice';
import Link from 'next/link';
import UserModal from '@/components/modals/UserModal';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { LayoutDashboard, Users, Mail, CreditCard, LogOut, Menu, X } from 'lucide-react';



export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { accessToken } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchProfile());
    }
    if (user && user.role !== 'ORG_MANAGER' && user.role !== 'admin') { // Basic protection
        if (user.role === 'TEAM MEMBER' || user.role === 'member') {
            router.push('/member/dashboard');
        }
    }
  }, [accessToken, user, dispatch]);

   const profileHook = useMemberProfile(accessToken)
  const [userModalMode, setUserModalMode] = useState<'view' | 'edit'>('view')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  const openProfile = () => {
    setUserModalMode('view')
    setIsUserModalOpen(true)
  }

  const sidebarLinks = [
    { name: 'Dashboard', href: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/manager/members', icon: Users },
    { name: 'Invites', href: '/manager/invites', icon: Mail },
    { name: 'Plans', href: '/manager/plans', icon: CreditCard },


    { name: 'Projects', href: '/manager/projects', icon: LayoutDashboard },
    // { name: 'Kanban Board', href: '/manager/kanban' },
    // { name: 'Calendar', href: '/manager/calendar' },
    // { name: 'Chat', href: '/manager/chat' },
    // { name: 'Tickets', href: '/manager/tickets' },
    // { name: 'Team', href: '/manager/team' },
    // { name: 'Billing', href: '/manager/billing' },
    // { name: 'Settings', href: '/manager/settings', borderTop: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">PH</span>
            </div>
            <span className="text-gray-900 font-bold text-lg">ProjectHub</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500">
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                    ? 'text-blue-600 bg-blue-50 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
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
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-gray-500 shrink-0">
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Search Bar - Moved from DashboardLayout */}
          <div className="hidden md:flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 w-full max-w-xl">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-600 outline-none"
              placeholder="Search projects, tasks, users..."
              aria-label="Global search"
            />
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
              <span className="text-xs text-gray-600 font-medium">⌘</span>
              <span className="text-xs text-gray-600 font-medium">K</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
             {/* Notification Bell - Moved from DashboardLayout */}
            <button type="button" className="relative p-2 rounded hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 transition-colors" aria-label="View notifications">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-5 5-5-5h5V7a3 3 0 116 0v10zM9 12H4l5-5 5 5H9v5a3 3 0 01-6 0v-5z" />
              </svg>
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
            </button>

            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

            <button
              onClick={openProfile}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-full pl-1 pr-3 py-1 transition-colors border border-transparent hover:border-gray-200"
              suppressHydrationWarning
            >
              <div 
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm"
                suppressHydrationWarning
              >
                {!isMounted ? 'U' : (user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U')}
              </div>
              <div className="hidden md:block text-left">
                <p 
                    className="text-sm font-medium text-gray-900 truncate max-w-[200px]" 
                    title={!isMounted ? 'User' : (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || user?.firstName || 'User'))}
                    suppressHydrationWarning
                >
                  {!isMounted ? 'User' : (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.name || user?.firstName || 'User'))}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[200px]" suppressHydrationWarning>
                  {!isMounted ? 'Manager' : (user?.role || 'Manager')}
                </p>
              </div>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
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