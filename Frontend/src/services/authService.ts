import api from "@/lib/axios";
import type { User } from "@/types/User";
import { useAuthStore } from "@/stores/useAuthStore";

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
      {username, password, email, phone, full_name},
      { withCredentials: true },
    );

    return res.data
  },

  signIn: async(
    username: string,
    password: string,
  )=>{
    const res = await api.post(
      "/auth/token",
      {username, password},
      {withCredentials: true},
    );
    return res.data
  },
  signOut: async() =>{
    return api.post("/auth/logout", {}, {withCredentials: true})
  },
  fetchMe: async() =>{
    const res = await api.get("/users/myInfo", {withCredentials: true});
    return res.data.result!;
  },
  refresh: async (): Promise<string | undefined> => {
  const res = await api.post("/auth/refresh");
  return res.data.result?.accessToken; // Bắt buộc phải có chữ 'return' ở đây!
},
};
