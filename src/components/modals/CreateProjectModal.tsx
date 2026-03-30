"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
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
  const { data: members = [] } = useGetManagerMembersQuery(undefined, {
    skip: !isOpen,
  });

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                {/* Stepper Header */}
                <div className="bg-gray-50/50 px-10 pt-10 pb-8 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-black text-gray-900 tracking-tight"
                      >
                        Create New Project
                      </Dialog.Title>
                      <p className="text-sm font-medium text-gray-500 mt-1">
                        Step {step} of 3:{" "}
                        {step === 1
                          ? "Basic Information"
                          : step === 2
                            ? "Project Details"
                            : "Build Your Team"}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between relative max-w-md mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />
                    <div
                      className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                    {[1, 2, 3].map((num) => (
                      <div
                        key={num}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${
                            step >= num
                              ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
                              : "bg-white border-2 border-gray-200 text-gray-400"
                          }`}
                        >
                          {step > num ? <Check className="w-5 h-5" /> : num}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="px-10 py-10">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <Input
                        label="Project Name"
                        required
                        size="lg"
                        placeholder="e.g. Q3 Marketing Blitz"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900">
                          Description
                        </label>
                        <textarea
                          rows={4}
                          className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 p-4 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                          placeholder="What's the mission?"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="grid grid-cols-2 gap-6">
                        <Input
                          label="Start Date"
                          type="date"
                          size="lg"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                        />
                        <Input
                          label="Target End Date"
                          type="date"
                          size="lg"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900">
                            Priority Level
                          </label>
                          <select
                            className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            value={formData.priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                priority: e.target.value,
                              })
                            }
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900">
                            Initial Status
                          </label>
                          <select
                            className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                          >
                            <option value="PLANNING">Planning</option>
                            <option value="ACTIVE">Active</option>
                            <option value="ON_HOLD">On Hold</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900">
                          Project Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black ring-1 ring-blue-100"
                            >
                              {tag}
                              <button
                                onClick={() => removeTag(tag)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add tags (Frontend, SEO...)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), addTag())
                            }
                            containerClassName="flex-1"
                          />
                          <button
                            type="button"
                            onClick={addTag}
                            className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-xl transition-all"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <Input
                        placeholder="Search for team members..."
                        leftIcon={<Search className="w-5 h-5" />}
                        size="lg"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                      />

                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredMembers.map((member) => {
                          const isSelected = formData.teamMemberIds.includes(
                            member.id,
                          );
                          return (
                            <div
                              key={member.id}
                              onClick={() => toggleMember(member.id)}
                              className={`group flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50/50"
                                  : "border-gray-50 hover:border-blue-200 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${
                                    isSelected
                                      ? "bg-blue-600 text-white"
                                      : "bg-white text-gray-400 border border-gray-100"
                                  }`}
                                >
                                  {(member.firstName || "U").charAt(0)}
                                </div>
                                <div>
                                  <h4
                                    className={`text-sm font-black ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                                  >
                                    {member.firstName || "Unknown"}{" "}
                                    {member.lastName || ""}
                                  </h4>
                                  <p className="text-xs font-medium text-gray-600">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-200 group-hover:border-blue-300"
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

                <div className="bg-gray-50 px-10 py-8 flex items-center justify-between">
                  {step > 1 ? (
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 bg-blue-600 px-8 py-3.5 rounded-xl text-sm font-black text-white shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className="inline-flex items-center justify-center gap-2 bg-gray-900 px-10 py-3.5 rounded-xl text-sm font-black text-white shadow-2xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-50 min-w-[180px]"
                    >
                      {isCreating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Deploy Project"
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
