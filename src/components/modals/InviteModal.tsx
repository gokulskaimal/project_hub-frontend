"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  Send,
  Mail,
  UserPlus,
  ShieldCheck,
  Clock,
} from "lucide-react";
import {
  useSendInviteMutation,
  useSendInvitationsMutation,
} from "@/store/api/managerApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { notifier } from "@/utils/notifier";
import { USER_ROLES } from "@/utils/constants";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InviteRow {
  email: string;
  role: string;
  expiry: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteModalProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [invites, setInvites] = useState<InviteRow[]>([
    { email: "", role: USER_ROLES.TEAM_MEMBER, expiry: "7 Days" },
  ]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");
  const [bulkRole, setBulkRole] = useState<string>(USER_ROLES.TEAM_MEMBER);

  const [sendInvite, { isLoading: singleLoading }] = useSendInviteMutation();
  const [sendInvitations, { isLoading: bulkLoading }] =
    useSendInvitationsMutation();

  const isLoading = singleLoading || bulkLoading;

  const addRow = () => {
    setInvites([
      ...invites,
      { email: "", role: USER_ROLES.TEAM_MEMBER, expiry: "7 Days" },
    ]);
  };

  const removeRow = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: keyof InviteRow, value: string) => {
    const newInvites = [...invites];
    newInvites[index] = { ...newInvites[index], [field]: value };
    setInvites(newInvites);
  };

  const getDays = (str: string) => {
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[0]) : 7;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.orgId) {
      notifier.error(null, "Organization ID not found");
      return;
    }

    const validInvites = invites.filter((i) => i.email.trim());
    if (validInvites.length === 0) {
      notifier.error(null, "Please add at least one email");
      return;
    }

    try {
      if (isBulkMode) {
        const emails = bulkEmails
          .split(/[\n,]/)
          .map((e) => e.trim())
          .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

        if (emails.length === 0) {
          notifier.error(null, "No valid email addresses found");
          return;
        }

        await sendInvitations({
          emails,
          role: bulkRole,
          expiresIn: 7, // Default for bulk for simplicity, can be expanded
        }).unwrap();

        notifier.success(`Successfully sent ${emails.length} invites`);
      } else {
        await Promise.all(
          validInvites.map((invite) =>
            sendInvite({
              email: invite.email,
              role: invite.role,
              orgId: user.orgId!,
              expiresIn: getDays(invite.expiry),
            }).unwrap(),
          ),
        );
        notifier.success(
          `Successfully sent ${validInvites.length} invitation(s)`,
        );
      }
      if (onSuccess) onSuccess();
      onClose();
      setInvites([
        { email: "", role: USER_ROLES.TEAM_MEMBER, expiry: "7 Days" },
      ]);
    } catch (err) {
      notifier.error(err, "Failed to send some invites");
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden modal-surface transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-purple-500" />

                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-foreground tracking-tight leading-none uppercase"
                        >
                          Invite Your Team
                        </Dialog.Title>
                        <p className="text-[10px] font-black text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                          Add Members • Give Access
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex p-1 bg-secondary/30 rounded-xl mb-8 w-fit border border-border/50">
                    <button
                      onClick={() => setIsBulkMode(false)}
                      className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        !isBulkMode
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Single Invite
                    </button>
                    <button
                      onClick={() => setIsBulkMode(true)}
                      className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                        isBulkMode
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bulk Invite
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {isBulkMode ? (
                      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                          <label className="form-label !flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-primary" />
                            <span>Emails</span>
                          </label>
                          <textarea
                            value={bulkEmails}
                            onChange={(e) => setBulkEmails(e.target.value)}
                            placeholder="EMAIL1@GMAIL.COM, EMAIL2@GMAIL.COM..."
                            rows={8}
                            className="form-input !text-xs !font-black uppercase tracking-widest placeholder:opacity-40"
                          />
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 italic">
                            * Comma or Line separated addresses
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="form-label !flex items-center gap-2">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Roles</span>
                            </label>
                            <select
                              value={bulkRole}
                              onChange={(e) => setBulkRole(e.target.value)}
                              className="form-select"
                            >
                              <option
                                value={USER_ROLES.TEAM_MEMBER}
                                className="bg-card text-foreground"
                              >
                                TEAM MEMBER
                              </option>
                              <option
                                value={USER_ROLES.ORG_MANAGER}
                                className="bg-card text-foreground"
                              >
                                ORG MANAGER
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {invites.map((invite, index) => (
                            <div
                              key={index}
                              className="group flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-200"
                            >
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-6 space-y-2">
                                  <label className="form-label !flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-primary" />
                                    <span>Email Address</span>
                                  </label>
                                  <input
                                    type="email"
                                    required
                                    value={invite.email}
                                    onChange={(e) =>
                                      updateRow(index, "email", e.target.value)
                                    }
                                    placeholder="FRIEND@GMAIL.COM"
                                    className="form-input"
                                  />
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                  <label className="form-label !flex items-center gap-2">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Roles</span>
                                  </label>
                                  <select
                                    value={invite.role}
                                    onChange={(e) =>
                                      updateRow(index, "role", e.target.value)
                                    }
                                    className="form-select"
                                  >
                                    <option
                                      value={USER_ROLES.TEAM_MEMBER}
                                      className="bg-card text-foreground"
                                    >
                                      MEMBER
                                    </option>
                                    <option
                                      value={USER_ROLES.ORG_MANAGER}
                                      className="bg-card text-foreground"
                                    >
                                      MANAGER
                                    </option>
                                  </select>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                  <label className="form-label !flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Link Expires In</span>
                                  </label>
                                  <select
                                    value={invite.expiry}
                                    onChange={(e) =>
                                      updateRow(index, "expiry", e.target.value)
                                    }
                                    className="form-select"
                                  >
                                    <option
                                      value="7 Days"
                                      className="bg-card text-foreground"
                                    >
                                      7 DAYS
                                    </option>
                                    <option
                                      value="14 Days"
                                      className="bg-card text-foreground"
                                    >
                                      14 DAYS
                                    </option>
                                    <option
                                      value="30 Days"
                                      className="bg-card text-foreground"
                                    >
                                      30 DAYS
                                    </option>
                                  </select>
                                </div>
                              </div>
                              {invites.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeRow(index)}
                                  className="mt-8 p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={addRow}
                          className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:text-primary/80 bg-primary/10 px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest"
                        >
                          <Plus className="w-4 h-4" />
                          Add Email
                        </button>
                      </div>
                    )}

                    <div className="bg-secondary/10 -mx-10 -mb-6 px-10 py-8 mt-10 flex flex-row-reverse gap-4 border-t border-border/50">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-10 py-3.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50 min-w-[200px] flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Invite
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-10 py-3.5 border border-border text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary transition-all flex items-center justify-center"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
