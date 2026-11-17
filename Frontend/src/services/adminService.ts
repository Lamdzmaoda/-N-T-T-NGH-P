import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { AdminUserFilterParams, PageResponse, User } from "@/types/User";



export const adminService = {
    getUsers: async (params: AdminUserFilterParams) : Promise<PageResponse<User>> => {
        const query = new URLSearchParams();
        if (params.keyword) query.append("keyword", params.keyword);
        if (params.role) query.append("role", params.role);
        if (params.startDate) query.append("startDate", params.startDate);
        if (params.endDate) query.append("endDate", params.endDate);
        if (params.page !== undefined) query.append("page", params.page.toString());
        if (params.size !== undefined) query.append("size", params.size.toString());

        const queryString = query.toString() ? `?${query.toString()}` : "";
        const res = await api.get<ApiResponse<PageResponse<User>>>(`/users/admin/list${queryString}`);
        return res.data.result!;
    },

    toggleUserStatus: async (userId : string): Promise<User> => {
        const res = await api.put<ApiResponse<User>>(`/users/${userId}/toggle-status`);
        return res.data.result!;
    },
    deleteUser: async (userId: string): Promise<void> => {
        await api.delete(`/users/${userId}`);
    },
    createUser: async (data: {
        username: string;
    email: string;
    password: string;
    phone: string;
    full_name?: string;
    dob?: string;
    }): Promise<User> => {
        const res = await api.post<ApiResponse<User>>("/users", data);
        return res.data.result!;
    }
}