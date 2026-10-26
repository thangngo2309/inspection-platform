import type { AuthAccount, AuthTokens } from "@inspection/contracts";

const STORAGE_KEY = "inspection_admin_auth";

export function getAuth(): AuthTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function saveAuth(data: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getAuth()?.accessToken ?? null;
}

export function isAdminRole(role: AuthAccount["role"]): boolean {
  return ["super_admin", "system_admin", "center_user", "staff"].includes(role);
}
