export type UserRole =
  | "super_admin"
  | "system_admin"
  | "center_user"
  | "staff"
  | "customer";

export interface AuthAccount {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: UserRole;
  status: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  user: AuthAccount;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}
