"use client";

import React, { useState, Fragment } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  useGetAdminPlansQuery,
  useCreateAdminPlanMutation,
  useUpdateAdminPlanMutation,
  useDeleteAdminPlanMutation,
} from "@/store/api/adminApiSlice";
import { Plan } from "@/types/plan";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Target,
  Shield,
  Loader2,
  Search,
  CreditCard,
  Briefcase,
  Rocket,
  Crown,
  MoreHorizontal,
} from "lucide-react";
import { EntityCard } from "@/components/ui/EntityCard";
import { Dialog, Transition } from "@headlessui/react";
import { z } from "zod";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import PremiumStatGrid from "@/components/admin/PremiumStatGrid";

const planSchema = z.object({
  name: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  type: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  features: z.array(z.string()).min(1),
  isActive: z.boolean(),
  limits: z.object({
    projects: z.number().min(1),
    members: z.number().min(1),
    storage: z.number().min(1),
    messages: z.number().min(1),
  }),
});

type PlanFormData = {
  name: string;
  description?: string;
  price: number;
  currency: string;
  type: "STARTER" | "PRO" | "ENTERPRISE";
  features: string[];
  isActive: boolean;
  limits: {
    projects: number;
    members: number;
    storage: number;
    messages: number;
  };
};

export default function AdminPlansPage() {
  const { data: plans = [], isLoading } = useGetAdminPlansQuery();
  const [createPlan] = useCreateAdminPlanMutation();
  const [updatePlan] = useUpdateAdminPlanMutation();
  const [deletePlan] = useDeleteAdminPlanMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState("price_asc");

  const filteredPlans = React.useMemo(() => {
    let result = [...plans];
    if (search) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (filterType !== "ALL") {
      result = result.filter((p) => p.type === filterType);
    }
    result.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "name_asc")
        return a.name?.localeCompare(b.name || "") || 0;
      return 0;
    });
    return result;
  }, [plans, search, filterType, sortBy]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      type: "STARTER",
      isActive: true,
      features: [""],
      limits: { projects: 1, members: 5, storage: 1, messages: 100 },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features" as never,
  });

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      reset({
        name: plan.name || "",
        description: plan.description || "",
        price: plan.price,
        currency: plan.currency || "USD",
        type: plan.type,
        isActive: plan.isActive,
        features: plan.features,
        limits: {
          projects: plan.limits?.projects || 5,
          members: plan.limits?.members || 10,
          storage: plan.limits?.storage || 10,
          messages: plan.limits?.messages || 1000,
        },
      });
    } else {
      setEditingPlan(null);
      reset({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        type: "STARTER",
        isActive: true,
        features: [""],
        limits: { projects: 1, members: 5, storage: 1, messages: 100 },
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const onSubmit: SubmitHandler<PlanFormData> = async (data) => {
    try {
      if (editingPlan) {
        await updatePlan({ id: editingPlan.id, data }).unwrap();
        notifier.success(MESSAGES.ADMIN.PLAN_UPDATED);
      } else {
        await createPlan(data).unwrap();
        notifier.success(MESSAGES.ADMIN.PLAN_CREATED);
      }
      handleCloseModal();
    } catch (error) {
      notifier.error(
        error,
        editingPlan
          ? MESSAGES.ADMIN.UPDATE_FAILED
          : MESSAGES.ADMIN.CREATE_FAILED,
      );
    }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirmWithAlert(
      "Delete Plan?",
      "This cannot be undone.",
    );
    if (confirmed) {
      try {
        await deletePlan(id).unwrap();
        notifier.success(MESSAGES.ADMIN.PLAN_DELETED);
      } catch (error) {
        notifier.error(error, MESSAGES.ADMIN.DELETE_FAILED);
      }
    }
  };

  return (
    <DashboardLayout title="Plans & Pricing">
      <div className="p-6 space-y-6">
        <PremiumStatGrid
          stats={{
            total: plans.length || 0,
            active: plans.filter((p) => p.type === "STARTER").length || 0, // Using starter as active for demo in this context
            pro: plans.filter((p) => p.type === "PRO").length || 0,
            suspended: plans.filter((p) => !p.isActive).length || 0,
          }}
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex w-full md:w-auto gap-3 items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 min-w-[130px] bg-white appearance-none"
            >
              <option value="ALL">All Types</option>
              <option value="STARTER">Starter</option>
              <option value="PRO">Professional</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 font-medium outline-none focus:ring-2 focus:ring-blue-500 min-w-[130px] bg-white appearance-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm font-semibold text-sm shrink-0"
            >
              <Plus size={18} /> Create Plan
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed font-medium">
                No plans found.
              </div>
            )}
            {filteredPlans.map((plan: Plan) => (
              <EntityCard
                key={plan.id}
                id={plan.id}
                title={plan.name}
                description={plan.description}
                status={plan.isActive ? "ACTIVE" : "INACTIVE"}
                statusColor={
                  plan.isActive
                    ? "bg-green-50 text-green-700 border-green-100"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }
                icon={
                  plan.type === "STARTER"
                    ? Briefcase
                    : plan.type === "PRO"
                      ? Rocket
                      : Crown
                }
                actions={
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      title="Edit Plan"
                      className="p-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      title="Delete Plan"
                      className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                }
                footerLeft={
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-blue-600">
                      ₹{plan.price}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      / {plan.interval || "month"}
                    </span>
                  </div>
                }
              >
                {/* Features & Limits */}
                <div className="mt-4 mb-6 pt-4 border-t border-gray-50">
                  <ul className="space-y-2.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    <li className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                      <Target size={14} className="text-blue-500" />{" "}
                      {plan.limits?.projects || 0} Projects
                    </li>
                    <li className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                      <Shield size={14} className="text-blue-500" />{" "}
                      {plan.limits?.members || 0} Team Members
                    </li>
                    {plan.features.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-xs text-gray-500"
                      >
                        <Check size={14} className="text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </EntityCard>
            ))}
          </div>
        )}

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white p-6 shadow-2xl transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title className="text-lg font-bold text-gray-900">
                        {editingPlan ? "Edit Plan" : "New Plan"}
                      </Dialog.Title>
                      <button
                        onClick={handleCloseModal}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                            Plan Name
                          </label>
                          <input
                            {...register("name")}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Pro Plan"
                          />
                          {errors.name && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                            Description
                          </label>
                          <textarea
                            {...register("description")}
                            rows={2}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="What's included in this plan?"
                          />
                          {errors.description && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors.description.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                            Price
                          </label>
                          <input
                            type="number"
                            {...register("price", { valueAsNumber: true })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                            Plan Type
                          </label>
                          <select
                            {...register("type")}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            <option value="STARTER">Starter</option>
                            <option value="PRO">Professional</option>
                            <option value="ENTERPRISE">Enterprise</option>
                          </select>
                          {errors.type && (
                            <p className="text-[10px] text-red-500 mt-1">
                              {errors.type.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                            Max Projects
                          </label>
                          <input
                            type="number"
                            {...register("limits.projects", {
                              valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">
                            Max Members
                          </label>
                          <input
                            type="number"
                            {...register("limits.members", {
                              valueAsNumber: true,
                            })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-baseline mb-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">
                            Features
                          </label>
                          <button
                            type="button"
                            onClick={() => append("")}
                            className="text-[10px] font-bold text-blue-600"
                          >
                            + Add
                          </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                          {fields.map((f, i) => (
                            <div key={f.id} className="flex gap-2">
                              <input
                                {...register(`features.${i}` as const)}
                                className="flex-1 px-4 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900"
                              />
                              {fields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="text-red-400 hover:text-red-600"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-3 pt-6">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="flex-1 py-2 text-sm font-bold text-gray-400 hover:bg-gray-50 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 transition"
                        >
                          Save Plan
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </DashboardLayout>
  );
}
