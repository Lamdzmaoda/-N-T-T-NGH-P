import { create } from "zustand";
import { toast } from "sonner";
import { analyticsService } from "@/services/analyticsService";
import type { AnalyticsState } from "@/types/store";
import { getErrorMessage } from "@/lib/errorHandler";
export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  summary: null,
  cashFlow: [],
  categoryExpenses: [],
  loading: false,
  isCashFlowLoading: false,
  isCategoryExpensesLoading: false,
    
  fetchDashboardSummary: async (month, year) => {
    try{
        set({loading: true});
        const summary = await analyticsService.getDashboardSummary(month, year);
        set({summary})
    } catch (error) {
      console.error("Lỗi tải tóm tắt thống kê:", error);
      toast.error(getErrorMessage(error, "Không thể tải tóm tắt tài chính"));
    } finally {
      set({ loading: false });
    }
  },
  fetchCashFlow: async (year) =>{
    try{
      set({isCashFlowLoading: false});
      const cashFlow = await analyticsService.getCashFlow(year);
      set({cashFlow});
    }catch (error) {
      console.error("Lỗi tải dữ liệu dòng tiền:", error);
      toast.error(getErrorMessage(error, "Không thể tải biểu đồ dòng tiền"));
    } finally {
      set({ isCashFlowLoading: false });
    }
  },
  fetchCategoryExpenses: async (day, month, year) =>{
    try{
      set({isCategoryExpensesLoading: false});
      const categoryExpenses = await analyticsService.getCategoryExpenses(day, month, year);
      set({categoryExpenses});
    } catch (error) {
      console.error("Lỗi tải cơ cấu chi tiêu:", error);
      toast.error(getErrorMessage(error, "Không thể tải cơ cấu chi tiêu"));
    } finally {
      set({ isCategoryExpensesLoading: false });
    }
  }
}))