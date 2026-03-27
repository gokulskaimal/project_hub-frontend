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
                      <div className="p-3 bg-orange-50 rounded-xl">
                        <Zap className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-gray-900 leading-none"
                        >
                          Initialize Sprint
                        </Dialog.Title>
                        <p className="text-sm font-medium text-gray-400 mt-1">
                          Accelerate your team&apos;s momentum
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
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-orange-500" />
                        Sprint Name
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="block w-full rounded-xl border-gray-100 bg-gray-100 outline-none border-2 px-4 py-3 font-medium text-gray-500 cursor-not-allowed"
                        value={sprintName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" />
                        Primary Goal
                      </label>
                      <textarea
                        rows={3}
                        className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-orange-500 focus:bg-white transition-all p-4 text-sm text-gray-900 font-bold leading-relaxed"
                        placeholder="What's the main focus of this sprint?"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          required
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-orange-500 focus:bg-white transition-all px-4 py-2.5 text-sm text-gray-900 font-bold"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">
                          Sprint Duration
                        </label>
                        <select
                          className="block w-full rounded-xl border-gray-100 bg-gray-50/50 outline-none border-2 focus:border-orange-500 focus:bg-white transition-all px-4 py-2.5 text-sm font-bold text-gray-900"
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

                    <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100">
                      <p className="text-xs text-orange-800 font-medium leading-relaxed">
                        <strong>Note:</strong> Starting this sprint will move it
                        to the active state. Currently{" "}
                        <strong>{taskCount}</strong> tasks are assigned.
                      </p>
                    </div>

                    <div className="bg-gray-50 -mx-8 -mb-4 px-8 py-6 mt-8 flex flex-row-reverse gap-4">
                      <button
                        type="submit"
                        className="inline-flex justify-center items-center rounded-xl bg-orange-600 px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-100 hover:bg-orange-700 transition-all min-w-[140px]"
                      >
                        Launch Sprint
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                        onClick={onClose}
                      >
                        Discard
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
