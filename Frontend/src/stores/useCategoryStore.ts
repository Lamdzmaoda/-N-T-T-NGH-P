import { getErrorMessage } from "@/lib/errorHandler";
import { categoryService } from "@/services/categoryService";
import type { CategoryState } from "@/types/store";
import { toast } from "sonner";
import { create } from "zustand";

export const useCategoryStore = create<CategoryState>((set, get) =>({
    categories: [],
    loading: false,

    fetchAllCategories: async() =>{
        if(get().categories.length > 0) return;

        try{
            set ({loading: true});

            const categories = await categoryService.getAllCategories();
            
            set ({ categories });
        }catch(error){
            console.error("Lỗi tải danh mục: ", error);
            toast.error(getErrorMessage(error, "Không thể tải danh mục"));
        } finally{
            set ({loading: false})
        }
    }
}))