import api from "@/lib/axios";
import type { Category, CategoryRequest, CategoryType } from "@/types/category";
import type { ApiResponse } from "@/types/api";
import { data } from "react-router";

export const categoryService = {
    getAllCategories: async() : Promise<Category[]> =>{
        const res = await api.get<ApiResponse<Category[]>>("/categories");
        return res.data.result!;
    },

    getAdminCategories: async(): Promise<Category[]> => {
        const res = await api.get<ApiResponse<Category[]>>("/categories/admin")
        return res.data.result!;
    },
    createCategory: async(data: CategoryRequest): Promise<Category> => {
        const res = await api.post<ApiResponse<Category>>("/categories",data);
        return res.data.result!;
    },
    updateCategory: async(id: string, data: CategoryRequest): Promise<Category> => {
        const res = await api.put<ApiResponse<Category>>(`/categories/${id}`);
        return res.data.result!;
    },
    deleteCategory: async(id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
    restoreCategory: async(id: string): Promise<void> => {
        await api.put(`/categories/trash/${id}`);
    },
    // ADMIN API
    createAdminCategory: async(data: {
        name: string,
        type: CategoryType,
        icon?: string,
        color?: string
    }): Promise<Category> =>{
        const res = await api.post<ApiResponse<Category>>("/categories/admin", data);
        return res.data.result!;
    },

    updateAdminCategory: async(id: string, data: {
        name: string;
        type: CategoryType;
        icon?: string;
        color?: string;
    }): Promise<Category> => {
        const res = await api.put<ApiResponse<Category>>(`/categories/admin/${id}`, data);
        return res.data.result!;
    },

    // Ẩn hoặc Hiện danh mục (Xóa mềm)
    toggleAdminCategoryStatus: async(id: string): Promise<void> => {
        await api.delete(`/categories/admin/${id}`);
    },
    // Xóa vĩnh viễn khỏi Database
    permanentDeleteAdminCategory: async(id: string): Promise<void> => {
        await api.delete(`/categories/admin/trash/${id}`);
    }
}