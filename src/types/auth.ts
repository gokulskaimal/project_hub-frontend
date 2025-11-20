export type UserRole = "admin" | "manager" | "member" | "super_admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}
