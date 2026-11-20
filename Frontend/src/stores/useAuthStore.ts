import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { getErrorMessage } from "@/lib/errorHandler";
import type { UserUpdateRequest } from "@/types/User";

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  loading: false,

  clearState: () => {
    set({ token: null, user: null, loading: false });
  },

  setAccessToken: (accessToken) => {
    set({ token: accessToken });
  },

  signUp: async (username, password, email, phone, full_name) => {
    try {
      set({ loading: true });

      await authService.signUp(username, password, email, phone, full_name);

      toast.success("đăng ký thành công! Bạn sẽ được chuyển sang trang chủ");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Đăng ký thất bại"));
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (username, password) => {
    try {
      set({ loading: true });
      const res = await authService.signIn(username, password);
      const token = res.result?.token;

      get().setAccessToken(token);
      await get().fetchMe();
      toast.success("đăng nhập thành công! Bạn sẽ được chuyển sang trang chủ");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Đăng nhập thất bại"));
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      get().clearState();
      localStorage.removeItem("token");

      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, "Đăng xuất thất bại"));
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
    } catch (error) {
      console.error(error);
      set({ user: null, token: null });
      toast.error("Lỗi xảy ra khi lấy giữ liệu nguời dùng.Hãy thử lại");
    } finally {
      set({ loading: false });
    }
  },
  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();
      if (accessToken) {
        setAccessToken(accessToken);
        if (!user) {
          await fetchMe();
        }
      } else {
        get().clearState();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        getErrorMessage(error, "Phiên đăng nhập đã hết, hãy đăng nhập lại"),
      );
      get().clearState();
    } finally {
      set({ loading: false });
    }
  },
  loginWithGoogle: async (code: string) => {
    try {
      set({ loading: true });
      const res = await authService.outboundGoogleLogin(code);
      const token = res.result?.accessToken || res.result?.token;

      if (token) {
        get().setAccessToken(token);
        await get().fetchMe();
        toast.success("Đăng nhập Google thành công! Đang chuyển hướng...");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      toast.error(getErrorMessage(error, "Đăng nhập Google thất bại"));
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  verifyOtp: async (email: string, otp: string) => {
    try {
      set({ loading: true });
      const res = await authService.verifyOtp(email, otp);
      const token = res.result?.accessToken || res.result?.token;

      if (token) {
        get().setAccessToken(token);
        await get().fetchMe();
        toast.success(
          "Kích hoạt tài khoản thành công! Đang chuyển đến Dashboard...",
        );
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      toast.error(
        getErrorMessage(error, "Mã OTP không chính xác hoặc đã hết hạn"),
      );
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  resendOtp: async (email: string) => {
    try {
      await authService.resendOtp(email);
      toast.success("Đã gửi mã OTP mới tới email của bạn!");
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      toast.error(getErrorMessage(error, "Không thể gửi lại mã OTP"));
      throw error;
    }
  },
  updateProfile: async (data: UserUpdateRequest) => {
    const currentUser = get().user;
    if (!currentUser?.id) return;

    try {
      set({ loading: true });
      const res = await authService.updateProfile(currentUser.id, data);
      const updatedUser = res.result;

      if (updatedUser) {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
        }));
        toast.success("Lưu thông tin cá nhân thành công!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      toast.error(getErrorMessage(error, "Cập nhật thông tin thất bại"));
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  uploadAvatar: async(file: File) => {
    try {
      set({loading: true});
      const res = await authService.uploadAvatar(file);
      const updatedUser = res.result;

      if(updatedUser){
        set((state) => ({
          user: state.user ? {...state.user, avatarUrl: updatedUser.avatarUrl} : updatedUser
        }));
        toast.success("Cập nhật ảnh đại diện thành công!");
      }
    } catch (error) {
      console.error("Lỗi upload avatar:", error);
      toast.error(getErrorMessage(error, "Không thể tải ảnh đại diện lên"));
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));
