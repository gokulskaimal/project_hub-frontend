'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { logout, hydrateFromStorage } from '@/features/auth/authSlice';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getFriendlyError } from '@/utils/errors';
import { confirmWithAlert } from '@/utils/confirm';
import UserInfoView from '@/components/profile/UserInfoView';
import EditUserForm from '@/components/profile/EditUserForm';

type InviteForm = { email: string; role: 'Team Member' | 'Admin' | 'Manager'; expiry: '7 Days' | '14 Days' | '30 Days' };
type UserMode = 'view' | 'edit';
type Member = { id: string; email: string; firstName?: string; lastName?: string; name?: string; role?: string; status?: string };

export default function DashboardPage() {
  const { isLoggedIn, role } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Hydrate auth from localStorage on client mount
    dispatch(hydrateFromStorage());
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    // Check if user is logged in and has the correct role
    // Allow both normalized and non-normalized versions of manager role
    const isValidManager = isLoggedIn && (role === 'org-manager' || role === 'manager');
    if (!isValidManager) {
      router.push('/login');
    }
  }, [authChecked, isLoggedIn, role, router]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };
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

  
  const openUserModal = (mode: UserMode = 'view') => {
    setUserModalMode(mode);
    if (!token && typeof window !== 'undefined') {
      const t = localStorage.getItem('accessToken');
      if (t) setToken(t);
    }
    setTimeout(() => setShowUserModal(true), 0);
  };

  const sidebarLinks = [
    { name: 'Dashboard', active: true },
    // { name: 'Projects' },
    // { name: 'Kanban Board' },
    // { name: 'Calendar' },
    // { name: 'Chat' },
    // { name: 'Tickets' },
    // { name: 'Team' },
    // { name: 'Billing' },
    // { name: 'Settings', borderTop: true },
  ];

  const [invites, setInvites] = useState<InviteForm[]>([{ email: '', role: 'Team Member', expiry: '7 Days' }]);
  const addInvite = () => setInvites((i) => [...i, { email: '', role: 'Team Member', expiry: '7 Days' }]);
  const removeInvite = (index: number) => setInvites((i) => (i.length > 1 ? i.filter((_, k) => k !== index) : i));
  const updateInvite = (index: number, field: keyof InviteForm, value: InviteForm[keyof InviteForm]) =>
    setInvites((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  const canSend = invites.every((i) => i.email.trim().length > 3 && i.email.includes('@'));

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', []);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Array<{ email: string; orgId: string; status?: string; createdAt?: string; token?: string }>>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setToken(t);
  }, []);
  const sendInvites = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) throw new Error('Not authenticated');
      const headers = { Authorization: `Bearer ${token}` };
      const emails = invites.map((i) => i.email.trim()).filter(Boolean);
      await axios.post(`${apiBase}/api/manager/bulk-invite`, { emails }, { headers });
      
      // Fetch updated invitations list
      await refetchInvitations();
      
      toast.success(`Sent ${emails.length} invitation${emails.length !== 1 ? 's' : ''}`);
      setShowInviteModal(false);
      
      // Clear the invites form
      setInvites([{ email: '', role: 'Team Member', expiry: '7 Days' }]);
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to send invitations'));
    }
  };

  const fetchAll = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [membersRes, invitesRes] = await Promise.all([
        axios.get(`${apiBase}/api/manager/members`, { headers }),
        axios.get(`${apiBase}/api/manager/invitations`, { headers }),
      ]);
      const all: Member[] = membersRes.data?.data || [];
      const filtered = all.filter((u: Member) => (u.role || '').toUpperCase() !== 'ORG_MANAGER');
      setMembers(filtered);
      setInvitations(invitesRes.data?.data || []);
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, apiBase]);

  const refetchMembers = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const membersRes = await axios.get(`${apiBase}/api/manager/members`, { headers });
      setMembers(membersRes.data?.data || []);
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to refresh members'));
    }
  };

  const refetchInvitations = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${apiBase}/api/manager/invitations`, { headers });
      setInvitations(res.data?.data || []);
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to refresh invitations'));
    }
  };

  const onUpdateStatus = async (memberId: string, nextStatus: 'ACTIVE' | 'BLOCKED') => {
    const confirmed = await confirmWithAlert(
      nextStatus === 'BLOCKED' ? 'Block this user? They will lose access.' : 'Unblock this user? They will regain access.',
      nextStatus === 'BLOCKED' ? 'Yes, Block' : 'Yes, Unblock'
    );
    if (!confirmed) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${apiBase}/api/manager/members/${memberId}/status`, { status: nextStatus }, { headers });
      toast.success(nextStatus === 'BLOCKED' ? 'User blocked' : 'User unblocked');
      await refetchMembers();
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to update status'));
    }
  };

  const onRemoveMember = async (memberId: string) => {
    const confirmed = await confirmWithAlert('Remove this member? This cannot be undone.', 'Yes, Remove');
    if (!confirmed) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiBase}/api/manager/members/${memberId}`, { headers });
      toast.success('User removed');
      await refetchMembers();
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to remove user'));
    }
  };

  const onCancelInvitation = async (tokenToCancel: string) => {
    const confirmed = await confirmWithAlert('Cancel this invitation?', 'Yes, Cancel');
    if (!confirmed) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${apiBase}/api/manager/invitations/${encodeURIComponent(tokenToCancel)}`, { headers });
      toast.success('Invitation cancelled');
      await refetchInvitations();
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to cancel invitation'));
    }
  };

  // Profile state and update
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!showUserModal) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${apiBase}/api/user/profile`, { headers });
        const d = res.data?.data || {};
        setProfileFirstName(d.firstName || '');
        setProfileLastName(d.lastName || '');
        setProfileEmail(d.email || '');
        setProfileName(d.name || '');
      } catch {
        /* ignore */
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserModal, token]);

  const computedName = useMemo(() => {
    const full = `${profileFirstName || ''} ${profileLastName || ''}`.trim();
    if (full) return full;
    const n = (profileName || '').trim();
    if (n) return n;
    const e = (profileEmail || '').trim();
    if (e) return (e.split('@')[0] || e);
    return 'User';
  }, [profileFirstName, profileLastName, profileName, profileEmail]);

  const computedInitial = useMemo(() => (computedName?.[0] || profileEmail?.[0] || 'U').toUpperCase(), [computedName, profileEmail]);

  const onSaveProfile = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${apiBase}/api/user/profile`, { firstName: profileFirstName, lastName: profileLastName, email: profileEmail }, { headers });
      toast.success('Profile updated');
      setShowUserModal(false);
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to update profile'));
    }
  };

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setChangingPassword(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${apiBase}/api/user/change-password`, { currentPassword, newPassword, confirmNewPassword }, { headers });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      toast.error(getFriendlyError(err, 'Failed to change password'));
    } finally {
      setChangingPassword(false);
    }
  };

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
              } `}
            >
              <span className="w-5 h-5 inline-block bg-gray-100 rounded" />
              <span className="text-sm font-medium">{item.name}</span>
            </a>
          ))}
          <button
            onClick={handleLogout}
            className="mt-6 w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-red-700 hover:bg-red-50 border border-red-200"
          >
            <span className="w-5 h-5 inline-block bg-red-100 rounded" />
            <span className="text-sm font-medium">Logout</span>
          </button>
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
              className="flex-1 bg-transparent text-sm text-black placeholder-gray-700 outline-none"
              placeholder="Search projects, tasks, users..."
              aria-label="Global search"
            />
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5">
              <span className="text-xs text-black">⌘</span>
              <span className="text-xs text-black">K</span>
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
                <span className="text-sm font-medium text-gray-900">{computedInitial}</span>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">Organization Dashboard</h1>
              <p className="text-black">Manage your team, projects, and organization performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
              >
                <span className="w-4 h-4 rounded bg-blue-600 inline-flex" />
                <span className="text-sm text-black font-medium">Invite Team</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-2 focus:ring-gray-300">
                <span className="w-4 h-4 rounded bg-gray-600 inline-flex" />
                <span className="text-sm font-medium">New Project</span>
              </button>
            </div>
          </div>

          {/* Stat Cards
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
          </section> */}

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
                  <h3 className="font-medium text-black">View Profile</h3>
                  <p className="text-sm text-black">Manage your account settings</p>
                </div>
              </button>
              <button
                onClick={() => openUserModal('edit')}
                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left focus:ring-2 focus:ring-gray-300"
              >
                <span className="w-10 h-10 bg-green-100 rounded-lg" />
                <div>
                  <h3 className="font-medium text-black">Edit Profile</h3>
                  <p className="text-sm text-black">Update your information</p>
                </div>
              </button>
              {/* <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left focus:ring-2 focus:ring-gray-300">
                <span className="w-10 h-10 bg-purple-100 rounded-lg" />
                <div>
                  <h3 className="font-medium text-black">View Reports</h3>
                  <p className="text-sm text-black">Check performance metrics</p>
                </div>
              </button> */}
            </div>
          </section>

          {/* Members */}
          <section className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Organization Members</h2>
            {loading ? (
              <div>Loading...</div>
            ) : members.length === 0 ? (
              <div>No members found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900">
                  <thead>
                    <tr className="text-left text-black font-medium">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="py-2 pr-4 text-gray-900">{m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || '-'}</td>
                        <td className="py-2 pr-4 text-gray-900">{m.email}</td>
                        <td className="py-2 pr-4 text-gray-900">{m.role || 'MEMBER'}</td>
                        <td className="py-2 pr-4 text-gray-900">{m.status || 'ACTIVE'}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            {m.status === 'BLOCKED' ? (
                              <button className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" onClick={() => onUpdateStatus(m.id, 'ACTIVE')} title="Unblock user">Unblock</button>
                            ) : (
                              <button className="px-3 py-1 rounded bg-yellow-600 text-white hover:bg-yellow-700" onClick={() => onUpdateStatus(m.id, 'BLOCKED')} title="Block user">Block</button>
                            )}
                            <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => onRemoveMember(m.id)} title="Remove user">Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Invitations */}
          <section className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-black mb-4">Pending Invitations</h2>
            {loading ? (
              <div>Loading...</div>
            ) : invitations.filter((inv) => inv.status === 'PENDING').length === 0 ? (
              <div>No pending invitations.</div>
            ) : (
              <ul className="divide-y">
                {invitations
                  .filter((inv) => inv.status === 'PENDING')
                  .map((inv, idx) => (
                    <li key={idx} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-black">{inv.email}</div>
                        <div className="text-xs text-black">{inv.status || 'PENDING'}</div>
                      </div>
                      {inv.token && (
                        <button className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 transition-colors" onClick={() => onCancelInvitation(inv.token!)}>Cancel</button>
                      )}
                    </li>
                  ))}
              </ul>
            )}
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
              <h2 className="text-lg font-semibold text-black mb-1">Invite Team Members</h2>
              <p className="text-sm text-black">Send invitations to new team members to join your organization</p>
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
                        <label htmlFor={`invite-email-${idx}`} className="block text-sm font-medium text-black mb-2">Email Address</label>
                        <input
                          id={`invite-email-${idx}`}
                          type="email"
                          placeholder="team.member@company.com"
                          value={invite.email}
                          onChange={(e) => updateInvite(idx, 'email', e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm text-black placeholder-black placeholder-opacity-60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`invite-role-${idx}`} className="block text-sm font-medium text-black mb-2">Role</label>
                          <select
                            id={`invite-role-${idx}`}
                            title="Select role"
                            value={invite.role}
                            onChange={(e) => updateInvite(idx, 'role', e.target.value as InviteForm['role'])}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm text-black bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option className="text-black">Team Member</option>
                            <option className="text-black">Admin</option>
                            <option className="text-black">Manager</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor={`invite-expiry-${idx}`} className="block text-sm font-medium text-black mb-2">Invite Expires (Days)</label>
                          <select
                            id={`invite-expiry-${idx}`}
                            title="Select expiry"
                            value={invite.expiry}
                            onChange={(e) => updateInvite(idx, 'expiry', e.target.value as InviteForm['expiry'])}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm text-black bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option className="text-black">7 Days</option>
                            <option className="text-black">14 Days</option>
                            <option className="text-black">30 Days</option>
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
                <span className="text-sm font-medium text-black">Add Another Invitation</span>
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
                  className="px-4 py-2.5 border border-gray-200 rounded-md text-sm font-medium text-black hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={sendInvites}
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
                {userModalMode === 'edit' ? `Edit User: ${computedName}` : `Manage User: ${computedName}`}
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
                      <span className="text-xl font-medium text-gray-900">{computedInitial}</span>
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
                  <h3 className="text-lg font-medium text-gray-900">{computedName}</h3>
                  <p className="text-gray-900">{profileEmail || '-'}</p>
                  <p className="text-sm text-gray-500">&nbsp;</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-900">{(role || '').toUpperCase()}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">ACTIVE</span>
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
                    <p className="text-xs text-black">JPG, PNG or GIF. Max size 2MB. Recommended 400x400px.</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" aria-label="Upload profile image" />
              </div>
            )}
{/* 
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Active</label>
                <div className="text-sm font-medium text-gray-900">15/02/2024</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Subscription Expiry</label>
                <div className="text-sm font-medium text-gray-900">2024-12-31</div>
              </div>
            </div> */}

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
              <UserInfoView email={profileEmail || '-'} name={computedName} role={(role || '').toString()} status={'ACTIVE'} />
            ) : (
              <EditUserForm
                firstName={profileFirstName}
                lastName={profileLastName}
                email={profileEmail}
                role={(role || '').toString()}
                status={'ACTIVE'}
                disableEmail={true}
                showRole={true}
                showStatus={true}
                setFirstName={setProfileFirstName}
                setLastName={setProfileLastName}
                setEmail={setProfileEmail}
                showChangePassword={true}
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmNewPassword={confirmNewPassword}
                setCurrentPassword={setCurrentPassword}
                setNewPassword={setNewPassword}
                setConfirmNewPassword={setConfirmNewPassword}
                onChangePassword={onChangePassword}
                changingPassword={changingPassword}
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-300" onClick={() => { if (userModalMode === 'edit') onSaveProfile(); else setShowUserModal(false); }}>
                {userModalMode === 'edit' ? 'Save Changes' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ); 
}
 