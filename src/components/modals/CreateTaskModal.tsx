"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Layout,
  Type,
  AlignLeft,
  Calendar,
  Flag,
  User as UserIcon,
  Loader2,
  Sparkles,
  CheckCircle2,
  Lock,
} from "lucide-react";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetProjectSprintsQuery,
  useGetProjectByIdQuery,
  useGetProjectTasksQuery,
} from "@/store/api/projectApiSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { User } from "@/types/auth";
import { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types/project";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";
import { USER_ROLES, PRIORITY_LEVELS } from "@/utils/constants";
import UserAvatar from "@/components/ui/UserAvatar";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  projectMembers: User[];
  task?: Task | null; // If provided, we are in Edit mode
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TYPES = ["TASK", "BUG", "STORY", "EPIC"];
const VALID_STORY_POINTS = [0, 1, 2, 3, 5, 8, 13];

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  projectMembers,
  task,
}: CreateTaskModalProps) {
  // Auth State for Locking Logic
  const role = useSelector((state: RootState) => state.auth.role);
  const isManager =
    role === USER_ROLES.ORG_MANAGER ||
    role === USER_ROLES.SUPER_ADMIN ||
    role === "ADMIN";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("TODO");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [type, setType] = useState<Task["type"]>("TASK");
  const [storyPoints, setStoryPoints] = useState(0);
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [epicId, setEpicId] = useState("");
  const [parentTaskId, setParentTaskId] = useState("");

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const { data: sprints = [] } = useGetProjectSprintsQuery(projectId, {
    skip: !projectId || !isOpen,
  });
  const { data: project } = useGetProjectByIdQuery(projectId, {
    skip: !projectId || !isOpen,
  });

  const { data: allTasks = [] } = useGetProjectTasksQuery(
    { projectId },
    { skip: !projectId || !isOpen },
  );

  const epic = useMemo(
    () => allTasks.filter((t) => t.type == "EPIC"),
    [allTasks],
  );
  const potentialParents = useMemo(
    () => allTasks.filter((t) => t.type !== "EPIC"),
    [allTasks],
  );
  const isEdit = !!task;
  const isLoading = isCreating || isUpdating;

  // Lock Logic from "perfect" state
  const isDone = task?.status === "DONE";
  const isReview = task?.status === "REVIEW";
  const isLocked = isEdit && (isDone || (!isManager && isReview));

  const projectStart = project?.startDate
    ? new Date(project.startDate).toISOString().split("T")[0]
    : "";
  const projectEnd = project?.endDate
    ? new Date(project.endDate).toISOString().split("T")[0]
    : "";

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setType(task.type);
      setStoryPoints(task.storyPoints || 0);
      setAssignedTo(task.assignedTo || "");
      setDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      );
      setSprintId(task.sprintId || "");
    } else {
      resetForm();
    }
  }, [task, isOpen]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setPriority("MEDIUM");
    setType("TASK");
    setStoryPoints(0);
    setAssignedTo("");
    setDueDate("");
    setSprintId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    try {
      if (isEdit && task) {
        const updateData: UpdateTaskPayload = {
          title,
          description: description || undefined,
          status,
          priority,
          type,
          epicId: type === "STORY" ? epicId || undefined : undefined,
          parentTaskId:
            type === "TASK" || type === "BUG"
              ? parentTaskId || undefined
              : undefined,
          sprintId: type === "EPIC" ? undefined : sprintId || undefined,
          storyPoints: Number(storyPoints),
          assignedTo: assignedTo || undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        };
        await updateTask({ id: task.id, data: updateData, projectId }).unwrap();
        notifier.success(MESSAGES.TASKS.UPDATE_SUCCESS);
      } else {
        const createData: CreateTaskPayload = {
          projectId,
          title,
          description: description || undefined,
          priority,
          type: type as "STORY" | "BUG" | "TASK" | "EPIC",
          epicId: type === "STORY" ? epicId || undefined : undefined,
          parentTaskId:
            type === "TASK" || type === "BUG"
              ? parentTaskId || undefined
              : undefined,
          storyPoints: Number(storyPoints),
          assignedTo: assignedTo || undefined,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        };
        await createTask({ projectId, data: createData }).unwrap();
        notifier.success(MESSAGES.TASKS.CREATE_SUCCESS);
      }
      onSuccess();
      onClose();
    } catch (err) {
      notifier.error(
        err,
        isEdit ? MESSAGES.TASKS.SAVE_FAILED : MESSAGES.TASKS.CREATE_FAILED,
      );
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-[2rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="bg-white px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl shadow-inner">
                        <Layout className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-gray-900 tracking-tight leading-none"
                        >
                          {isEdit ? "Refine Task" : "Launch New Task"}
                        </Dialog.Title>
                        <p className="text-xs font-medium text-gray-600 mt-1">
                          Every great project starts with a single step
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

                  {isLocked && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center gap-3">
                      <Lock size={18} />
                      {isDone
                        ? "This task is completed and locked for edits."
                        : "This task is currently under manager review and cannot be modified."}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Type className="w-4 h-4 text-blue-500" />
                            Task Title
                          </label>
                          <input
                            type="text"
                            required
                            disabled={isLocked}
                            className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-blue-500 focus:bg-white transition-all text-base px-4 py-3 font-bold text-gray-900 disabled:opacity-50"
                            placeholder="what needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            Task Type
                          </label>
                          <select
                            disabled={isLocked}
                            className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-purple-500 focus:bg-white transition-all text-sm px-4 py-3 font-bold text-gray-900"
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                          >
                            <option value="STORY">Story 📘</option>
                            <option value="BUG">Bug 🐞</option>
                            <option value="TASK">Task 📋</option>
                            <option value="EPIC">Epic 🏆</option>
                          </select>
                        </div>
                      </div>

                      {/* Link to Epic (Only for Stories) */}
                      {type === "STORY" && (
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Layout className="w-4 h-4 text-blue-500" />
                            Link to Epic
                          </label>
                          <select
                            disabled={isLocked}
                            className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-blue-500 focus:bg-white transition-all text-sm px-4 py-3 font-bold text-gray-900"
                            value={epicId}
                            onChange={(e) => setEpicId(e.target.value)}
                          >
                            <option value="">No Epic (Backlog Story)</option>
                            {epic.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Parent Task (Only for Tasks/Bugs) */}
                      {(type === "TASK" || type === "BUG") && (
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-indigo-500" />
                            Parent Story/Task
                          </label>
                          <select
                            disabled={isLocked}
                            className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-indigo-500 focus:bg-white transition-all text-sm px-4 py-3 font-bold text-gray-900"
                            value={parentTaskId}
                            onChange={(e) => setParentTaskId(e.target.value)}
                          >
                            <option value="">No Parent (Root Task)</option>
                            {potentialParents.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title} ({t.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-indigo-500" />
                          Description
                        </label>
                        <textarea
                          rows={4}
                          disabled={isLocked}
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-indigo-500 focus:bg-white transition-all text-sm p-4 text-gray-900 font-bold leading-relaxed disabled:opacity-50"
                          placeholder="add context, details, or steps..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                          Status
                        </label>
                        <select
                          disabled={isLocked}
                          className="block w-full rounded-xl border-white bg-white shadow-sm outline-none border-2 focus:border-blue-500 transition-all text-xs font-black text-gray-900 py-2 px-3"
                          value={status}
                          onChange={(e) => setStatus(e.target.value as any)}
                        >
                          <option value="TODO">Backlog</option>
                          <option value="IN_PROGRESS">Active</option>
                          <option value="REVIEW">Quality Check</option>
                          <option value="DONE">Completed</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                          Priority
                        </label>
                        <select
                          disabled={isLocked}
                          className={`block w-full rounded-xl border-white bg-white shadow-sm outline-none border-2 focus:border-orange-500 transition-all text-xs font-black py-2 px-3
                            ${priority === "CRITICAL" ? "text-red-600" : priority === "HIGH" ? "text-orange-600" : "text-gray-900"}
                          `}
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as any)}
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                          Story Points
                        </label>
                        <select
                          disabled={isLocked}
                          className="block w-full rounded-xl border-white bg-white shadow-sm outline-none border-2 focus:border-green-500 transition-all text-xs font-black text-gray-900 py-2 px-3"
                          value={storyPoints}
                          onChange={(e) =>
                            setStoryPoints(Number(e.target.value))
                          }
                        >
                          {VALID_STORY_POINTS.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                          Due Date
                        </label>
                        <input
                          type="date"
                          disabled={isLocked}
                          min={projectStart}
                          max={projectEnd}
                          className="block w-full rounded-xl border-white bg-white shadow-sm outline-none border-2 focus:border-purple-500 transition-all text-xs font-black text-gray-900 py-2 px-3 disabled:opacity-50"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-blue-500" />
                          Assignee
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          <select
                            disabled={isLocked}
                            className="block w-full rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-0 text-sm font-bold text-gray-900 py-2.5 disabled:opacity-50"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                          >
                            <option value="">Unassigned</option>
                            {projectMembers.map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.firstName} {member.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {type !== "EPIC" && (
                        <div className="space-y-3">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Sprint
                          </label>
                          <select
                            disabled={isLocked}
                            className="block w-full rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-0 text-sm font-bold text-gray-900 py-2.5 disabled:opacity-50"
                            value={sprintId}
                            onChange={(e) => setSprintId(e.target.value)}
                          >
                            <option value="">Backlog (No Sprint)</option>
                            {sprints.map((sprint) => (
                              <option key={sprint.id} value={sprint.id}>
                                {sprint.name}{" "}
                                {sprint.status === "ACTIVE" ? "(Current)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 -mx-8 -mb-4 px-8 py-6 mt-8 flex flex-row-reverse gap-4">
                      {!isLocked && (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex justify-center items-center rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-black text-white shadow-2xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : isEdit ? (
                            "Update Changes"
                          ) : (
                            "Create Task"
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        {isLocked ? "Close" : "Discard"}
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
