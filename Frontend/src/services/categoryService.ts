import api from "@/lib/axios";
import type { Category } from "@/types/category";
import type { ApiResponse } from "@/types/api";

export const categoryService = {
    getAllCategories: async() : Promise<Category[]> =>{
        const res = await api.get<ApiResponse<Category[]>>("/categories");
        return res.data.result!;
    }
}