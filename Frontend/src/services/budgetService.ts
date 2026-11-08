import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { BudgetProgressResponse, BudgetRequest } from "@/types/budget";

export const budgetService = {
    getBudgetProgress: async (month?: number, year?: number): Promise<BudgetProgressResponse[]> =>{
        const params = new URLSearchParams();
        if(month) params.append("month", month.toString());
        if(year) params.append("year", year.toString());

        const queryString = params.toString() ? `?${params.toString()}` : "";
        const res = await api.get<ApiResponse<BudgetProgressResponse[]>>(`/budgets/progress${queryString}`);
        return res.data.result ?? []
    },
    createBudget: async (data: BudgetRequest): Promise<BudgetProgressResponse> =>{
        const res = await api.post<ApiResponse<BudgetProgressResponse>>("/budgets",data);
        return res.data.result!;
    },
    updateBudget: async (id: string, data: BudgetRequest): Promise<BudgetProgressResponse> =>{
        const res = await api.put<ApiResponse<BudgetProgressResponse>>(`/budgets/${id}`, data);
        return res.data.result!;
    },
    deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },
}