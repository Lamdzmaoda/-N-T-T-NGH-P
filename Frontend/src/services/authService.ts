import api from "@/lib/axios";
import type { User } from "@/types/User";

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
  refresh: async (token?: string | null) =>{
    const res = await api.post("/auth/refresh",{token}, {withCredentials: true});

    return res.data.result?.token;

  }
};
