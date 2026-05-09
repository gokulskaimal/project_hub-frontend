import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface MeetingRoomProps {
  roomId: string;
  userId: string;
  userName: string;
  projectId?: string;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({
  roomId,
  userId,
  userName,
  projectId,
}) => {
  const router = useRouter();
  const { role } = useSelector((state: RootState) => state.auth);
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const isJoiningRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const initMeeting = async () => {
      if (isJoiningRef.current || zpRef.current) return;
      isJoiningRef.current = true;

      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;

      if (!appID || !serverSecret) {
        console.error("Zego credentials missing");
        isJoiningRef.current = false;
        return;
      }

      try {
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          userId,
          userName,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        // Add a small delay to ensure previous hardware sessions are released
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (isMounted && containerRef.current) {
          zp.joinRoom({
            container: containerRef.current,
            showPreJoinView: true, // Enable pre-join view to let user manage hardware
            scenario: {
              mode: ZegoUIKitPrebuilt.VideoConference,
            },
            sharedLinks: [
              {
                name: "Copy Meeting Link",
                url: window.location.href,
              },
            ],
            showScreenSharingButton: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showUserList: true,
            // Start with hardware off to avoid NotReadableError during init
            turnOnCameraWhenJoining: false,
            turnOnMicrophoneWhenJoining: false,
            onLeaveRoom: () => {
              const baseRoute =
                role === "ORG_MANAGER" ||
                role === "SUPER_ADMIN" ||
                role === "ADMIN"
                  ? "manager"
                  : "member";
              if (projectId) {
                router.push(`/${baseRoute}/projects/${projectId}/board`);
              } else {
                router.push(`/${baseRoute}/dashboard`);
              }
            },
          });
        }
      } catch (err) {
        console.error("Failed to join meeting:", err);
      } finally {
        isJoiningRef.current = false;
      }
    };

    initMeeting();

    return () => {
      isMounted = false;
      if (zpRef.current) {
        try {
          zpRef.current.destroy();
        } catch (e) {
          console.error("Error destroying Zego instance:", e);
        }
        zpRef.current = null;
      }
      isJoiningRef.current = false;
    };
  }, [roomId, userId, userName]);

  return (
    <div
      ref={containerRef}
      className="w-full h-screen border rounded-xl overflow-hidden shadow-2xl bg-black"
    />
  );
};

export default MeetingRoom;
