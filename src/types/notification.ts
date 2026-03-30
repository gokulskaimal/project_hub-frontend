export interface Notification {
  id: string;
  isRead: boolean;
  link?: string;
  title: string;
  message: string;
  type: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
  createdAt: string;
}
