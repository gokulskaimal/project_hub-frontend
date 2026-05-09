"use client";

import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { AlertTriangle, ArrowRight, Package, X, History } from "lucide-react";
import { Sprint } from "@/types/project";

interface SpilloverWizardProps {
  isOpen: boolean;
  onClose: () => void;
  stalledCount: number;
  futureSprints: Sprint[];
  onConfirm: (destination: string) => void;
  isLoading?: boolean;
}

export default function SpilloverWizard({
  isOpen,
  onClose,
  stalledCount,
  futureSprints,
  onConfirm,
  isLoading,
}: SpilloverWizardProps) {
  const [destination, setDestination] = useState<string>("BACKLOG");

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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-500"
              enterFrom="opacity-0 translate-y-12 scale-95"
              enterTo="opacity-100 translate-y-0 scale-100"
              leave="ease-in duration-300"
              leaveFrom="opacity-100 translate-y-0 scale-100"
              leaveTo="opacity-0 translate-y-12 scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden modal-surface p-0 text-left transition-all sm:my-8 sm:w-full sm:max-w-md">
                {/* Tactical Header */}
                <div className="bg-amber-500/10 p-8 border-b border-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-black text-foreground uppercase tracking-tighter">
                          Spillover Protocol
                        </Dialog.Title>
                        <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mt-0.5">
                          {stalledCount} STALLED OPERATIVES DETECTED
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <X size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 ml-1">
                      Target Migration Destination
                    </p>

                    {/* Move to Backlog */}
                    <button
                      onClick={() => setDestination("BACKLOG")}
                      className={`group w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        destination === "BACKLOG"
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                          : "border-border/30 bg-secondary/10 hover:border-border/60"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-xl transition-colors ${destination === "BACKLOG" ? "bg-primary text-white" : "bg-secondary text-muted-foreground group-hover:text-foreground"}`}
                        >
                          <Package size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-tight">
                            Mission Backlog
                          </p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                            Decentralize all items
                          </p>
                        </div>
                      </div>
                      {destination === "BACKLOG" && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </button>

                    {/* Future Sprints */}
                    {futureSprints.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest ml-1 opacity-40">
                          Available Future Cycles
                        </p>
                        {futureSprints.map((sprint) => (
                          <button
                            key={sprint.id}
                            onClick={() => setDestination(sprint.id)}
                            className={`group w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                              destination === sprint.id
                                ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                                : "border-border/30 bg-secondary/10 hover:border-border/60"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2 rounded-xl transition-colors ${destination === sprint.id ? "bg-primary text-white" : "bg-secondary text-muted-foreground group-hover:text-foreground"}`}
                              >
                                <History size={18} />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-tight truncate max-w-[180px]">
                                  {sprint.name}
                                </p>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">
                                  Future Node Sync
                                </p>
                              </div>
                            </div>
                            {destination === sprint.id && (
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                    >
                      Abort
                    </button>
                    <button
                      onClick={() => onConfirm(destination)}
                      disabled={isLoading}
                      className="flex-[2] py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isLoading ? "Synchronizing..." : "Initialize Migration"}
                      {!isLoading && <ArrowRight size={14} />}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
