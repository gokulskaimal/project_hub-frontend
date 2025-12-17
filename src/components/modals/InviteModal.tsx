import { useState } from 'react';
import { X, Plus, Trash2, Loader2, Send } from 'lucide-react';
import { useInvites } from '@/hooks/useInvites';
import api, { API_ROUTES } from '@/utils/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const { invites, addInvite, removeInvite, updateInvite, canSend, errors } = useInvites();
  const [isSending, setIsSending] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!canSend) return;

    const getDays = (str: string) => {
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[0]) : 1;
    };

    setIsSending(true);
    try {
      await Promise.all(
        invites.map((invite) =>
          api.post(API_ROUTES.AUTH.INVITE_MEMBER, {
            email: invite.email,
            role: invite.role === "Manager" ? "ORG MANAGER" : "TEAM MEMBER",
            orgId: user?.orgId,
            expiresIn: getDays(invite.expiry)
          })
        )
      );
      toast.success(`Successfully sent ${invites.length} invitation(s)`);
      onSuccess?.();
      onClose();
    } catch (error: any) {
      // Use the standardized message from api.ts interceptor
      const message = error.message || "Failed to send invitations";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Invite Team Members</h2>
            <p className="text-sm text-gray-500">Add members to your organization</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {invites.map((invite, index) => (
              <div key={index} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={invite.email}
                      onChange={(e) => updateInvite(index, 'email', e.target.value)}
                      placeholder="colleague@company.com"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        errors && errors[index] ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-2 outline-none transition-all text-sm text-gray-900 placeholder-gray-500`}
                    />
                    {errors && errors[index] && (
                      <p className="text-xs text-red-500 mt-1">{errors[index]}</p>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={invite.role}
                        onChange={(e) => updateInvite(index, 'role', e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white text-gray-900"
                      >
                        <option value="Team Member">Team Member</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Expiry</label>
                      <select
                        value={invite.expiry}
                        onChange={(e) => updateInvite(index, 'expiry', e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white text-gray-900"
                      >
                        <option value="7 Days">7 Days</option>
                        <option value="14 Days">14 Days</option>
                        <option value="30 Days">30 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
                {invites.length > 1 && (
                  <button
                    onClick={() => removeInvite(index)}
                    className="mt-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addInvite}
            className="mt-6 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add another member
          </button>
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!canSend || isSending}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Invites
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}