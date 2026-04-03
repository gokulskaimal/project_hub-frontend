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
  Users,
} from "lucide-react";
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

  const { data: membersData } = useGetManagerMembersQuery(
    { page: 1, limit: 100 },
    { skip: !isOpen },
  );

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
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                <div className="bg-white px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <Layout className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-gray-900 tracking-tight leading-none"
                        >
                          Update Project
                        </Dialog.Title>
                        <p className="text-sm font-medium text-gray-400 mt-1">
                          Refining the vision
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-3 space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          Project Name
                        </label>
                        <input
                          type="text"
                          required
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-blue-500 focus:bg-white transition-all px-4 py-3 font-medium text-gray-800"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          Key
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-purple-500 focus:bg-white transition-all px-4 py-3 font-black text-center text-blue-600 uppercase"
                          value={key}
                          onChange={(e) => setKey(e.target.value.toUpperCase())}
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic leading-tight">
                          * Prefix for Task IDs (e.g. {key || "PRJ"}-1)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        Project Members
                      </label>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200">
                        {membersData?.items.map((member) => (
                          <label
                            key={member.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                              teamMemberIds.includes(member.id)
                                ? "border-blue-500 bg-blue-50/50"
                                : "border-gray-50 bg-white hover:border-gray-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={teamMemberIds.includes(member.id)}
                              onChange={() => {
                                setTeamMemberIds((prev) =>
                                  prev.includes(member.id)
                                    ? prev.filter((id) => id !== member.id)
                                    : [...prev, member.id],
                                );
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-gray-900 truncate">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">
                                {member.role}
                              </p>
                            </div>
                            {teamMemberIds.includes(member.id) && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-blue-500" />
                        Description
                      </label>
                      <textarea
                        rows={3}
                        className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-blue-500 focus:bg-white transition-all p-4 text-sm text-gray-600 leading-relaxed"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-blue-500 focus:bg-white transition-all px-4 py-2.5 text-sm"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          End Date
                        </label>
                        <input
                          type="date"
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-blue-500 focus:bg-white transition-all px-4 py-2.5 text-sm"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 -mx-8 -mb-4 px-8 py-6 mt-8 flex flex-row-reverse gap-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center items-center rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50 min-w-[140px]"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
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
