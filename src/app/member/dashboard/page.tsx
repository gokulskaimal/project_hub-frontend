"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "@/store/store";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserInfoView from "@/components/profile/UserInfoView";
import EditUserForm from "@/components/profile/EditUserForm";
import axios from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { logout, hydrateFromStorage } from "@/features/auth/authSlice";
import { getFriendlyError } from "@/utils/errors";

export default function MemberDashboardPage() {
  const { isLoggedIn, role } = useSelector((s: RootState) => s.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Hydrate auth from localStorage on client mount
    dispatch(hydrateFromStorage());
    setAuthChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMember = useMemo(() => {
    const r = (role || "").toString().toLowerCase();
    return r === "member" || r === "user" || r === "team_member" || r === "team-member";
  }, [role]);

  useEffect(() => {
    if (!authChecked) return;
    if (!isLoggedIn || !isMember) router.push("/login");
  }, [authChecked, isLoggedIn, isMember, router]);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", []);
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") setToken(localStorage.getItem("accessToken"));
  }, []);

  // Profile state
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileName, setProfileName] = useState("");
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

  const computedName = useMemo(() => {
    const full = `${profileFirstName || ""} ${profileLastName || ""}`.trim();
    if (full) return full;
    if (profileName) return profileName;
    return profileEmail?.split("@")[0] || "User";
  }, [profileFirstName, profileLastName, profileName, profileEmail]);

  const computedInitial = useMemo(() => (computedName?.[0] || profileEmail?.[0] || 'U').toUpperCase(), [computedName, profileEmail]);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<"view" | "edit">("view");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Load profile when modal opens first time
  useEffect(() => {
    const loadProfile = async () => {
      if (!showUserModal || !token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${apiBase}/api/user/profile`, { headers });
        const d = res.data?.data || res.data || {};
        setProfileEmail(d.email || "");
        setProfileFirstName(d.firstName || "");
        setProfileLastName(d.lastName || "");
        setProfileName(d.name || "");
      } catch (err) {
        toast.error(getFriendlyError(err, "Failed to load profile"));
      }
    };
    loadProfile();
  }, [showUserModal, token, apiBase]);

  const onSaveProfile = async () => {
    const schema = z.object({
      firstName: z.string().min(2, 'First name too short'),
      lastName: z.string().min(2, 'Last name too short'),
    });
    const parsed = schema.safeParse({ firstName: profileFirstName, lastName: profileLastName });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${apiBase}/api/user/profile`, { firstName: profileFirstName, lastName: profileLastName }, { headers });
      toast.success("Profile updated");
      setShowUserModal(false);
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to update profile"));
    }
  };

  const onChangePassword = async () => {
    const schema = z
      .object({
        currentPassword: z.string().trim().min(1, 'Please enter your current password'),
        newPassword: z.string().trim().min(8, 'New password must be at least 8 characters'),
        confirmNewPassword: z.string().trim(),
      })
      .refine((d) => d.newPassword === d.confirmNewPassword, {
        message: 'New passwords do not match',
        path: ['confirmNewPassword'],
      });
    const parsed = schema.safeParse({ currentPassword, newPassword, confirmNewPassword });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? 'Invalid input');
      return;
    }
    try {
      setChangingPassword(true);
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(
        `${apiBase}/api/user/change-password`,
        {
          currentPassword: parsed.data.currentPassword,
          newPassword: parsed.data.newPassword,
          confirmNewPassword: parsed.data.confirmNewPassword,
        },
        { headers }
      );
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(getFriendlyError(err, "Failed to change password"));
    } finally {
      setChangingPassword(false);
    }
  };

  const openUserModal = (mode: "view" | "edit" = "view") => {
    setUserModalMode(mode);
    if (!token && typeof window !== "undefined") {
      const t = localStorage.getItem("accessToken");
      if (t) setToken(t);
    }
    setTimeout(() => setShowUserModal(true), 0);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  // Handle ESC key to close modals
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowUserModal(false);
      }
    };
    if (showUserModal) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [showUserModal]);

  return (
    <DashboardLayout title="Member Dashboard" onLogout={handleLogout}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Work</h2>
            <div className="flex gap-2">
              <button className={`px-3 py-1.5 text-sm border rounded text-black hover:bg-gray-50 focus:ring-2 focus:ring-gray-300`} onClick={() => openUserModal("view")}>View Profile</button>
              <button className={`px-3 py-1.5 text-sm border rounded text-black hover:bg-gray-50 focus:ring-2 focus:ring-gray-300`} onClick={() => openUserModal("edit")}>Edit Profile</button>
            </div>
          </div>
          <div className="text-sm text-gray-600">Your projects and tasks will appear here.</div>
        </section>
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Assigned Tasks</span><span>—</span></div>
            <div className="flex justify-between"><span>Open Tickets</span><span>—</span></div>
            <div className="flex justify-between"><span>Active Projects</span><span>—</span></div>
          </div>
        </section>
      </div>

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
              <h2 className="text-lg font-semibold text-black mb-1">
                {userModalMode === "edit" ? `Edit Profile: ${computedName}` : `Manage Profile: ${computedName}`}
              </h2>
              <p className="text-sm text-black">
                {userModalMode === "edit" ? "Update your profile information and settings" : "View and manage your profile information"}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-100 rounded-full grid place-items-center overflow-hidden">
                    {profileImage ? (
                      <Image src={profileImage} alt="Profile" width={64} height={64} className="w-16 h-16 object-cover rounded-full" />
                    ) : (
                      <span className="text-xl font-medium text-black">{computedInitial}</span>
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
                  <h3 className="text-lg font-medium text-black">{computedName}</h3>
                  <p className="text-black">{profileEmail || '-'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-200 text-black">MEMBER</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {userModalMode === 'edit' && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-black mb-3">Profile Picture</h4>
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

            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-3">Select Action</label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserModalMode('view')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    userModalMode === 'view' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => setUserModalMode('edit')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    userModalMode === 'edit' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Edit
                </button>
              </div>
            </div>

            {userModalMode === 'view' ? (
              <UserInfoView email={profileEmail || '-'} name={computedName} role={'MEMBER'} status={'ACTIVE'} />
            ) : (
              <EditUserForm
                firstName={profileFirstName}
                lastName={profileLastName}
                email={profileEmail}
                role={'MEMBER'}
                status={'ACTIVE'}
                disableEmail={true}
                showRole={false}
                showStatus={false}
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

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowUserModal(false)} className="px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-black hover:bg-gray-50 focus:ring-2 focus:ring-gray-300">Close</button>
              {userModalMode === 'edit' && (
                <button onClick={onSaveProfile} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-300">Save Changes</button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
