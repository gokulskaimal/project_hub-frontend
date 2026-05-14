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
} from "lucide-react";
import { EntityCard } from "@/components/ui/EntityCard";
import { Dialog, Transition } from "@headlessui/react";
import { z } from "zod";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Controller,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MESSAGES } from "@/constants/messages";
import { notifier } from "@/utils/notifier";
import { confirmWithAlert } from "@/utils/confirm";
import PremiumStatGrid from "@/components/admin/PremiumStatGrid";
import { Toggle } from "@/components/ui/Toggle";

const planSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Write a better description (min 10 chars)"),
  price: z.number().min(0, "Cost cannot be negative"),
  currency: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  type: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature required"),
  isActive: z.boolean(),
  limits: z.object({
    projects: z.number().min(1, "Minimum 1 Project required"),
    members: z.number().min(1, "Minimum 1 Member required"),
    storage: z.number().min(1, "Storage required"),
    messages: z.number().min(1, "Messages required"),
  }),
});

type PlanFormData = {
  name: string;
  description: string;
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
      currency: "INR",
      type: "STARTER",
      isActive: true,
      features: [""],
      limits: { projects: 5, members: 10, storage: 10, messages: 1000 },
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
        currency: plan.currency || "INR",
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
        currency: "INR",
        type: "STARTER",
        isActive: true,
        features: [""],
        limits: { projects: 5, members: 10, storage: 10, messages: 1000 },
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

  const handleTogglePlanStatus = async (plan: Plan) => {
    try {
      await updatePlan({
        id: plan.id,
        data: { isActive: !plan.isActive },
      }).unwrap();
      notifier.success(plan.isActive ? "Plan disabled" : "Plan enabled");
    } catch (error) {
      notifier.error(error, "Failed to update status");
    }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirmWithAlert(
      "Delete Plan?",
      "This will permanently remove the plan. Organizations already subscribed will not be affected until their next billing cycle.",
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
    <DashboardLayout title="Pricing Plans">
      <div className="p-4 md:p-8 space-y-10 sm:space-y-12 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              Plans
            </h1>
            <p className="text-[10px] font-black text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-70">
              Create and manage the plans for your companies.
            </p>
          </div>
        </div>

        <PremiumStatGrid
          stats={{
            total: plans.length || 0,
            active: plans.filter((p) => p.type === "STARTER").length || 0,
            pro: plans.filter((p) => p.type === "PRO").length || 0,
            suspended: plans.filter((p) => !p.isActive).length || 0,
          }}
        />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-card p-6 rounded-3xl border border-border/50 shadow-2xl glass-card">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-4 h-4 z-10" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-transparent rounded-2xl text-sm text-foreground font-bold placeholder-muted-foreground/40 outline-none focus:bg-secondary/50 focus:border-primary/20 transition-all shadow-inner"
            />
          </div>
          <div className="flex w-full md:w-auto gap-4 items-center">
            <div className="relative flex-1 md:flex-none">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none px-6 py-3 bg-secondary/30 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 cursor-pointer transition-all hover:bg-secondary/40 min-w-[170px]"
              >
                <option value="ALL" className="bg-card">
                  Type: ALL
                </option>
                <option value="STARTER" className="bg-card">
                  Starter
                </option>
                <option value="PRO" className="bg-card">
                  Pro
                </option>
                <option value="ENTERPRISE" className="bg-card">
                  Enterprise
                </option>
              </select>
            </div>
            <div className="relative flex-1 md:flex-none">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-6 py-3 bg-secondary/30 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground outline-none focus:bg-secondary/50 focus:border-primary/20 cursor-pointer transition-all hover:bg-secondary/40 min-w-[180px]"
              >
                <option value="price_asc" className="bg-card">
                  Price: Low to High
                </option>
                <option value="price_desc" className="bg-card">
                  Price: High to Low
                </option>
                <option value="name_asc" className="bg-card">
                  Sort by Name
                </option>
              </select>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-3 px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-primary/20 font-black text-[10px] uppercase tracking-[0.2em] shrink-0 active:scale-95"
            >
              <Plus size={18} /> Create Plan
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 glass-card rounded-[3rem] border border-border/50">
            <Loader2 className="animate-spin w-12 h-12 text-primary opacity-50" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
              Loading plans...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.length === 0 && (
              <div className="col-span-full py-40 text-center text-muted-foreground bg-card/30 rounded-[3rem] border border-border/50 border-dashed font-black text-sm uppercase tracking-widest animate-in fade-in zoom-in duration-700">
                <Shield className="w-16 h-16 mx-auto mb-6 opacity-20" />
                No plans found.
              </div>
            )}
            {filteredPlans.map((plan: Plan) => (
              <EntityCard
                key={plan.id}
                id={plan.id}
                title={plan.name}
                description={plan.description || "No description available."}
                status={plan.isActive ? "ACTIVE" : "OFF"}
                statusColor={
                  plan.isActive
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-secondary text-muted-foreground border-border/50"
                }
                icon={
                  plan.type === "STARTER"
                    ? Briefcase
                    : plan.type === "PRO"
                      ? Rocket
                      : Crown
                }
                subtitle={plan.type}
                actions={
                  <div className="flex items-center gap-4">
                    <Toggle
                      enabled={plan.isActive}
                      onChange={() => handleTogglePlanStatus(plan)}
                    />
                    <div className="flex gap-2.5 ml-2">
                      <button
                        onClick={() => handleOpenModal(plan)}
                        title="Edit Plan"
                        className="p-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl active:scale-90"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        title="Delete Plan"
                        className="p-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl hover:bg-destructive hover:text-white transition-all shadow-xl active:scale-90"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                }
                footerLeft={
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
                      ₹{plan.price}
                    </span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      / month
                    </span>
                  </div>
                }
              >
                {/* Features & Limits */}
                <div className="mt-6 mb-4 pt-6 border-t border-border/30">
                  <ul className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    <li className="flex items-center gap-3 text-xs text-foreground font-black uppercase tracking-tighter">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Target size={14} className="text-primary" />
                      </div>
                      {plan.limits?.projects || 0} Projects Allowed
                    </li>
                    <li className="flex items-center gap-3 text-xs text-foreground font-black uppercase tracking-tighter">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Shield size={14} className="text-primary" />
                      </div>
                      {plan.limits?.members || 0} Members Allowed
                    </li>
                    {plan.features.map((f: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-xs text-muted-foreground font-bold"
                      >
                        <Check
                          size={14}
                          className="text-emerald-500 shrink-0"
                        />{" "}
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </EntityCard>
            ))}
          </div>
        )}

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-[100]"
            onClose={handleCloseModal}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-background/80 backdrop-blur-xl" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-500"
                  enterFrom="opacity-0 translate-y-12 scale-95"
                  enterTo="opacity-100 translate-y-0 scale-100"
                  leave="ease-in duration-300"
                  leaveFrom="opacity-100 translate-y-0 scale-100"
                  leaveTo="opacity-0 translate-y-12 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-[2.5rem] bg-card p-0 shadow-[0_0_50px_rgba(var(--primary),0.1)] border border-border/50 transition-all">
                    <div className="flex justify-between items-center p-8 border-b border-border/30 bg-secondary/20">
                      <Dialog.Title className="text-2xl font-black text-foreground tracking-tighter flex items-center gap-4 uppercase">
                        <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                          {editingPlan ? (
                            <Edit2 size={22} className="text-primary" />
                          ) : (
                            <Plus size={22} className="text-primary" />
                          )}
                        </div>
                        {editingPlan ? "Edit Plan" : "Create Plan"}
                      </Dialog.Title>
                      <button
                        onClick={handleCloseModal}
                        className="p-3 bg-secondary/50 hover:bg-secondary rounded-2xl transition-all text-muted-foreground hover:text-foreground active:scale-90"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar"
                    >
                      <div className="grid grid-cols-2 gap-8">
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 block ml-1 opacity-70">
                            Plan Name
                          </label>
                          <input
                            {...register("name")}
                            className="w-full px-6 py-4 bg-secondary/30 border border-border/30 rounded-2xl text-sm font-bold text-foreground focus:bg-secondary/50 focus:border-primary/20 transition-all outline-none shadow-inner"
                            placeholder="e.g. Pro Plan"
                          />
                          {errors.name && (
                            <p className="text-[10px] font-black text-destructive mt-2.5 ml-1 uppercase tracking-widest">
                              {errors.name.message}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 block ml-1 opacity-70">
                            Plan Description
                          </label>
                          <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full px-6 py-4 bg-secondary/30 border border-border/30 rounded-2xl text-sm font-bold text-foreground focus:bg-secondary/50 focus:border-primary/20 transition-all outline-none shadow-inner resize-none"
                            placeholder="Describe what is included in this plan..."
                          />
                          {errors.description && (
                            <p className="text-[10px] font-black text-destructive mt-2.5 ml-1 uppercase tracking-widest">
                              {errors.description.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 block ml-1 opacity-70">
                            Plan Price
                          </label>
                          <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">
                              ₹
                            </div>
                            <input
                              type="number"
                              {...register("price", { valueAsNumber: true })}
                              className="w-full pl-10 pr-6 py-4 bg-secondary/30 border border-border/30 rounded-2xl text-sm font-bold text-foreground focus:bg-secondary/50 focus:border-primary/20 transition-all outline-none shadow-inner tabular-nums"
                            />
                          </div>
                          {errors.price && (
                            <p className="text-[10px] font-black text-destructive mt-2.5 ml-1 uppercase tracking-widest">
                              {errors.price.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2.5 block ml-1 opacity-70">
                            Plan Type
                          </label>
                          <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                              <div className="flex p-1.5 bg-secondary/20 border border-border/30 rounded-[1.25rem] gap-1.5">
                                {["STARTER", "PRO", "ENTERPRISE"].map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => field.onChange(t)}
                                    className={`flex-1 py-2.5 text-[9px] font-black rounded-xl transition-all uppercase tracking-widest ${
                                      field.value === t
                                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            )}
                          />
                        </div>
                        <div className="col-span-2 bg-secondary/10 p-6 rounded-3xl border border-border/30">
                          <Controller
                            name="isActive"
                            control={control}
                            render={({ field }) => (
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                                    Plan Status
                                  </h4>
                                  <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">
                                    Turn this plan on or off for users.
                                  </p>
                                </div>
                                <Toggle
                                  enabled={field.value}
                                  onChange={field.onChange}
                                />
                              </div>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-secondary/10 p-6 rounded-3xl border border-border/30">
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70">
                            Projects
                          </label>
                          <input
                            type="number"
                            {...register("limits.projects", {
                              valueAsNumber: true,
                            })}
                            className="w-full px-5 py-3 bg-card border border-border/30 rounded-xl text-xs font-bold text-foreground outline-none shadow-inner tabular-nums"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70">
                            Members
                          </label>
                          <input
                            type="number"
                            {...register("limits.members", {
                              valueAsNumber: true,
                            })}
                            className="w-full px-5 py-3 bg-card border border-border/30 rounded-xl text-xs font-bold text-foreground outline-none shadow-inner tabular-nums"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70">
                            Storage (GB)
                          </label>
                          <input
                            type="number"
                            {...register("limits.storage", {
                              valueAsNumber: true,
                            })}
                            className="w-full px-5 py-3 bg-card border border-border/30 rounded-xl text-xs font-bold text-foreground outline-none shadow-inner tabular-nums"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block ml-1 opacity-70">
                            Messages
                          </label>
                          <input
                            type="number"
                            {...register("limits.messages", {
                              valueAsNumber: true,
                            })}
                            className="w-full px-5 py-3 bg-card border border-border/30 rounded-xl text-xs font-bold text-foreground outline-none shadow-inner tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="bg-secondary/10 p-8 rounded-[2rem] border border-border/30">
                        <div className="flex justify-between items-center mb-6">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">
                            Plan Features
                          </label>
                          <button
                            type="button"
                            onClick={() => append("")}
                            className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/20 hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm"
                          >
                            + Add Feature
                          </button>
                        </div>
                        <div className="space-y-4 max-h-56 overflow-y-auto pr-3 custom-scrollbar">
                          {fields.map((f, i) => (
                            <div
                              key={f.id}
                              className="flex gap-3 animate-in slide-in-from-right-4 duration-300"
                            >
                              <input
                                {...register(`features.${i}` as const)}
                                className="flex-1 px-5 py-3 bg-secondary/30 border border-border/30 rounded-xl text-xs font-bold text-foreground outline-none shadow-inner"
                                placeholder="Feature name..."
                              />
                              {fields.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => remove(i)}
                                  className="p-2.5 bg-destructive/5 text-destructive hover:bg-destructive/10 rounded-xl transition-all active:scale-90"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-secondary/50 rounded-2xl transition-all active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary-foreground bg-primary hover:opacity-90 rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-95"
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
