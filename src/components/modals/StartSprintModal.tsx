"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, PlayCircle, Calendar, Target, Loader2, Zap } from "lucide-react";
import { useCreateSprintMutation } from "@/store/api/projectApiSlice";
import { notifier } from "@/utils/notifier";
import { MESSAGES } from "@/constants/messages";

interface StartSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    goal: string;
    startDate: string;
    endDate: string;
  }) => void;
  sprintName: string;
  taskCount: number;
}

export default function StartSprintModal({
  isOpen,
  onClose,
  onConfirm,
  sprintName,
  taskCount,
}: StartSprintModalProps) {
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("2"); // weeks
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + parseInt(duration) * 7);

    onConfirm({
      goal,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
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
                      <div className="p-3 bg-amber-500/10 rounded-xl">
                        <Zap className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-foreground leading-none uppercase tracking-tight"
                        >
                          Initialize Sprint
                        </Dialog.Title>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
                          Accelerate your team&apos;s momentum
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
                    <div className="space-y-2">
                      <label className="form-label flex items-center gap-2">
                        <PlayCircle className="w-3.5 h-3.5 text-amber-500" />
                        Sprint Identifier
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="form-input opacity-50 cursor-not-allowed bg-secondary/20"
                        value={sprintName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="form-label flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-amber-500" />
                        Mission Goal
                      </label>
                      <textarea
                        rows={3}
                        className="form-input"
                        placeholder="DEFINE TARGET OBJECTIVE..."
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="form-label flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          Start Node
                        </label>
                        <input
                          type="date"
                          required
                          className="form-input"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="form-label">Timeline Focus</label>
                        <select
                          className="form-select"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                        >
                          <option value="1">1 Week</option>
                          <option value="2">2 Weeks</option>
                          <option value="3">3 Weeks</option>
                          <option value="4">4 Weeks</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
                      <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest leading-relaxed">
                        <strong className="text-amber-400">WARNING:</strong>{" "}
                        INITIALIZING THIS SPRINT WILL SHIFT THE TIMELINE TO
                        ACTIVE STATE. CURRENTLY{" "}
                        <strong className="text-amber-400">{taskCount}</strong>{" "}
                        TASKS ARE ASSIGNED.
                      </p>
                    </div>

                    <div className="bg-secondary/10 -mx-8 -mb-4 px-8 py-6 mt-8 flex flex-row-reverse gap-4 border-t border-border/50">
                      <button
                        type="submit"
                        className="px-8 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all min-w-[140px]"
                      >
                        Launch Sprint
                      </button>
                      <button
                        type="button"
                        className="px-8 py-3.5 border border-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all"
                        onClick={onClose}
                      >
                        Abort
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
