import api from "@/lib/axios";
import type { CashFlowResponse, CategoryExpenseResponse, DashboardSummaryResponse } from "@/types/analytics";
import type { ApiResponse } from "@/types/api";

export const analyticsService = {
    getDashboardSummary: async(month?: number, year?: number) : Promise<DashboardSummaryResponse> =>{
        const params = new URLSearchParams();
        if(month) params.append("month", month.toString());
        if(year) params.append("year", year.toString());

        const queryString = params.toString() ? `?${params.toString()}` : "";

        const res = await api.get<ApiResponse<DashboardSummaryResponse>>(`/analytics/dashboard-summary${queryString}`);
        return res.data.result!;
    },
    getCashFlow: async(year?: number) : Promise<CashFlowResponse[]> =>{
        const params = new URLSearchParams();
        if(year) params.append("year", year.toString());

        const queryString = params.toString() ? `?${params.toString()}` : "";

        const res = await api.get<ApiResponse<CashFlowResponse[]>>(`/analytics/cash-flow${queryString}`);
        return res.data.result ?? [];
    },
    getCategoryExpenses: async(day?: number, month?: number, year?: number) : Promise<CategoryExpenseResponse[]> =>{
        const params = new URLSearchParams();

        if(day) params.append("day", day.toString());
        if(month) params.append("month", month.toString());
        if(year) params.append("year", year.toString());

        const queryString = params.toString() ? `?${params.toString()}` : "";

        const res = await api.get<ApiResponse<CategoryExpenseResponse[]>>(`/analytics/category-expenses${queryString}`);
        return res.data.result ?? [];
    }
}