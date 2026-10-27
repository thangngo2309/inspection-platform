import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import type { AuthTokens } from "@inspection/contracts";

import {
  clearAuth,
  getAccessToken,
  getAuth,
  getRefreshToken,
  saveAuth,
} from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<AuthTokens> | null = null;

function isAuthMutation(url?: string): boolean {
  if (!url) return false;

  const path = url.split("?")[0];

  return (
    path.endsWith("/auth/admin/login") ||
    path.endsWith("/auth/login") ||
    path.endsWith("/auth/register") ||
    path.endsWith("/auth/refresh") ||
    path.endsWith("/auth/logout")
  );
}

function apiError(error: AxiosError): AxiosError {
  const responseData = error.response?.data as
    | { message?: string | string[] }
    | undefined;

  const raw = responseData?.message;

  if (Array.isArray(raw)) {
    error.message = raw.join(", ");
  } else if (typeof raw === "string") {
    error.message = raw;
  } else if (error.response?.status === 401) {
    error.message = "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.";
  } else if (error.response?.status === 403) {
    error.message = "Bạn không có quyền truy cập chức năng này.";
  } else if (!error.response) {
    error.message = "Không thể kết nối đến máy chủ.";
  } else {
    error.message = "Không thể xử lý yêu cầu. Vui lòng thử lại.";
  }

  // Giữ AxiosError để nơi gọi vẫn đọc được
  // error.response.status và error.response.data.
  return error;
}

async function performRefresh(): Promise<AuthTokens> {
  const oldRefreshToken = getRefreshToken();

  if (!oldRefreshToken) {
    throw new Error("Không tìm thấy refresh token.");
  }

  try {
    const response = await refreshClient.post<AuthTokens>("/auth/refresh", {
      refreshToken: oldRefreshToken,
    });

    const tokens = response.data;

    if (
      !tokens ||
      typeof tokens.accessToken !== "string" ||
      !tokens.accessToken ||
      typeof tokens.refreshToken !== "string" ||
      !tokens.refreshToken
    ) {
      throw new Error("Phản hồi làm mới phiên đăng nhập không hợp lệ.");
    }

    // Không để một refresh request cũ ghi đè
    // phiên mới sau khi user đổi tài khoản hoặc logout.
    if (getRefreshToken() !== oldRefreshToken) {
      throw new Error("Phiên đăng nhập đã thay đổi.");
    }

    saveAuth(tokens);

    return tokens;
  } catch (error) {
    // Chỉ xóa phiên khi refresh token bị từ chối
    // hoặc response không hợp lệ.
    // Nếu mất mạng hay API tạm dừng thì giữ phiên
    // để người dùng có thể thử lại.
    const rejected =
      axios.isAxiosError(error) &&
      [400, 401, 403].includes(error.response?.status ?? 0);

    const invalidResponse =
      error instanceof Error &&
      error.message.includes("Phản hồi làm mới phiên");

    if (
      (rejected || invalidResponse) &&
      getRefreshToken() === oldRefreshToken
    ) {
      clearAuth();
    }

    throw error;
  }
}

function refreshTokens(): Promise<AuthTokens> {
  if (!refreshPromise) {
    const pending = performRefresh();

    refreshPromise = pending;

    void pending
      .finally(() => {
        if (refreshPromise === pending) {
          refreshPromise = null;
        }
      })
      .catch(() => {
        // Promise cleanup không tạo unhandled rejection.
      });
  }

  return refreshPromise;
}

// ======================================================
// REQUEST
// ======================================================

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (!isAuthMutation(config.url)) {
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.delete("Authorization");
    }
  }

  return config;
});

// ======================================================
// RESPONSE
// ======================================================

apiClient.interceptors.response.use(
  (response) => response,

  async (unknownError: unknown) => {
    if (!axios.isAxiosError(unknownError)) {
      return Promise.reject(unknownError);
    }

    const error = unknownError as AxiosError;

    const request = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      isAuthMutation(request.url)
    ) {
      return Promise.reject(apiError(error));
    }

    const authBefore = getAuth();

    if (!authBefore?.refreshToken) {
      return Promise.reject(apiError(error));
    }

    request._retry = true;

    try {
      const authorization = request.headers?.get?.("Authorization");

      const sentToken =
        typeof authorization === "string" && authorization.startsWith("Bearer ")
          ? authorization.slice(7)
          : null;

      const currentToken = getAccessToken();

      let newAccessToken: string;

      // Request dùng token cũ nhưng một request khác
      // đã refresh thành công: dùng token mới luôn.
      if (sentToken && currentToken && sentToken !== currentToken) {
        newAccessToken = currentToken;
      } else {
        const tokens = await refreshTokens();
        newAccessToken = tokens.accessToken;
      }

      request.headers = AxiosHeaders.from(request.headers);

      request.headers.set("Authorization", `Bearer ${newAccessToken}`);

      // Retry đúng một lần.
      return await apiClient.request(request);
    } catch (retryError) {
      return Promise.reject(
        axios.isAxiosError(retryError) ? apiError(retryError) : retryError
      );
    }
  }
);
