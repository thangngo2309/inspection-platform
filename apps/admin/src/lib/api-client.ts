import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error("Không thể kết nối đến máy chủ."));
    }

    const data = error.response.data;
    const message = data?.message;

    if (Array.isArray(message)) {
      return Promise.reject(new Error(message.join(", ")));
    }

    return Promise.reject(
      new Error(
        typeof message === "string"
          ? message
          : "Đã xảy ra lỗi. Vui lòng thử lại."
      )
    );
  }
);
