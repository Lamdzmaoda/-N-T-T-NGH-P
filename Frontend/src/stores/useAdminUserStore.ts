import { adminService } from "@/services/adminService";
import type { AdminUserState } from "@/types/store";
import type { AdminUserFilterParams } from "@/types/User";
import { toast } from "sonner";
import { create } from "zustand";

const defaultFilters: AdminUserFilterParams = {
  keyword: "",
  role: "",
  startDate: "",
  endDate: "",
  page: 0,
  size: 5,
};

export const useAdminUserStore = create<AdminUserState>((set, get) => ({
  userPage: null,
  loading: false,
  filters: defaultFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchUsers(0);
  },

  fetchUsers: async (pageOverride) => {
    try {
      set({ loading: true });
      const currentFilters = get().filters;
      const targetPage =
        pageOverride !== undefined ? pageOverride : (currentFilters.page ?? 0);

      const params: AdminUserFilterParams = {
        ...currentFilters,
        page: targetPage,
      };

      const data = await adminService.getUsers(params);

      set({
        userPage: data,
        filters: { ...currentFilters, page: targetPage },
      });
    } catch (error) {
      console.error("Lỗi tải danh sách người dùng:", error);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      set({ loading: false });
    }
  },

  toggleUserStatus: async (userId: string) => {
    try {
        await adminService.toggleUserStatus(userId);

        await get().fetchUsers();
    } catch (error) {
        console.error("Lỗi đổi trạng thái tài khoản:", error);
        throw error;
    }
  }
}));
