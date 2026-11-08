import api from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import type { NotificationListResponse } from "@/types/notification";



export const notificationService = {
    getMyNotifications : async (): Promise<NotificationListResponse> => {
        const res = await api.get<ApiResponse<NotificationListResponse>>("/notifications");
        return res.data.result!;
    },
    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },
    markAllAsRead: async() :Promise<void> =>{
        await api.patch("/notifications/read-all");
    }
};