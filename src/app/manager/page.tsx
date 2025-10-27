'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useRouter } from 'next/navigation';
import { api, API_ROUTES } from '@/utils/api';

type InviteForm = { email: string; role: 'Team Member' | 'Admin' | 'Manager'; expiry: '7 Days' | '14 Days' | '30 Days' };
type UserMode = 'view' | 'edit';
type UserProfile = { id: string; email: string; firstName?: string; lastName?: string; name?: string; role: string; orgId?: string; status?: string; lastLoginAt?: string | Date };

export default function DashboardPage() {
  const { isLoggedIn, role } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn || role !== 'org-manager') router.push('/login');
  }, [isLoggedIn, role, router]);

  const [token, setToken] = useState<string | null>(() => (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const base64UrlToJson = useCallback((b64url: string) => {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
    const decoded = atob(b64 + pad);
    return JSON.parse(decodeURIComponent(Array.prototype.map.call(decoded, (c: string) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
  }, []);
  const decodeJwtProfile = useCallback((): Partial<UserProfile> | null => {
    try {
      const t = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
      if (!t) return null;
      const parts = t.split('.');
      if (parts.length < 2) return null;
      const payload = base64UrlToJson(parts[1]);
      const p: Partial<UserProfile> = {
        email: payload.email || '',
        firstName: payload.firstName || payload.given_name || undefined,
        lastName: payload.lastName || payload.family_name || undefined,
        name: payload.name || undefined,
        role: payload.role || (Array.isArray(payload.roles) ? payload.roles[0] : '') || '',
      };
      return p;
    } catch {
      return null;
    }
  }, [token, base64UrlToJson]);
  const jwtProfile = useMemo(() => decodeJwtProfile(), [decodeJwtProfile]);
  const roleLabel = useMemo(() => {
    const sourceRole = (profile?.role || jwtProfile?.role || '').toString().toUpperCase();
    if (sourceRole === 'ORG_MANAGER') return 'Organization Admin';
    if (sourceRole === 'SUPER_ADMIN') return 'Platform Admin';
    if (sourceRole === 'ADMIN') return 'Admin';
    if (sourceRole === 'MEMBER' || sourceRole === 'TEAM_MEMBER') return 'Team Member';
    return sourceRole.replace(/-/g, ' ');
  }, [profile, jwtProfile]);
  const displayName = useMemo(() => {
    const first = (profile?.firstName || jwtProfile?.firstName || '').trim();
    const last = (profile?.lastName || jwtProfile?.lastName || '').trim();
    const full = [first, last].filter(Boolean).join(' ').trim();
    if (full) return full;
    const nameField = (profile?.name || jwtProfile?.name || '').trim();
    if (nameField) return nameField;
    const email = (profile?.email || jwtProfile?.email || '').trim();
    if (email) {
      const username = email.split('@')[0] || '';
      return username ? username.replace(/\./g, ' ').replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()) : email;
    }
    return 'User';
  }, [profile, jwtProfile]);
  const displayInitial = useMemo(() => (displayName?.[0] || profile?.email?.[0] || jwtProfile?.email?.[0] || 'U').toUpperCase(), [displayName, profile, jwtProfile]);
  useEffect(() => {
    if (!token) {
      const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (t) setToken(t);
    }
  }, [token]);
  const fetchProfile = useCallback(async (): Promise<boolean> => {
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    if (!effectiveToken) return false;
    try {
      const res = await api.get(API_ROUTES.USER.PROFILE, { headers: { Authorization: `Bearer ${effectiveToken}` } });
      const data = res.data?.data;
      if (data) {
        setProfile(data as UserProfile);
        return true;
      }
    } catch {}
    return false;
  }, [token]);
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<UserMode>('view');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => fileInputRef.current?.click();
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };
  const removeProfileImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const openUserModal = async (mode: UserMode = 'view') => {
    setUserModalMode(mode);
    // Ensure token exists
    if (!token && typeof window !== 'undefined') {
      const t = localStorage.getItem('accessToken');
      if (t) setToken(t);
    }
    // Ensure profile is loaded before showing the modal
    if (!profile) {
      const loaded = await fetchProfile();
      if (!loaded) {
        const fallback = decodeJwtProfile();
        if (fallback && fallback.email) {
          setProfile((prev) => prev ?? { id: '', role: fallback.role || '', email: fallback.email!, firstName: fallback.firstName, lastName: fallback.lastName, name: fallback.name });
        }
      }
    }
    // Defer to next tick so state updates (profile/jwt) are applied before first modal render
    setTimeout(() => setShowUserModal(true), 0);
  };

  const sidebarLinks = [
    { name: 'Dashboard', active: true },
    { name: 'Projects' },
    { name: 'Kanban Board' },
    { name: 'Calendar' },
    { name: 'Chat' },
    { name: 'Tickets' },
    { name: 'Team' },
    { name: 'Billing' },
    { name: 'Settings', borderTop: true },
  ];

  const [invites, setInvites] = useState<InviteForm[]>([{ email: '', role: 'Team Member', expiry: '7 Days' }]);
  const addInvite = () => setInvites((i) => [...i, { email: '', role: 'Team Member', expiry: '7 Days' }]);
  const removeInvite = (index: number) => setInvites((i) => (i.length > 1 ? i.filter((_, k) => k !== index) : i));
  const updateInvite = (index: number, field: keyof InviteForm, value: InviteForm[keyof InviteForm]) =>
    setInvites((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  const canSend = invites.every((i) => i.email.trim().length > 3 && i.email.includes('@'));

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInviteModal(false);
        setShowUserModal(false);
      }
    };
    if (showInviteModal || showUserModal) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [showInviteModal, showUserModal]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
        <div className="h-16 px-6 border-b border-gray-200 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">PM</span>
            </div>
            <span className="text-gray-900 font-semibold">ProjectHub</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarLinks.map((item) => (
            <a
              key={item.name}
              href="#"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'text-blue-700 bg-blue-50 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50'
              } ${item.borderTop ? 'border-t border-gray-200 mt-3 pt-4' : ''}`}
            >
              <span className="w-5 h-5 inline-block bg-gray-100 rounded" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2 w-full max-w-xl">
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-500 outline-none"
              placeholder="Search projects, tasks, users..."
              aria-label="Global search"
            />
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
              <span className="text-xs text-gray-500">⌘</span>
              <span className="text-xs text-gray-500">K</span>
            </div>
          </div>
          <div className="flex items-center gap-4 pl-2">
            <button type="button" className="relative p-2 rounded hover:bg-gray-50 focus:ring-2 focus:ring-gray-300" aria-label="View notifications">
              <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-5 5-5-5h5V7a3 3 0 116 0v10zM9 12H4l5-5 5 5H9v5a3 3 0 01-6 0v-5z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full grid place-items-center">
                <span className="text-xs text-white font-semibold">2</span>
              </div>
            </button>
            <button
              onClick={() => openUserModal('view')}
              className="w-8 h-8 bg-gray-100 rounded-full grid place-items-center hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-300"
            >
              {profileImage ? (
                <Image src={profileImage} alt="Profile" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-gray-900">{displayInitial}</span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Organization Dashboard</h1>
              <p className="text-gray-600">Manage your team, projects, and organization performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
              >
                <span className="w-4 h-4 rounded bg-blue-600 inline-flex" />
                <span className="text-sm font-medium">Invite Team</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-300">
                <span className="w-4 h-4 rounded bg-gray-600 inline-flex" />
                <span className="text-sm font-medium">New Project</span>
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Active Projects</h3>
              <div className="text-3xl font-bold text-blue-900 mb-1">12</div>
              <div className="text-sm text-blue-700">+2 from last month</div>
            </div>
            <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-6">
              <h3 className="text-sm font-medium text-green-900 mb-2">Team Members</h3>
              <div className="text-3xl font-bold text-green-900 mb-1">24</div>
              <div className="text-sm text-green-800">+3 new this week</div>
            </div>
            <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-6">
              <h3 className="text-sm font-medium text-purple-900 mb-2">Tasks Completed</h3>
              <div className="text-3xl font-bold text-purple-900 mb-1">156</div>
              <div className="text-sm text-purple-800">+12% from last week</div>
            </div>
            <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-6">
              <h3 className="text-sm font-medium text-orange-900 mb-2">Revenue</h3>
              <div className="text-3xl font-bold text-orange-900 mb-1">$45.2k</div>
              <div className="text-sm text-orange-800">+8% from last month</div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => openUserModal('view')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left focus:ring-2 focus:ring-gray-300"
              >
                <span className="w-10 h-10 bg-blue-100 rounded-lg" />
                <div>
                  <h3 className="font-medium text-gray-900">View Profile</h3>
                  <p className="text-sm text-gray-500">Manage your account settings</p>
                </div>
              </button>
              <button
                onClick={() => openUserModal('edit')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left focus:ring-2 focus:ring-gray-300"
              >
                <span className="w-10 h-10 bg-green-100 rounded-lg" />
                <div>
                  <h3 className="font-medium text-gray-900">Edit Profile</h3>
                  <p className="text-sm text-gray-500">Update your information</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left focus:ring-2 focus:ring-gray-300">
                <span className="w-10 h-10 bg-purple-100 rounded-lg" />
                <div>
                  <h3 className="font-medium text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-500">Check performance metrics</p>
                </div>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowInviteModal(false)} />
          <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl mx-4 p-6">
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
              aria-label="Close invitation modal"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Invite Team Members</h2>
              <p className="text-sm text-gray-600">Send invitations to new team members to join your organization</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                {invites.map((invite, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative">
                    {invites.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInvite(idx)}
                        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 text-gray-500"
                        aria-label="Remove invitation"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label htmlFor={`invite-email-${idx}`} className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
                        <input
                          id={`invite-email-${idx}`}
                          type="email"
                          placeholder="team.member@company.com"
                          value={invite.email}
                          onChange={(e) => updateInvite(idx, 'email', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`invite-role-${idx}`} className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                          <select
                            id={`invite-role-${idx}`}
                            value={invite.role}
                            onChange={(e) => updateInvite(idx, 'role', e.target.value as InviteForm['role'])}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option>Team Member</option>
                            <option>Admin</option>
                            <option>Manager</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`invite-expiry-${idx}`} className="block text-sm font-medium text-gray-900 mb-2">Invite Expires (Days)</label>
                          <select
                            id={`invite-expiry-${idx}`}
                            value={invite.expiry}
                            onChange={(e) => updateInvite(idx, 'expiry', e.target.value as InviteForm['expiry'])}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option>7 Days</option>
                            <option>14 Days</option>
                            <option>30 Days</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addInvite}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-gray-900">Add Another Invitation</span>
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Email Invitation</h4>
                    <p className="text-sm text-blue-700">
                      Invitees will receive an email with a secure link to join your organization. They&apos;ll need to create an account if they don&apos;t have one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSend}
                  className={`px-4 py-2.5 rounded-md text-sm font-medium text-white ${canSend ? 'bg-gray-900 hover:bg-gray-800 focus:ring-2 focus:ring-gray-300' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Send {invites.length} Invitation{invites.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 grid place-items-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowUserModal(false)} />
          <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 focus:ring-2 focus:ring-gray-300"
              aria-label="Close user modal"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                {userModalMode === 'edit' ? `Edit User: ${displayName}` : `Manage User: ${displayName}`}
              </h2>
              <p className="text-sm text-gray-600">
                {userModalMode === 'edit' ? 'Update user information and account settings' : 'View and manage user account information'}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-100 rounded-full grid place-items-center overflow-hidden">
                    {profileImage ? (
                      <Image src={profileImage} alt="Profile" width={64} height={64} className="w-16 h-16 object-cover rounded-full" />
                    ) : (
                      <span className="text-xl font-medium text-gray-900">{displayInitial}</span>
                    )}
                  </div>
                  {userModalMode === 'edit' && (
                    <button
                      onClick={triggerFileInput}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full grid place-items-center hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
                      aria-label="Change profile picture"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{displayName}</h3>
                  <p className="text-gray-600">{profile?.email || ''}</p>
                  <p className="text-sm text-gray-500">{profile?.orgId || ''}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-900">{roleLabel}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">{(profile?.status || '').toString().toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {userModalMode === 'edit' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Profile Picture</h4>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full grid place-items-center overflow-hidden">
                    {profileImage ? (
                      <Image src={profileImage} alt="Profile Preview" width={80} height={80} className="w-20 h-20 object-cover rounded-full" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <button onClick={triggerFileInput} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-300">
                        Upload New
                      </button>
                      {profileImage && (
                        <button onClick={removeProfileImage} className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-300">
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.</p>
                  </div>
                </div>
                <input ref={fileInputRef} id="profile-file-input" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Upload profile image" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Active</label>
                <div className="text-sm font-medium text-gray-900">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : ''}</div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-3">Select Action</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserModalMode('view')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    userModalMode === 'view' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => setUserModalMode('edit')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    userModalMode === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Edit
                </button>
              </div>
            </div>

            {userModalMode === 'view' ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2 text-sm">
                  
                  <div className="flex justify-between"><span className="font-medium text-gray-700">Email:</span><span className="text-gray-900">{profile?.email || ''}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-gray-700">Role:</span><span className="text-gray-900">{roleLabel}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-gray-700">Organization:</span><span className="text-gray-900">{profile?.orgId || ''}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-gray-700">Status:</span><span className="text-gray-900">{(profile?.status || '').toString().toUpperCase()}</span></div>
                  <div className="flex justify-between"><span className="font-medium text-gray-700">Last Active:</span><span className="text-gray-900">{profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : ''}</span></div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Edit User Information</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="edit-first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input id="edit-first-name" type="text" defaultValue={profile?.firstName || ''} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label htmlFor="edit-last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input id="edit-last-name" type="text" defaultValue={profile?.lastName || ''} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input id="edit-email" type="email" defaultValue={profile?.email || ''} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select id="edit-role" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="ORG_MANAGER">Organization Admin</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Team Member</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-org" className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                    <input id="edit-org" type="text" defaultValue={profile?.orgId || ''} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="edit-status" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-300">
                {userModalMode === 'edit' ? 'Save Changes' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}