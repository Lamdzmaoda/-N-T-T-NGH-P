import { notificationService } from "@/services/notificationService";
import type { NotificationState } from "@/types/store";
import { create } from "zustand";

/**
 * Zustand Store quản lý trạng thái thông báo toàn cục của ứng dụng.
 * Hỗ trợ tải dữ liệu qua REST API và cập nhật phản ứng tức thì khi WebSocket gửi tin mới.
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [], // Danh sách thông báo
  unreadCount: 0,    // Số lượng thông báo chưa đọc (badge đỏ)
  loading: false,    // Trạng thái đang tải

  // Tải danh sách thông báo từ Backend qua REST API
  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const data = await notificationService.getMyNotifications();
      set({
        notifications: data.notifications,
        unreadCount: data.unreadCount,
      });
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Đánh dấu 1 thông báo là đã đọc (cập nhật Optimistic UI trước, sau đó đồng bộ API)
  markAsRead: async (id) => {
    try {
      set((state) => {
        const item = state.notifications.find((n) => n.id === id);
        const wasUnread = item && !item.isRead;
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
      await notificationService.markAsRead(id);
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
      get().fetchNotifications(); // Fallback nếu API lỗi
    }
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    try {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
      get().fetchNotifications();
    }
  },

  // HÀM XỬ LÝ WEBSOCKET REAL-TIME:
  // Đưa thông báo mới nhận được lên đầu danh sách và tăng biến đếm unreadCount + 1
  addRealtimeNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
