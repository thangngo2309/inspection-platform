import axios from "axios";
import { getAccessToken } from "./auth";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;

    return Promise.reject(
      new Error(
        Array.isArray(message)
          ? message.join(", ")
          : typeof message === "string"
          ? message
          : "Không thể xử lý yêu cầu. Vui lòng thử lại."
      )
    );
  }
);
