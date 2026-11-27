import { getErrorMessage } from "@/lib/errorHandler";
import { categoryService } from "@/services/categoryService";
import type { CategoryState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  submitting: false,

  fetchAllCategories: async (force = false) => {
    if (!force && get().categories.length > 0) return;
    try {
      set({ loading: true });
      const categories = await categoryService.getAllCategories();
      set({ categories });
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error(getErrorMessage(error, "Không thể tải danh mục"));
    } finally {
      set({ loading: false });
    }
  },
  createCategory: async (data) => {
    try {
      set({ submitting: true });
      await categoryService.createCategory(data);
      toast.success(`Đã tạo danh mục "${data.name}" thành công`);
      await get().fetchAllCategories(true);
      return true;
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
      toast.error(getErrorMessage(error, "Không thể tải danh mục"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
  updateCategory: async (id, data) => {
    try {
      set({ submitting: true });
      await categoryService.updateCategory(id, data);
      toast.success("Cập nhật danh mục thành công");
      await get().fetchAllCategories(true);
      return true;
    } catch (error) {
        console.error("Lỗi cập nhật danh mục:", error);
        toast.error(getErrorMessage(error, "Không thể cập nhật danh mục"));
       return false;
    }finally {
      set({ submitting: false });
    }
  },
  deleteCategory: async (id) => {
    try {
      set({ submitting: true });
      await categoryService.deleteCategory(id);
      toast.success("Đã xóa danh mục thành công");
      await get().fetchAllCategories(true);
      return true;
    } catch (error) {
      console.error("Lỗi xóa danh mục:", error);
      toast.error(getErrorMessage(error, "Không thể xóa danh mục"));
      return false;
    } finally {
      set({ submitting: false });
    }
  },
}));
