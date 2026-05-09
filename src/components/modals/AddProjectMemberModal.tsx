"use client";

import { useState, Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Search, Check, Users, Loader2 } from "lucide-react";
import {
  useGetManagerMembersQuery,
  useUpdateManagerProjectMutation,
} from "@/store/api/managerApiSlice";
import { notifier } from "@/utils/notifier";
import UserAvatar from "@/components/ui/UserAvatar";
import { Project } from "@/types/project";

interface AddProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSuccess?: () => void;
}

export default function AddProjectMemberModal({
  isOpen,
  onClose,
  project,
  onSuccess,
}: AddProjectMemberModalProps) {
  const { data: allMembers, isLoading: membersLoading } =
    useGetManagerMembersQuery({
      page: 1,
      limit: 100, // Fetch first 100 members for selection
      status: "ACTIVE",
    });

  const [updateProject, { isLoading: isUpdating }] =
    useUpdateManagerProjectMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    project.teamMemberIds || [],
  );

  const members = useMemo(() => {
    if (!allMembers?.items) return [];
    return allMembers.items;
  }, [allMembers]);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        (member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        member.status === "ACTIVE",
    );
  }, [members, searchTerm]);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    try {
      await updateProject({
        id: project.id,
        data: { teamMemberIds: selectedIds },
      }).unwrap();

      notifier.success("Project team updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      notifier.error(err, "Failed to update project team");
    }
  };

  const currentMemberIds = project.teamMemberIds || [];
  const addedCount = selectedIds.filter(
    (id) => !currentMemberIds.includes(id),
  ).length;
  const removedCount = currentMemberIds.filter(
    (id) => !selectedIds.includes(id),
  ).length;

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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden modal-surface text-left transition-all sm:my-8 sm:w-full sm:max-w-xl">
                {/* Header Style */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-600" />

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-black text-foreground uppercase tracking-tighter">
                          Authorize Node Team
                        </Dialog.Title>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-0.5 opacity-60">
                          {project.name}
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

                  {/* Search Bar */}
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="SCAN FOR OPERATIVES..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input !pl-12 !py-4 text-xs font-black uppercase tracking-tight"
                    />
                  </div>

                  {/* Members List */}
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {membersLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                          QUERYING REGISTRY...
                        </span>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="text-center py-12 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                          NO CANDIDATES REGISTERED
                        </p>
                      </div>
                    ) : (
                      filteredMembers.map((member) => {
                        const isSelected = selectedIds.includes(member.id);
                        return (
                          <div
                            key={member.id}
                            onClick={() => toggleMember(member.id)}
                            className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                : "border-border/30 bg-secondary/10 hover:border-border hover:bg-secondary/20"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <UserAvatar user={member} size="sm" />
                              <div className="min-w-0">
                                <p className="text-sm font-black text-foreground uppercase tracking-tight">
                                  {member.firstName} {member.lastName}
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40 truncate">
                                    {member.email}
                                  </p>
                                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary/10 text-primary rounded-lg">
                                    {member.role}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                                  : "border-border/50 group-hover:border-primary/50"
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer Stats */}
                  <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between">
                    <div className="flex gap-4">
                      {addedCount > 0 || removedCount > 0 ? (
                        <div className="flex items-center gap-2">
                          {addedCount > 0 && (
                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-emerald-500/20">
                              +{addedCount} NEW
                            </span>
                          )}
                          {removedCount > 0 && (
                            <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-rose-500/20">
                              -{removedCount} PRUNED
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                          {selectedIds.length} ACTIVE OPERATIVES
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                      >
                        Abort
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="px-8 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-3"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Commit Roster"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
