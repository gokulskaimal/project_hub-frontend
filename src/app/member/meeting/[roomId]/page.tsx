"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import MeetingRoom from "@/components/Meeting/MeetingRoom";

export default function MeetingPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-card border-b">
        <h1 className="text-xl font-bold">Sprint Meeting: {roomId}</h1>
      </header>
      <main className="flex-1">
        <MeetingRoom
          roomId={roomId}
          userId={user.id}
          userName={`${user.firstName} ${user.lastName || ""}`.trim()}
        />
      </main>
    </div>
  );
}
