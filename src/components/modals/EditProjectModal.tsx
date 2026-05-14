"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Layout,
  AlignLeft,
  Calendar,
  Loader2,
  Save,
  Sparkles,
  Target,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
  useUpdateManagerProjectMutation,
  useGetManagerMembersQuery,
} from "@/store/api/managerApiSlice";
import { Project } from "@/types/project";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  project: Project | null;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  onSuccess,
  project,
}: EditProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [key, setKey] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");

  const { data: membersData = { items: [], total: 0 } } =
    useGetManagerMembersQuery(
      { page: 1, limit: 1000 },
      {
        skip: !isOpen,
      },
    );

  const members = membersData.items;

  const filteredMembers = members.filter(
    (m) =>
      (m.firstName || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const handleSelectAll = () => {
    const currentFilteredIds = filteredMembers.map((m) => m.id);
    setTeamMemberIds((prev) =>
      Array.from(new Set([...prev, ...currentFilteredIds])),
    );
  };

  const handleDeselectAll = () => {
    const currentFilteredIds = filteredMembers.map((m) => m.id);
    setTeamMemberIds((prev) =>
      prev.filter((id) => !currentFilteredIds.includes(id)),
    );
  };

  const handleBulkAddEmails = () => {
    const emails = bulkEmails
      .split(/[\n,;]/)
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e);

    const matchedIds = members
      .filter((m) => emails.includes(m.email.toLowerCase()))
      .map((m) => m.id);

    if (matchedIds.length > 0) {
      setTeamMemberIds((prev) => Array.from(new Set([...prev, ...matchedIds])));
      notifier.success(`Selected ${matchedIds.length} members from list`);
      setBulkEmails("");
      setShowBulkAdd(false);
    } else {
      notifier.error(null, "No matching members found for those emails");
    }
  };

  const [updateProject, { isLoading }] = useUpdateManagerProjectMutation();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setKey(project.key || "");
      setStartDate(
        project.startDate
          ? new Date(project.startDate).toISOString().split("T")[0]
          : "",
      );
      setEndDate(
        project.endDate
          ? new Date(project.endDate).toISOString().split("T")[0]
          : "",
      );
      setTeamMemberIds(project.teamMemberIds || []);
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      await updateProject({
        id: project.id,
        data: {
          name,
          description,
          key,
          startDate: startDate ? new Date(startDate).toISOString() : undefined,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
          teamMemberIds,
        },
      }).unwrap();
      notifier.success(MESSAGES.PROJECTS.UPDATE_SUCCESS);
      onSuccess();
      onClose();
    } catch (err) {
      notifier.error(err, MESSAGES.PROJECTS.SAVE_FAILED);
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
              <Dialog.Panel className="relative transform overflow-hidden modal-surface transition-all sm:my-8 sm:w-full sm:max-w-xl">
                <div className="px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Layout className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-foreground tracking-tight leading-none uppercase"
                        >
                          Edit Project
                        </Dialog.Title>
                        <p className="text-[10px] font-black text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                          Update your project details
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

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3">
                        <Input
                          label="Project Name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          labelClassName="uppercase tracking-[0.2em]"
                        />
                      </div>
                      <Input
                        label={
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            Tag
                          </span>
                        }
                        required
                        maxLength={5}
                        className="text-center !font-black !text-primary uppercase tracking-widest"
                        value={key}
                        onChange={(e) => setKey(e.target.value.toUpperCase())}
                        labelClassName="uppercase tracking-[0.2em]"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="SEARCH TEAM MEMBERS..."
                            className="form-input !py-3 flex-1 text-xs font-black uppercase tracking-tight"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => setShowBulkAdd(!showBulkAdd)}
                            className={`p-3 rounded-xl border transition-all ${showBulkAdd ? "bg-primary/20 border-primary text-primary" : "bg-secondary/10 border-border/30 text-muted-foreground hover:text-primary"}`}
                            title="Bulk Add via Email List"
                          >
                            <Target className="w-5 h-5" />
                          </button>
                        </div>

                        {showBulkAdd && (
                          <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">
                              Add many emails
                            </label>
                            <textarea
                              rows={3}
                              className="form-input !text-[10px] !bg-card"
                              placeholder="PASTE EMAILS SEPARATED BY COMMAS..."
                              value={bulkEmails}
                              onChange={(e) => setBulkEmails(e.target.value)}
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={handleBulkAddEmails}
                                className="bg-primary text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all"
                              >
                                Add to Team
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between px-1">
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                            {teamMemberIds.length} ADDED
                          </p>
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={handleSelectAll}
                              className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                            >
                              Add All
                            </button>
                            <button
                              type="button"
                              onClick={handleDeselectAll}
                              className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredMembers.map((member) => {
                          const isSelected = teamMemberIds.includes(member.id);
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                setTeamMemberIds((prev) =>
                                  isSelected
                                    ? prev.filter((id) => id !== member.id)
                                    : [...prev, member.id],
                                );
                              }}
                              className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                                  : "border-border/30 bg-secondary/10 hover:border-border/60 hover:bg-secondary/20"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all uppercase ${
                                    isSelected
                                      ? "bg-primary text-white shadow-md shadow-primary/20"
                                      : "bg-secondary text-muted-foreground border border-border/30"
                                  }`}
                                >
                                  {(member.firstName || "U").charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <h4
                                    className={`text-[13px] font-black truncate uppercase tracking-tight ${isSelected ? "text-primary" : "text-foreground"}`}
                                  >
                                    {member.firstName} {member.lastName}
                                  </h4>
                                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate opacity-40">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-primary border-primary shadow-md shadow-primary/20"
                                    : "border-border/50 group-hover:border-primary/50"
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="form-label flex items-center gap-2">
                        <AlignLeft className="w-3.5 h-3.5 text-primary" />
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="form-input min-h-[100px]"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label={
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            Start Date
                          </span>
                        }
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        labelClassName="uppercase tracking-[0.2em]"
                      />
                      <Input
                        label={
                          <span className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            End Date
                          </span>
                        }
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        labelClassName="uppercase tracking-[0.2em]"
                      />
                    </div>

                    <div className="bg-secondary/10 -mx-8 -mb-4 px-8 py-6 mt-8 flex flex-row-reverse gap-4 border-t border-border/50">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50 min-w-[140px]"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-8 py-3.5 border border-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all"
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
