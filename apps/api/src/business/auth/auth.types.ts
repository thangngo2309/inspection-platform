export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SYSTEM_ADMIN = 'system_admin',
  CENTER_USER = 'center_user',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export const ADMIN_ROLES: string[] = [
  UserRole.SUPER_ADMIN,
  UserRole.SYSTEM_ADMIN,
  UserRole.CENTER_USER,
  UserRole.STAFF,
];

export interface AuthUser {
  sub: string;
  role: UserRole;
  type: 'access';
  iat?: number;
  exp?: number;
}

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
  tokenType: 'Bearer';
  user: AuthAccount;
}
