import { getErrorMessage } from "@/lib/errorHandler";
import { budgetService } from "@/services/budgetService";
import type { BudgetState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgets: [],
  loading: false,

  fetchBudgetProgress: async (month, year) => {
    try {
      set({ loading: true });
      const budgets = await budgetService.getBudgetProgress(month, year);
      set({ budgets });
    } catch (error) {
      console.error("Lỗi tải tóm tắt thống kê:", error);
      toast.error(getErrorMessage(error, "Không thể tải tóm tắt tài chính"));
    } finally {
      set({ loading: false });
    }
  },
  createBudget: async (data) => {
    try {
      set({ loading: true });
      await budgetService.createBudget(data);
      toast.success("Tạo hạn mức thành công");
      await get().fetchBudgetProgress();
    } catch (error) {
      console.error("Lỗi khi tạo hạn mức:", error);
      toast.error(getErrorMessage(error, "Không thể tạo hạn mức"));
    } finally {
      set({ loading: false });
    }
  },
  deleteBudget: async (id) => {
    try {
      set({ loading: true });
      await budgetService.deleteBudget(id);
      toast.success("Xóa hạn mức thành công");
      await get().fetchBudgetProgress();
    } catch (error) {
      console.error("Lỗi khi xóa hạn mức:", error);
      toast.error(getErrorMessage(error, "Không thể xóa ngân sách"));
    } finally {
      set({ loading: false });
    }
  },
}));
