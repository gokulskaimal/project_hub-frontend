import React from "react";
import { USER_ROLES } from "@/utils/constants";

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
    <div className="bg-secondary/10 rounded-[2rem] p-8 mb-6 border border-border/50">
      <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
        Basic Information
      </h4>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-first" className="form-label">
              First Name
            </label>
            <input
              id="profile-first"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label htmlFor="profile-last" className="form-label">
              Last Name
            </label>
            <input
              id="profile-last"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
        <div>
          <label htmlFor="profile-email" className="form-label">
            Email Address
          </label>
          <input
            id="profile-email"
            disabled={disableEmail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`form-input focus:ring-none ${disableEmail ? "opacity-40" : ""}`}
          />
        </div>
        {showRole && (
          <div>
            <label htmlFor="profile-role" className="form-label">
              Role
            </label>
            <select
              id="profile-role"
              className="form-input bg-secondary/50 border-white/5 text-[11px] font-black uppercase tracking-wider"
              defaultValue={(role || "").toUpperCase()}
            >
              <option value={USER_ROLES.ORG_MANAGER} className="bg-card">
                Organization Manager
              </option>
              <option value={USER_ROLES.SUPER_ADMIN} className="bg-card">
                Super Admin
              </option>
              <option value={USER_ROLES.TEAM_MEMBER} className="bg-card">
                Team Member
              </option>
            </select>
          </div>
        )}
        {showStatus && (
          <div>
            <label htmlFor="profile-status" className="form-label">
              Status
            </label>
            <select
              id="profile-status"
              className="form-input bg-secondary/50 border-white/5 text-[11px] font-black uppercase tracking-wider"
              defaultValue={(status || "ACTIVE").toUpperCase()}
            >
              <option value="ACTIVE" className="bg-card">
                Active
              </option>
              <option value="INACTIVE" className="bg-card">
                Inactive
              </option>
              <option value="SUSPENDED" className="bg-card">
                Suspended
              </option>
            </select>
          </div>
        )}

        {showChangePassword && (
          <>
            <div className="pt-2 border-t border-border/50" />
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6 mt-6">
              Change Password
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="current-password" className="form-label">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword && setCurrentPassword(e.target.value)
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="form-label">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword && setNewPassword(e.target.value)
                  }
                  className="form-input"
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="form-label">
                  Confirm New Password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) =>
                    setConfirmNewPassword &&
                    setConfirmNewPassword(e.target.value)
                  }
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onChangePassword}
                disabled={!!changingPassword}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${changingPassword ? "bg-secondary text-muted-foreground cursor-not-allowed" : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg shadow-primary/20"}`}
              >
                {changingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </>
        )}

        {onSave && (
          <div className="flex justify-end">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-300"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
