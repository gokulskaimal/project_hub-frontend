export interface Meeting {
  id: string;
  sprintId: string;
  projectId: string;
  title: string;
  type: "STANDUP" | "REVIEW" | "RETROSPECTIVE";
  roomId: string;
  scheduledAt: string;
  status: "SCHEDULED" | "LIVE" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingPayload {
  sprintId: string;
  projectId: string;
  title: string;
  type: Meeting["type"];
  scheduledAt: string;
}

export interface UpdateMeetingPayload {
  title?: string;
  type?: Meeting["type"];
  scheduledAt?: string;
  status?: Meeting["status"];
}
