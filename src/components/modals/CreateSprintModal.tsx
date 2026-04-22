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
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                <div className="px-10 pt-10 pb-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl shadow-inner">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-black text-foreground tracking-tight leading-none uppercase"
                        >
                          {isEdit ? "Refine Sprint" : "Launch Sprint"}
                        </Dialog.Title>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1"></p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="form-label flex items-center gap-2">
                          <Flag className="w-3.5 h-3.5 text-primary" />
                          Identifier
                        </label>
                        <input
                          type="text"
                          required
                          {...register("name")}
                          className="form-input"
                          placeholder="E.G. SPRINT 1: FOUNDATION"
                        />
                        {errors.name && (
                          <p className="text-xs font-bold text-red-500 ml-1">
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="form-label flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            Start Node
                          </label>
                          <input
                            type="date"
                            required
                            min={projectStart}
                            max={projectEnd}
                            {...register("startDate")}
                            className="form-input"
                          />
                          {errors.startDate && (
                            <p className="text-xs font-bold text-red-500 ml-1">
                              {errors.startDate.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="form-label flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            Target End
                          </label>
                          <input
                            type="date"
                            required
                            min={projectStart}
                            max={projectEnd}
                            {...register("endDate")}
                            className="form-input"
                          />
                          {errors.endDate && (
                            <p className="text-xs font-bold text-red-500 ml-1">
                              {errors.endDate.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="form-label flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-emerald-500" />
                          Mission Objective
                        </label>
                        <textarea
                          rows={2}
                          {...register("goal")}
                          className="form-input min-h-[80px]"
                          placeholder="WHAT MUST BE ACHIEVED?"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="form-label flex items-center gap-2">
                          <AlignLeft className="w-3.5 h-3.5 text-amber-500" />
                          Briefing
                        </label>
                        <textarea
                          rows={2}
                          {...register("description")}
                          className="form-input min-h-[80px]"
                          placeholder="OPERATIONAL CONTEXT..."
                        />
                      </div>
                    </div>

                    <div className="bg-secondary/10 -mx-10 -mb-6 px-10 py-8 mt-10 flex flex-row-reverse gap-4 border-t border-border/50">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : isEdit ? (
                          "Commit Changes"
                        ) : (
                          "Launch Sprint"
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-8 py-3.5 border border-border text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all"
                        onClick={onClose}
                        disabled={loading}
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
