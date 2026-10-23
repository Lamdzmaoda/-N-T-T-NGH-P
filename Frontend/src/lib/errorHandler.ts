// src/lib/errorHandler.ts
import axios from "axios";
import { ERROR_MESSAGES, type ApiResponse } from "@/types/api";

export const getErrorMessage = (
  error: unknown,
  fallbackMessage = "Có lỗi xảy ra, vui lòng thử lại",
): string => {
  if (axios.isAxiosError<ApiResponse>(error)) {
    // 1. Nếu có response từ backend trả về
    const data = error.response?.data;
    if (data?.code && ERROR_MESSAGES[data.code]) {
      return ERROR_MESSAGES[data.code]; // Lấy thông điệp tiếng Việt theo code
    }

    if (data?.message) {
      return data.message; // Hoặc lấy message mặc định từ backend
    }

    // 2. Nếu server không phản hồi (mất mạng, server tắt)
    if (error.request && !error.response) {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};
