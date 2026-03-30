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
import { useSendInviteMutation } from "@/store/api/managerApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";
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
  const [sendInvite, { isLoading }] = useSendInviteMutation();

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
      if (onSuccess) onSuccess();
      onClose();
      setInvites([
        { email: "", role: USER_ROLES.TEAM_MEMBER, expiry: "7 Days" },
      ]);
    } catch (err) {
      notifier.error(err, "Failed to send some invitations");
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl shadow-inner">
                        <UserPlus className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-gray-900 tracking-tight leading-none"
                        >
                          Assemble Your Team
                        </Dialog.Title>
                        <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">
                          Expansion Protocol
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {invites.map((invite, index) => (
                        <div
                          key={index}
                          className="group flex gap-4 items-end animate-in fade-in slide-in-from-bottom-2 duration-200"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-6 space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 flex items-center gap-1.5 ml-1">
                                <Mail className="w-3 h-3" /> Email Address
                              </label>
                              <input
                                type="email"
                                required
                                value={invite.email}
                                onChange={(e) =>
                                  updateRow(index, "email", e.target.value)
                                }
                                placeholder="pioneer@company.com"
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-gray-900"
                              />
                            </div>
                            <div className="md:col-span-3 space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 flex items-center gap-1.5 ml-1">
                                <ShieldCheck className="w-3 h-3" /> Role
                              </label>
                              <select
                                value={invite.role}
                                onChange={(e) =>
                                  updateRow(index, "role", e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-black text-gray-900"
                              >
                                <option value={USER_ROLES.TEAM_MEMBER}>
                                  Team Member
                                </option>
                                <option value={USER_ROLES.ORG_MANAGER}>
                                  Manager
                                </option>
                              </select>
                            </div>
                            <div className="md:col-span-3 space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-tighter text-gray-400 flex items-center gap-1.5 ml-1">
                                <Clock className="w-3 h-3" /> Expiry
                              </label>
                              <select
                                value={invite.expiry}
                                onChange={(e) =>
                                  updateRow(index, "expiry", e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-black text-gray-900"
                              >
                                <option value="7 Days">7 Days</option>
                                <option value="14 Days">14 Days</option>
                                <option value="30 Days">30 Days</option>
                              </select>
                            </div>
                          </div>
                          {invites.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRow(index)}
                              className="mb-1 p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
                      className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Another Field
                    </button>

                    <div className="bg-gray-50 -mx-10 -mb-6 px-10 py-8 mt-10 flex flex-row-reverse gap-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center items-center gap-2 rounded-xl bg-gray-900 px-10 py-3.5 text-sm font-black text-white shadow-2xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-50 min-w-[180px]"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Dispatch Invites
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Discard
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
