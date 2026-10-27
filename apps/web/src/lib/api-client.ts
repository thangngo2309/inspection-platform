
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:9000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Client riêng để refresh token.
 *
 * Không gắn response interceptor vào client này,
 * tránh vòng lặp refresh vô hạn.
 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Mở rộng Axios config để đánh dấu request
 * đã được thử lại sau khi refresh.
 */
type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

/**
 * Dùng chung một Promise refresh cho những request
 * nhận 401 cùng lúc.
 *
 * Backend đang thực hiện refresh token rotation,
 * vì vậy không được gửi nhiều refresh request bằng
 * cùng một refresh token.
 */
let refreshPromise: Promise<AuthTokens> | null = null;

/**
 * Các endpoint Auth không nên tự động refresh khi
 * chính request đăng nhập hoặc đăng ký bị 401.
 */
function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;

  try {
    const path = new URL(url, API_BASE_URL).pathname;

    return (
      path.endsWith("/auth/login") ||
      path.endsWith("/auth/register") ||
      path.endsWith("/auth/logout") ||
      path.endsWith("/auth/refresh")
    );
  } catch {
    return false;
  }
}

function normalizeError(error: AxiosError): AxiosError {
  /**
   * Giữ lại AxiosError gốc để UI vẫn đọc được:
   *
   * error.response?.status
   * error.response?.data
   * error.code
   */
  const data = error.response?.data as
    | { message?: string | string[] }
    | undefined;

  const rawMessage = data?.message;

  const message = Array.isArray(rawMessage)
    ? rawMessage.join(", ")
    : typeof rawMessage === "string"
      ? rawMessage
      : null;

  if (message) {
    error.message = message;
  } else if (error.response?.status === 401) {
    error.message =
      "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.";
  } else if (error.response?.status === 403) {
    error.message =
      "Bạn không có quyền thực hiện thao tác này.";
  } else if (!error.response) {
    error.message =
      "Không thể kết nối đến máy chủ. Vui lòng thử lại.";
  } else {
    error.message =
      "Không thể xử lý yêu cầu. Vui lòng thử lại.";
  }

  return error;
}

async function requestNewTokens(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Không có refresh token.");
  }

  /**
   * API refresh được xây dựng ở giai đoạn Auth:
   *
   * POST /api/auth/refresh
   * Body: { refreshToken }
   *
   * Response: AuthTokens
   */
  const response = await refreshClient.post<AuthTokens>(
    "/auth/refresh",
    { refreshToken },
  );

  const tokens = response.data;

  if (
    !tokens ||
    typeof tokens.accessToken !== "string" ||
    !tokens.accessToken ||
    typeof tokens.refreshToken !== "string" ||
    !tokens.refreshToken
  ) {
    throw new Error(
      "Phản hồi refresh token không hợp lệ.",
    );
  }

  /**
   * Tránh việc phiên cũ vừa refresh thành công
   * lại ghi đè lên phiên mới sau khi người dùng
   * đã đăng xuất hoặc đăng nhập tài khoản khác.
   */
  if (getRefreshToken() !== refreshToken) {
    throw new Error(
      "Phiên đăng nhập đã thay đổi trong khi làm mới.",
    );
  }

  saveAuth(tokens);

  return tokens;
}

function refreshTokens(): Promise<AuthTokens> {
  if (!refreshPromise) {
    refreshPromise = requestNewTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * REQUEST INTERCEPTOR
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    if (token) {
      config.headers.set(
        "Authorization",
        `Bearer ${token}`,
      );
    } else {
      config.headers.delete("Authorization");
    }

    return config;
  },
);

/**
 * RESPONSE INTERCEPTOR
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (unknownError: unknown) => {
    if (!axios.isAxiosError(unknownError)) {
      return Promise.reject(unknownError);
    }

    const error = unknownError as AxiosError;
    const originalRequest = error.config as
      | RetryableRequestConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(normalizeError(error));
    }

    /**
     * Mỗi request chỉ được retry một lần.
     */
    originalRequest._retry = true;

    const currentAuth = getAuth();

    if (!currentAuth?.refreshToken) {
      clearAuth();

      return Promise.reject(normalizeError(error));
    }

    try {
      /**
       * Nếu request được gửi bằng access token cũ,
       * nhưng trong lúc chờ đã có token mới,
       * không cần refresh thêm lần nữa.
       *
       * Điều này giảm lỗi rotation khi các request
       * nhận 401 ở những thời điểm sát nhau.
       */
      const sentAuthorization =
        originalRequest.headers?.get?.(
          "Authorization",
        );

      const sentToken =
        typeof sentAuthorization === "string" &&
        sentAuthorization.startsWith("Bearer ")
          ? sentAuthorization.slice(7)
          : null;

      const currentToken = getAccessToken();

      let nextToken: string;

      if (
        sentToken &&
        currentToken &&
        sentToken !== currentToken
      ) {
        nextToken = currentToken;
      } else {
        const refreshed = await refreshTokens();
        nextToken = refreshed.accessToken;
      }

      originalRequest.headers =
        AxiosHeaders.from(
          originalRequest.headers,
        ) as AxiosHeaders;

      originalRequest.headers.set(
        "Authorization",
        `Bearer ${nextToken}`,
      );

      return await apiClient.request(originalRequest);
    } catch (refreshError) {
      /**
       * Chỉ xóa phiên khi refresh thật sự thất bại,
       * không xóa phiên còn hợp lệ nếu request retry
       * bị lỗi do phân quyền hoặc lỗi Backend khác.
       */
      const refreshFailed =
        !axios.isAxiosError(refreshError) ||
        refreshError.config?.url?.includes(
          "/auth/refresh",
        );

      if (
        refreshFailed &&
        getRefreshToken() === currentAuth.refreshToken
      ) {
        clearAuth();
      }

      return Promise.reject(
        axios.isAxiosError(refreshError)
          ? normalizeError(refreshError)
          : refreshError,
      );
    }
  },
);

/**
 * Helper tùy chọn cho những nơi cần truyền
 * config riêng vào API.
 */
export type ApiRequestConfig = AxiosRequestConfig;
