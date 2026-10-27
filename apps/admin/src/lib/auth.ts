import type { AuthAccount, AuthTokens } from "@inspection/contracts";

const STORAGE_KEY = "inspection_admin_auth";

export const ADMIN_AUTH_CHANGED_EVENT = "inspection:admin-auth-changed";

export function getAuth(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const value: unknown = JSON.parse(raw);

    if (
      !value ||
      typeof value !== "object" ||
      !("accessToken" in value) ||
      typeof value.accessToken !== "string" ||
      !("refreshToken" in value) ||
      typeof value.refreshToken !== "string"
    ) {
      return null;
    }

    return value as AuthTokens;
  } catch {
    return null;
  }
}

export function saveAuth(data: AuthTokens): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);

  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
}

export function getAccessToken(): string | null {
  return getAuth()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getAuth()?.refreshToken ?? null;
}

export function isAdminRole(role: AuthAccount["role"]): boolean {
  return ["super_admin", "system_admin", "center_user", "staff"].includes(role);
}
