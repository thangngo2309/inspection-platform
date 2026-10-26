import type {
  AuthAccount,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
} from "@inspection/contracts";

import { apiClient } from "../api-client";

export const authRepository = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/auth/login", payload);
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  async me(): Promise<AuthAccount> {
    const response = await apiClient.get<AuthAccount>("/auth/me");
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },
};
