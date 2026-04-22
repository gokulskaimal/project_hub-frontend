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
  if (!profile || !profile.state) return null; // Failsafe for profile hook

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in"
        onClick={handleClose}
      />

      <div className="relative glass-card border-white/5 w-full max-w-2xl p-10 max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <button
          onClick={handleClose}
          className="absolute top-8 right-8 p-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group active:scale-95"
        >
          <svg
            className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-3xl font-black text-foreground mb-2 uppercase tracking-tighter italic">
            {isEdit ? "Edit Profile Node" : "Manage Profile Node"}
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
            {isEdit
              ? "Synchronizing personal parameters with the neural network"
              : "Analytical overview of current operative identifier"}
          </p>
        </div>

        {/* Profile Header (Image & Name) */}
        <div className="bg-secondary/10 border border-white/5 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative">
              <div className="p-1 rounded-full bg-gradient-to-tr from-primary to-violet-500 shadow-xl shadow-primary/20">
                <UserAvatar
                  user={{
                    firstName: state.firstName,
                    lastName: state.lastName,
                    email: state.email,
                    name: state.computedName,
                    avatar: state.profileImage,
                  }}
                  size="lg"
                  className="!border-4 !border-card border-solid"
                />
              </div>

              {isEdit && (
                <button
                  onClick={actions.triggerFileInput}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full grid place-items-center hover:bg-violet-600 shadow-lg shadow-primary/40 transition-all active:scale-90"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-3">
              <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">
                {state.computedName}
              </h3>
              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 italic">
                {state.email}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                <span className="px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/20">
                  {displayRole}
                </span>
                <span className="px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ACTIVE NODE
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
        <div className="mb-8 flex bg-secondary/20 rounded-[1.5rem] p-1.5 border border-white/5 backdrop-blur-sm">
          {["view", "edit"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m as "view" | "edit")}
              className={`flex-1 px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-[1rem] transition-all duration-500 ${
                mode === m
                  ? "bg-primary text-white shadow-xl shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
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
              showRole={false}
              showStatus={false}
              setFirstName={setters.setFirstName}
              setLastName={setters.setLastName}
              setEmail={() => {}}
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
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={handleClose}
            className="px-8 py-4 bg-secondary/20 border border-white/5 text-foreground rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-secondary/40 transition-all active:scale-95"
          >
            Abort Session
          </button>
          {isEdit && (
            <button
              onClick={handleSaveProfile}
              disabled={state.loading}
              className="px-10 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-violet-600 shadow-xl shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
            >
              {state.loading ? "Synchronizing..." : "Finalize Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
