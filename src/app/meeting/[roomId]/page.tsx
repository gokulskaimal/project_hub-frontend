"use client";

import React, { useState, useEffect } from "react";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { hydrateFromStorage } from "@/features/auth/authSlice";
import MeetingRoom from "@/components/Meeting/MeetingRoom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MeetingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const roomId = params.roomId as string;
  const projectId = searchParams.get("projectId");
  const { user, isLoggedIn, role } = useSelector(
    (state: RootState) => state.auth,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    dispatch(hydrateFromStorage());
    setIsReady(true);
  }, [dispatch]);

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.push(
        `/login?redirect=/meeting/${roomId}${projectId ? `?projectId=${projectId}` : ""}`,
      );
    }
  }, [isReady, isLoggedIn, router, roomId, projectId]);

  if (!isReady || !isLoggedIn || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
          Authorizing Access...
        </p>
      </div>
    );
  }

  const handleBack = () => {
    if (projectId) {
      const baseRoute =
        role === "ORG_MANAGER" || role === "SUPER_ADMIN" || role === "ADMIN"
          ? "manager"
          : "member";
      router.push(`/${baseRoute}/projects/${projectId}/board`);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden">
      <header className="h-16 px-6 bg-slate-900 border-b border-white/5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight uppercase tracking-widest">
              Sprint Meeting
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Room ID: {roomId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">
              Secure Sync Active
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <MeetingRoom
          roomId={roomId}
          userId={user.id}
          userName={`${user.firstName} ${user.lastName || ""}`.trim()}
          projectId={projectId || undefined}
        />
      </main>
    </div>
  );
}
