"use client";

import { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Calendar, Type, Loader2 } from "lucide-react";
import { useUpdateSprintMutation } from "@/store/api/projectApiSlice";
import { Sprint } from "@/types/project";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";

interface EditSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  sprint: Sprint | null;
}

export default function EditSprintModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  sprint,
}: EditSprintModalProps) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [updateSprint, { isLoading }] = useUpdateSprintMutation();

  useEffect(() => {
    if (sprint) {
      setName(sprint.name);
      setGoal(sprint.goal || "");
      setStartDate(new Date(sprint.startDate).toISOString().split("T")[0]);
      setEndDate(new Date(sprint.endDate).toISOString().split("T")[0]);
    }
  }, [sprint, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprint) return;

    try {
      await updateSprint({
        id: sprint.id,
        projectId,
        data: {
          name,
          goal,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
      }).unwrap();
      notifier.success(MESSAGES.SPRINTS.START_SUCCESS);
      onSuccess();
      onClose();
    } catch (err) {
      notifier.error(err, MESSAGES.SPRINTS.UPDATE_FAILED);
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
              <Dialog.Panel className="relative transform overflow-hidden modal-surface transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-purple-600" />
                <div className="px-8 pt-8 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-black text-foreground uppercase tracking-tight"
                    >
                      Edit Sprint
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="form-label mb-2 block">
                        Sprint Name
                      </label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          className="form-input !pl-12"
                          placeholder="SPRINT NAME..."
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label mb-2 block">
                        Sprint Goal
                      </label>
                      <textarea
                        rows={3}
                        className="form-input"
                        placeholder="DEFINE SPRINT GOAL..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="form-label mb-2 block">
                          Start Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="date"
                            required
                            className="form-input !pl-12"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="form-label mb-2 block">
                          End Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="date"
                            required
                            className="form-input !pl-12"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-10 -mx-8 -mb-6 px-8 py-6 bg-secondary/10 border-t border-border/50 flex flex-row-reverse gap-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          "Save Changes"
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
