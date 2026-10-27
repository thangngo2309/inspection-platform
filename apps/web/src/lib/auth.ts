
import type { AuthTokens } from "@inspection/contracts";

const STORAGE_KEY = "inspection_customer_auth";

export const AUTH_CHANGED_EVENT = "inspection:auth-changed";

export function getAuth(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("accessToken" in parsed) ||
      typeof parsed.accessToken !== "string" ||
      !("refreshToken" in parsed) ||
      typeof parsed.refreshToken !== "string"
    ) {
      return null;
    }

    return parsed as AuthTokens;
  } catch {
    return null;
  }
}

function notifyAuthChanged(): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function saveAuth(value: AuthTokens): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(value),
  );

  notifyAuthChanged();
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(STORAGE_KEY);

  notifyAuthChanged();
}

export function getAccessToken(): string | null {
  return getAuth()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return getAuth()?.refreshToken ?? null;
}
