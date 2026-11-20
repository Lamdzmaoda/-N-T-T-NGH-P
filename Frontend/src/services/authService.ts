import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ChangePasswordRequest, User, UserUpdateRequest } from "@/types/User";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    full_name: string,
    phone: string,
  ) => {
    const res = await api.post(
      "/users",
      { username, password, email, phone, full_name },
      { withCredentials: true },
    );

    return res.data;
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "/auth/token",
      { username, password },
      { withCredentials: true },
    );
    return res.data;
  },
  signOut: async () => {
    return api.post("/auth/logout", {}, { withCredentials: true });
  },
  fetchMe: async () => {
    const res = await api.get("/users/myInfo", { withCredentials: true });
    return res.data.result!;
  },
  refresh: async (): Promise<string | undefined> => {
    const res = await api.post("/auth/refresh");
    return res.data.result?.accessToken; // Bắt buộc phải có chữ 'return' ở đây!
  },
  outboundGoogleLogin: async (code: string) =>{
    const res =await api.post(`/auth/outbound/google?code=${code}`,{},
      { params: {code},
        withCredentials: true }
    );
    return res.data;
  },
  verifyOtp: async (email: string, otp: string) => {
    const res = await api.post(
      "/auth/verify-otp",
      { email, otp },
      { withCredentials: true }
    );
    return res.data;
  },
  resendOtp: async (email: string) => {
    const res = await api.post(
      "/auth/resend-otp",
      { email },
      { withCredentials: true }
    );
    return res.data;
  },
  updateProfile: async (userId: string, data: UserUpdateRequest) : Promise<ApiResponse<User>> =>
  {
    const res = await api.put(`/users/${userId}`, data);
    return res.data;
  },
  uploadAvatar: async(file: File): Promise<ApiResponse<User>> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/users/avatar", formData, {
      headers: {
        "Content-Type" : "multipart/form-data",
      },
      withCredentials: true,
    });
    return res.data;
  },
  changePassword: async (data: ChangePasswordRequest) : Promise<ApiResponse<void>> => {
    const res = await api.put("/users/changePassword", data);
    return res.data;
  }
};
