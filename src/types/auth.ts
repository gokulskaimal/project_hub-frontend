export type UserRole =
  | "ADMIN"
  | "ORG_MANAGER"
  | "TEAM_MEMBER"
  | "SUPER_ADMIN"
  | "MANAGER"
  | "MEMBER";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  orgId?: string;
  organizationName?: string;
  status?: string;
  lastLoginAt?: string | Date;
  avatar?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface GoogleSignInPayload {
  idToken: string;
  inviteToken?: string;
  orgName?: string;
}

export interface RegisterManagerPayload {
  email: string;
  organizationName: string;
}

export interface RegisterManagerResponse {
  organizationId: string;
  invitationToken: string;
  otpExpiresAt: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface CompleteSignupPayload {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  organizationName?: string;
}

export interface AcceptInvitePayload {
  token: string;
  password?: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfilePayload extends Partial<UserProfile> {}

export interface ChangePasswordPayload {
  currentPassword?: string;
  newPassword: string;
}
