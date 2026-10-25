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
      return Promise.reject(new Error("Không thể kết nối tới máy chủ."));
    }

    const message = error.response.data?.message;

    return Promise.reject(
      new Error(
        Array.isArray(message)
          ? message.join(", ")
          : typeof message === "string"
          ? message
          : "Có lỗi xảy ra. Vui lòng thử lại."
      )
    );
  }
);
