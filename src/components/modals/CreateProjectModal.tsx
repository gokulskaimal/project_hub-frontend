"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import {
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  Target,
  Check,
  Search,
  Briefcase,
} from "lucide-react";
import {
  useCreateProjectMutation,
  useGetManagerMembersQuery,
} from "@/store/api/managerApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Input } from "@/components/ui/Input";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [memberSearch, setMemberSearch] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkEmails, setBulkEmails] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNING" as const as any, // Temporary bypass to match Partial<Project>
    priority: "MEDIUM" as const as any,
    tags: [] as string[],
    teamMemberIds: [] as string[],
  });

  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  const { data: membersData = { items: [], total: 0 } } =
    useGetManagerMembersQuery(
      { page: 1, limit: 1000 },
      {
        skip: !isOpen,
      },
    );

  const members = membersData.items;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        status: "PLANNING" as any,
        priority: "MEDIUM" as any,
        tags: [],
        teamMemberIds: [],
      });
      setMemberSearch("");
      setTagInput("");
    }
  }, [isOpen]);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.name.trim()) {
        notifier.error(null, "Project name is required");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (
        formData.endDate &&
        formData.startDate &&
        new Date(formData.endDate) < new Date(formData.startDate)
      ) {
        notifier.error(null, "End date cannot be before start date");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const toggleMember = (memberId: string) => {
    setFormData((prev) => {
      const exists = prev.teamMemberIds.includes(memberId);
      if (exists) {
        return {
          ...prev,
          teamMemberIds: prev.teamMemberIds.filter((id) => id !== memberId),
        };
      } else {
        return { ...prev, teamMemberIds: [...prev.teamMemberIds, memberId] };
      }
    });
  };

  const handleSelectAll = () => {
    const currentFilteredIds = filteredMembers.map((m) => m.id);
    setFormData((prev) => ({
      ...prev,
      teamMemberIds: Array.from(
        new Set([...prev.teamMemberIds, ...currentFilteredIds]),
      ),
    }));
  };

  const handleDeselectAll = () => {
    const currentFilteredIds = filteredMembers.map((m) => m.id);
    setFormData((prev) => ({
      ...prev,
      teamMemberIds: prev.teamMemberIds.filter(
        (id) => !currentFilteredIds.includes(id),
      ),
    }));
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
      setFormData((prev) => ({
        ...prev,
        teamMemberIds: Array.from(
          new Set([...prev.teamMemberIds, ...matchedIds]),
        ),
      }));
      notifier.success(`Selected ${matchedIds.length} members from list`);
      setBulkEmails("");
      setShowBulkAdd(false);
    } else {
      notifier.error(null, "No matching members found for those emails");
    }
  };

  const handleSubmit = async () => {
    try {
      await createProject(formData).unwrap();
      notifier.success(MESSAGES.PROJECTS.CREATE_SUCCESS);
      onSuccess();
      onClose();
    } catch (err) {
      notifier.error(err, MESSAGES.PROJECTS.CREATE_FAILED);
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      (m.firstName || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(memberSearch.toLowerCase()),
  );

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
              <Dialog.Panel className="relative transform overflow-hidden modal-surface transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 3) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>

                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        {step === 1 ? (
                          <Briefcase className="w-6 h-6 text-primary" />
                        ) : step === 2 ? (
                          <Target className="w-6 h-6 text-primary" />
                        ) : (
                          <Users className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-foreground tracking-tight leading-none uppercase"
                        >
                          {step === 1
                            ? "Initiate Node"
                            : step === 2
                              ? "Parameters"
                              : "Assemble Team"}
                        </Dialog.Title>
                        <p className="text-[10px] font-black text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                          Step {step} of 3 • Operation Provisioning
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

                  <div className="min-h-[400px]">
                    {step === 1 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                          <label className="form-label">Node Identifier</label>
                          <input
                            type="text"
                            required
                            placeholder="PROJECT QUANTUM"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="form-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="form-label">Mission Briefing</label>
                          <textarea
                            rows={4}
                            placeholder="DEFINE THE STRATEGIC OBJECTIVES..."
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            className="form-input min-h-[120px] resize-none"
                          />
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="form-label">Activation</label>
                            <input
                              type="date"
                              required
                              value={formData.startDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  startDate: e.target.value,
                                })
                              }
                              className="form-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="form-label">
                              Target Completion
                            </label>
                            <input
                              type="date"
                              required
                              value={formData.endDate}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  endDate: e.target.value,
                                })
                              }
                              className="form-input"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="form-label">Priority Tier</label>
                            <select
                              value={formData.priority}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  priority: e.target.value as any,
                                })
                              }
                              className="form-select"
                            >
                              <option value="LOW">LOW PRIORITY</option>
                              <option value="MEDIUM">MEDIUM PRIORITY</option>
                              <option value="HIGH">HIGH PRIORITY</option>
                              <option value="CRITICAL">CRITICAL</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="form-label">
                              Initial Protocol
                            </label>
                            <select
                              value={formData.status}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  status: e.target.value as any,
                                })
                              }
                              className="form-select"
                            >
                              <option value="PLANNING">PLANNING</option>
                              <option value="ACTIVE">ACTIVE</option>
                              <option value="ON_HOLD">ON HOLD</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="form-label">Operational Tags</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="hover:text-rose-500 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              placeholder="ADD SIGNAL TAGS..."
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addTag())
                              }
                              className="form-input"
                            />
                            <button
                              type="button"
                              onClick={addTag}
                              className="px-6 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary/80 transition-all"
                            >
                              Pin
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <input
                              placeholder="SCAN FOR OPERATIVES..."
                              className="form-input flex-1"
                              value={memberSearch}
                              onChange={(e) => setMemberSearch(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowBulkAdd(!showBulkAdd)}
                              className={`p-3 rounded-xl border transition-all ${
                                showBulkAdd
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "border-border text-muted-foreground hover:text-primary"
                              }`}
                            >
                              <Target className="w-5 h-5" />
                            </button>
                          </div>

                          {showBulkAdd && (
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                              <label className="text-[10px] font-black text-primary uppercase tracking-widest">
                                Bulk Signal Entry
                              </label>
                              <textarea
                                rows={3}
                                className="form-input !text-xs !bg-card"
                                placeholder="EMAILS SEPARATED BY COMMAS..."
                                value={bulkEmails}
                                onChange={(e) => setBulkEmails(e.target.value)}
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={handleBulkAddEmails}
                                  className="bg-primary text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all"
                                >
                                  Identify
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between px-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                              {formData.teamMemberIds.length} AUTHORIZED
                            </p>
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={handleSelectAll}
                                className="text-[9px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors"
                              >
                                Authorize All
                              </button>
                              <button
                                type="button"
                                onClick={handleDeselectAll}
                                className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
                              >
                                Prune
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                          {filteredMembers.map((member) => {
                            const isSelected = formData.teamMemberIds.includes(
                              member.id,
                            );
                            return (
                              <div
                                key={member.id}
                                onClick={() => toggleMember(member.id)}
                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-primary bg-primary/10"
                                    : "border-border/30 bg-secondary/10 hover:border-border/60 hover:bg-secondary/20"
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black uppercase ${
                                      isSelected
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-background text-muted-foreground border border-border/30"
                                    }`}
                                  >
                                    {(member.firstName || "U").charAt(0)}
                                  </div>
                                  <div>
                                    <h4
                                      className={`text-[13px] font-black uppercase tracking-tight ${
                                        isSelected
                                          ? "text-primary"
                                          : "text-foreground"
                                      }`}
                                    >
                                      {member.firstName} {member.lastName}
                                    </h4>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
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
                    )}
                  </div>
                </div>

                <div className="bg-secondary/10 px-10 py-8 flex items-center justify-between border-t border-border/50">
                  {step > 1 ? (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 bg-primary px-8 py-3.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all"
                    >
                      Proceed <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className="inline-flex items-center justify-center gap-2 bg-foreground px-10 py-3.5 rounded-xl text-[10px] font-black text-background uppercase tracking-widest hover:bg-foreground/90 shadow-2xl shadow-foreground/10 transition-all disabled:opacity-50 min-w-[200px]"
                    >
                      {isCreating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Initialize Node
                        </>
                      )}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
