import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development"
    ? "http://localhost:8080/travel-ai-planner"
    : "/travel-ai-planner";
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:8080/travel-ai-planner"
      : "/travel-ai-planner",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const token = useAuthStore.getState().token;

    if (
      originalRequest.url?.includes("/auth/token") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;
    if (error.response?.status === 401 || error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;

      console.log("refresh", originalRequest._retryCount);
      try {
        const res = await axios.post(
            `${BASE_URL}/auth/refresh`,
            { token }
        );
        const newAccessToken = res.data.result?.token;

        if (newAccessToken) {
          console.log(
            "✅ Refresh token thành công! Token mới:",
            newAccessToken.substring(0, 20) + "...",
          );
        

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        }
      } catch (error) {
        useAuthStore.getState().clearState();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
