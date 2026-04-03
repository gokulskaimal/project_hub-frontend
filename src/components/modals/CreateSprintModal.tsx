"use client";

import React, { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Calendar,
  Target,
  Clock,
  Loader2,
  Sparkles,
  AlignLeft,
  Flag,
} from "lucide-react";
import {
  useGetProjectByIdQuery,
  useCreateSprintMutation,
  useUpdateSprintMutation,
} from "@/store/api/projectApiSlice";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sprint } from "@/types/project";

interface CreateSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId: string;
  sprint?: Sprint | null; // Added for editing
}

const sprintSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Sprint name must be at least 3 characters long")
      .max(100, "Sprint name must not exceed 100 characters"),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
    goal: z.string().trim().optional(),
    description: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

type SprintFormData = z.infer<typeof sprintSchema>;

export default function CreateSprintModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  sprint = null,
}: CreateSprintModalProps) {
  const isEdit = !!sprint;

  const { data: project } = useGetProjectByIdQuery(projectId, {
    skip: !isOpen || !projectId,
  });

  const [createSprint, { isLoading: isCreating }] = useCreateSprintMutation();
  const [updateSprint, { isLoading: isUpdating }] = useUpdateSprintMutation();
  const loading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SprintFormData>({
    resolver: zodResolver(sprintSchema),
    mode: "onTouched",
  });

  const projectStart = project?.startDate
    ? new Date(project.startDate).toISOString().split("T")[0]
    : "";
  const projectEnd = project?.endDate
    ? new Date(project.endDate).toISOString().split("T")[0]
    : "";

  useEffect(() => {
    if (isOpen) {
      if (sprint) {
        reset({
          name: sprint.name,
          startDate: sprint.startDate
            ? new Date(sprint.startDate).toISOString().split("T")[0]
            : "",
          endDate: sprint.endDate
            ? new Date(sprint.endDate).toISOString().split("T")[0]
            : "",
          goal: sprint.goal || "",
          description: sprint.description || "",
        });
      } else {
        reset({
          name: `Sprint ${new Date().toLocaleDateString()}`,
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          goal: "",
          description: "",
        });
      }
    }
  }, [isOpen, sprint, reset]);

  const onSubmit = async (data: SprintFormData) => {
    try {
      if (isEdit && sprint) {
        await updateSprint({
          id: sprint.id,
          projectId,
          data: {
            name: data.name,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            goal: data.goal,
            description: data.description,
          },
        }).unwrap();
        notifier.success(
          MESSAGES.SPRINTS.UPDATE_SUCCESS || "Sprint updated successfully",
        );
      } else {
        await createSprint({
          projectId,
          name: data.name,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
          goal: data.goal,
          description: data.description,
        }).unwrap();
        notifier.success(MESSAGES.SPRINTS.CREATE_SUCCESS);
      }
      onSuccess();
      onClose();
    } catch (err) {
      notifier.error(
        err,
        isEdit ? "Failed to update sprint" : MESSAGES.SPRINTS.CREATE_FAILED,
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl shadow-inner">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-gray-900 tracking-tight leading-none"
                        >
                          {isEdit ? "Refine Sprint" : "Inaugurate Sprint"}
                        </Dialog.Title>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1"></p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Flag className="w-4 h-4 text-blue-500" />
                          Sprint Name
                        </label>
                        <input
                          type="text"
                          required
                          {...register("name")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-gray-900"
                          placeholder="e.g. Sprint 1: Foundation"
                        />
                        {errors.name && (
                          <p className="text-xs font-bold text-red-500 ml-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            Start Date
                          </label>
                          <input
                            type="date"
                            required
                            min={projectStart}
                            max={projectEnd}
                            {...register("startDate")}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-bold text-gray-900"
                          />
                          {errors.startDate && (
                            <p className="text-xs font-bold text-red-500 ml-1">
                              {errors.startDate.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            Target End Date
                          </label>
                          <input
                            type="date"
                            required
                            min={projectStart}
                            max={projectEnd}
                            {...register("endDate")}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-purple-500 focus:bg-white transition-all text-sm font-bold text-gray-900"
                          />
                          {errors.endDate && (
                            <p className="text-xs font-bold text-red-500 ml-1">
                              {errors.endDate.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Target className="w-4 h-4 text-green-500" />
                          Sprint Goal
                        </label>
                        <textarea
                          rows={2}
                          {...register("goal")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-green-500 focus:bg-white transition-all text-sm font-medium text-gray-600 leading-relaxed"
                          placeholder="What must be achieved?"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <AlignLeft className="w-4 h-4 text-orange-500" />
                          Description
                        </label>
                        <textarea
                          rows={2}
                          {...register("description")}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50/50 outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-medium text-gray-600 leading-relaxed"
                          placeholder="Optional context..."
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 -mx-10 -mb-6 px-10 py-8 mt-10 flex flex-row-reverse gap-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex justify-center items-center gap-2 rounded-xl bg-gray-900 px-10 py-3.5 text-sm font-black text-white shadow-2xl shadow-gray-200 hover:bg-black transition-all disabled:opacity-50 min-w-[180px]"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isEdit ? (
                          "Update Sprint"
                        ) : (
                          "Commence Sprint"
                        )}
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                        onClick={onClose}
                        disabled={loading}
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
