import { useEffect } from "react";
import Image from "next/image";
import UserInfoView from "@/components/profile/UserInfoView";
import EditUserForm from "@/components/profile/EditUserForm";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import UserAvatar from "@/components/ui/UserAvatar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

type ProfileHook = ReturnType<typeof useMemberProfile>;

interface UserModalProps {
  isOpen: boolean;
  mode: "view" | "edit";
  onClose: () => void;
  setMode: (mode: "view" | "edit") => void;
  profile: ProfileHook;
}

export default function UserModal({
  isOpen,
  mode,
  onClose,
  setMode,
  profile,
}: UserModalProps) {
  const { role } = useSelector((state: RootState) => state.auth);

  const { state, setters, actions, refs } = profile;
  const { loadProfile } = actions;

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen, loadProfile]);

  if (!isOpen) return null;

  const isEdit = mode === "edit";
  const displayRole = (role || "MEMBER").toUpperCase().replace(/-/g, " ");

  // Handler to save profile and switch back to view mode on success
  const handleSaveProfile = async () => {
    const success = await actions.updateProfile();
    if (success) setMode("view");
  };

  // Handler to close modal and reset password fields if needed
  const handleClose = () => {
    onClose();
    setters.setPasswords({ current: "", new: "", confirm: "" });
  };

  // Handler to change password
  const handleChangePassword = async () => {
    await actions.changePassword();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />
      <div className="relative bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100"
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {isEdit
              ? `Edit Profile: ${state.computedName}`
              : `Manage Profile: ${state.computedName}`}
          </h2>
          <p className="text-sm text-gray-600">
            {isEdit
              ? "Update your profile information and settings"
              : "View and manage your profile information"}
          </p>
        </div>

        {/* Profile Header (Image & Name) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <UserAvatar
                user={{
                  firstName: state.firstName,
                  lastName: state.lastName,
                  email: state.email,
                  name: state.computedName,
                  avatar: state.profileImage,
                }}
                size="lg"
              />

              {isEdit && (
                <button
                  onClick={actions.triggerFileInput}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full grid place-items-center hover:bg-blue-700"
                >
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {state.computedName}
              </h3>
              <p className="text-gray-600">{state.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-900">
                  {displayRole}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                  ACTIVE
                </span>
              </div>
            </div>
            {isEdit && (
              <input
                ref={refs.fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={actions.handleImageUpload}
              />
            )}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="mb-6 flex bg-gray-100 rounded-xl p-1">
          {["view", "edit"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as "view" | "edit")}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-xl transition-colors capitalize ${
                mode === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {mode === "view" ? (
          <UserInfoView
            email={state.email}
            name={state.computedName}
            role={displayRole}
            status="ACTIVE"
            organizationName={state.organizationName}
          />
        ) : (
          <EditUserForm
            firstName={state.firstName}
            lastName={state.lastName}
            email={state.email}
            role={displayRole}
            status="ACTIVE"
            disableEmail={true}
            showRole={false} // Hide role/status for self-edit
            showStatus={false}
            setFirstName={setters.setFirstName}
            setLastName={setters.setLastName}
            setEmail={() => {}} // Email is read-only here
            // Password props
            showChangePassword={true}
            currentPassword={state.passwords.current}
            newPassword={state.passwords.new}
            confirmNewPassword={state.passwords.confirm}
            setCurrentPassword={(v) =>
              setters.setPasswords((p) => ({ ...p, current: v }))
            }
            setNewPassword={(v) =>
              setters.setPasswords((p) => ({ ...p, new: v }))
            }
            setConfirmNewPassword={(v) =>
              setters.setPasswords((p) => ({ ...p, confirm: v }))
            }
            onChangePassword={handleChangePassword}
            changingPassword={state.loading}
          />
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-200 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
          {isEdit && (
            <button
              onClick={handleSaveProfile}
              disabled={state.loading}
              className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {state.loading ? "Saving Profile..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
