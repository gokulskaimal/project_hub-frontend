import React from "react";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  status?: string;
  disableEmail?: boolean;
  showRole?: boolean;
  showStatus?: boolean;
  onSave?: () => void;

  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;

  // Change password section
  showChangePassword?: boolean;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  setCurrentPassword?: (v: string) => void;
  setNewPassword?: (v: string) => void;
  setConfirmNewPassword?: (v: string) => void;
  onChangePassword?: () => void;
  changingPassword?: boolean;
};

export default function EditUserForm(props: Props) {
  const {
    firstName,
    lastName,
    email,
    role,
    status,
    disableEmail = false,
    showRole = true,
    showStatus = true,
    onSave,
    setFirstName,
    setLastName,
    setEmail,
    showChangePassword = true,
    currentPassword = "",
    newPassword = "",
    confirmNewPassword = "",
    setCurrentPassword,
    setNewPassword,
    setConfirmNewPassword,
    onChangePassword,
    changingPassword,
  } = props;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Edit User Information</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-first" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input id="profile-first" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="profile-last" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input id="profile-last" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input id="profile-email" disabled={disableEmail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${disableEmail ? 'text-gray-400' : 'text-gray-900'}`} />
        </div>
        {showRole && (
          <div>
            <label htmlFor="profile-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select id="profile-role" title="Select role" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue={(role || '').toUpperCase()}>
              <option value="ORG_MANAGER">Organization Manager</option>
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Team Member</option>
            </select>
          </div>
        )}
        {showStatus && (
          <div>
            <label htmlFor="profile-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="profile-status" title="Select status" className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" defaultValue={(status || 'ACTIVE').toUpperCase()}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        )}

        {showChangePassword && (
          <>
            <div className="pt-2 border-t border-gray-200" />
            <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword && setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword && setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword && setConfirmNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={onChangePassword} disabled={!!changingPassword} className={`px-4 py-2 rounded-md text-sm font-medium text-white ${changingPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 focus:ring-2 focus:ring-gray-300'}`}>
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </>
        )}

        {onSave && (
          <div className="flex justify-end">
            <button onClick={onSave} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-300">Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
