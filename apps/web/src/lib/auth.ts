import type { AuthTokens } from "@inspection/contracts";

const STORAGE_KEY = "inspection_customer_auth";

export function getAuth(): AuthTokens | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as AuthTokens) : null;
  } catch {
    return null;
  }
}

export function saveAuth(value: AuthTokens): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getAuth()?.accessToken ?? null;
}
