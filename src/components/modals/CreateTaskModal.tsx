"use client";

import { useState, useEffect, Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Layout,
  Type,
  AlignLeft,
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
import { USER_ROLES } from "@/utils/constants";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (type?: Task["type"]) => void;
  projectId: string;
  projectMembers: User[];
  task?: Task | null; // If provided, we are in Edit mode
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
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

  const { data: rawTasks = [] } = useGetProjectTasksQuery(
    { projectId },
    { skip: !projectId || !isOpen },
  );

  const allTasks = useMemo(() => {
    if (Array.isArray(rawTasks)) return rawTasks;
    return rawTasks?.items || [];
  }, [rawTasks]);

  const epic = useMemo(
    () => allTasks.filter((t: Task) => t.type == "EPIC"),
    [allTasks],
  );
  const potentialParents = useMemo(
    () => allTasks.filter((t: Task) => t.type !== "EPIC"),
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
      setEpicId(task.epicId || "");
      setParentTaskId(task.parentTaskId || "");
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
    setEpicId("");
    setParentTaskId("");
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
          epicId: type === "STORY" ? epicId || null : null,
          parentTaskId:
            type === "TASK" || type === "BUG" ? parentTaskId || null : null,
          sprintId: type === "EPIC" ? null : sprintId || null,
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
      onSuccess(type);
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
              <Dialog.Panel className="relative transform overflow-hidden modal-surface text-left transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl shadow-inner">
                        <Layout className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-foreground tracking-tight leading-none uppercase"
                        >
                          {isEdit ? "Edit Task" : "Create New Task"}
                        </Dialog.Title>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                          Every great project starts with a single step
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

                  {isLocked && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                      <Lock size={14} />
                      {isDone
                        ? "Task finished & locked"
                        : "Waiting for manager review"}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                          <label className="form-label flex items-center gap-2">
                            <Type className="w-3.5 h-3.5 text-primary" />
                            Task Name
                          </label>
                          <input
                            type="text"
                            required
                            disabled={isLocked}
                            className="form-input"
                            placeholder="ENTER TASK NAME..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="form-label flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            Task Type
                          </label>
                          <select
                            disabled={isLocked}
                            className="form-select"
                            value={type}
                            onChange={(e) =>
                              setType(e.target.value as Task["type"])
                            }
                          >
                            <option value="STORY">STORY 📘</option>
                            <option value="BUG">BUG 🐞</option>
                            <option value="TASK">TASK 📋</option>
                            <option value="EPIC">EPIC 🏆</option>
                          </select>
                        </div>
                      </div>

                      {/* Link to Epic (Only for Stories) */}
                      {type === "STORY" && (
                        <div className="space-y-2">
                          <label className="form-label flex items-center gap-2">
                            <Layout className="w-3.5 h-3.5 text-primary" />
                            Epic / Project Goal
                          </label>
                          <select
                            disabled={isLocked}
                            className="form-select"
                            value={epicId}
                            onChange={(e) => setEpicId(e.target.value)}
                          >
                            <option value="">No Epic</option>
                            {epic.map((e: Task) => (
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
                          <label className="form-label flex items-center gap-2">
                            <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />
                            Part of Task
                          </label>
                          <select
                            disabled={isLocked}
                            className="form-select"
                            value={parentTaskId}
                            onChange={(e) => setParentTaskId(e.target.value)}
                          >
                            <option value="">Main Task</option>
                            {potentialParents.map((t: Task) => (
                              <option key={t.id} value={t.id}>
                                {t.title} ({t.type})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="form-label flex items-center gap-2">
                          <AlignLeft className="w-3.5 h-3.5 text-indigo-500" />
                          Description
                        </label>
                        <textarea
                          rows={4}
                          disabled={isLocked}
                          className="form-input min-h-[120px] resize-none"
                          placeholder="ENTER TASK DETAILS..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-secondary/10 rounded-[2rem] border border-border/50">
                      <div className="space-y-2">
                        <label className="form-label">Status</label>
                        <select
                          disabled={isLocked}
                          className="form-select text-[10px] font-black uppercase"
                          value={status}
                          onChange={(e) =>
                            setStatus(e.target.value as Task["status"])
                          }
                        >
                          <option value="TODO">TO DO 📥</option>
                          <option value="IN_PROGRESS">IN PROGRESS ⚡</option>
                          <option value="REVIEW">REVIEWING 🔍</option>
                          <option value="DONE">FINISHED ✅</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="form-label">Priority</label>
                        <select
                          disabled={isLocked}
                          className={`form-select text-[10px] font-black uppercase
                            ${priority === "CRITICAL" ? "text-rose-500" : priority === "HIGH" ? "text-amber-500" : "text-foreground"}
                          `}
                          value={priority}
                          onChange={(e) =>
                            setPriority(e.target.value as Task["priority"])
                          }
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p === "CRITICAL"
                                ? "CRITICAL 🚨"
                                : p === "HIGH"
                                  ? "HIGH 🔴"
                                  : p === "MEDIUM"
                                    ? "MEDIUM 🟡"
                                    : "LOW 🟢"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="form-label">Points</label>
                        <select
                          disabled={isLocked}
                          className="form-select text-[10px] font-black"
                          value={storyPoints}
                          onChange={(e) =>
                            setStoryPoints(Number(e.target.value))
                          }
                        >
                          {VALID_STORY_POINTS.map((v) => (
                            <option key={v} value={v}>
                              {v} PTS
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="form-label">Deadline</label>
                        <input
                          type="date"
                          disabled={isLocked}
                          min={projectStart}
                          max={projectEnd}
                          className="form-input text-xs font-black"
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
                            className="form-select"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                          >
                            <option value="">NOT ASSIGNED</option>
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
                            className="form-select"
                            value={sprintId}
                            onChange={(e) => setSprintId(e.target.value)}
                          >
                            <option value="">NOT IN A SPRINT</option>
                            {sprints.map((sprint) => (
                              <option key={sprint.id} value={sprint.id}>
                                {sprint.name}{" "}
                                {sprint.status === "ACTIVE" ? "(CURRENT)" : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="bg-secondary/10 -mx-8 -mb-4 px-8 py-6 mt-8 flex flex-row-reverse gap-4 border-t border-border/50">
                      {!isLocked && (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-8 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                          ) : isEdit ? (
                            "Save Changes"
                          ) : (
                            "Create Task"
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        className="px-8 py-3.5 border border-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        {isLocked ? "Close" : "Cancel"}
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
