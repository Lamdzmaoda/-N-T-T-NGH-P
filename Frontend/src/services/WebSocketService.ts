import { useBudgetStore } from "@/stores/useBudgetStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import type { NotificationResponse } from "@/types/notification";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";

// Địa chỉ WebSocket: Trong môi trường dev trỏ về cổng backend 8080 qua đường dẫn /api/ws
const WS_URL =
  import.meta.env.MODE === "development" ? "http://localhost:8080/api/ws" : "/api/ws";

/**
 * Service quản lý kết nối STOMP Client qua WebSocket/SockJS.
 * Chịu trách nhiệm mở kết nối, gửi Bearer Token xác thực, đăng ký lắng nghe kênh thông báo
 * và kích hoạt phản hồi tức thì trên giao diện (Zustand Stores, Sonner Toast).
 */
class WebSocketService {
  private client: Client | null = null; // Thể hiện của STOMP Client
  private currentToken: string | null = null; // Ghi nhớ token hiện tại để tránh kết nối trùng lặp

  public connect(token: string) {
    // Nếu client đang hoạt động và token không đổi thì không cần kết nối lại
    if (this.client && this.client.active && this.currentToken === token) {
      return;
    }

    // Nếu đã có kết nối cũ thì ngắt trước khi mở kết nối mới
    this.disconnect();
    this.currentToken = token;

    // Khởi tạo STOMP Client
    this.client = new Client({
      // Sử dụng SockJS để tạo kết nối fallback an toàn
      webSocketFactory: () => new SockJS(WS_URL),
      // Gửi token xác thực ngay trong frame CONNECT
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // Tự động thử kết nối lại sau 5 giây nếu bị rớt mạng
      reconnectDelay: 5000,
      // Gửi tín hiệu nhịp tim (heartbeat) để duy trì kết nối sống (4 giây/lần)
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      // Hàm callback chạy khi bắt tay kết nối thành công với Backend
      onConnect: (frame) => {
        console.log("✅ WebSocket Connected:", frame);

        // ĐĂNG KÝ (SUBSCRIBE) KÊNH THÔNG BÁO RIÊNG CỦA CHÍNH MÌNH:
        this.client?.subscribe("/user/queue/notifications", (message) => {
          if (!message.body) return;

          try {
            // Chuyển chuỗi JSON từ server gửi về thành đối tượng NotificationResponse
            const notification: NotificationResponse = JSON.parse(message.body);

            // Đảm bảo luôn có thời gian (fallback về giờ hiện tại nếu server gửi thiếu)
            if (!notification.createdAt) {
              notification.createdAt = new Date().toISOString();
            }

            console.log("📩 Nhận thông báo mới:", notification);

            // 1. Cập nhật vào Zustand Store -> Quả chuông tự nhảy số đỏ + Dropdown thêm mục mới
            useNotificationStore
              .getState()
              .addRealtimeNotification(notification);

            // 2. Hiển thị thông báo Popup (Sonner Toast) nổi bật góc màn hình
            if (notification.type === "BUDGET_EXCEEDED") {
              toast.error(notification.title, {
                description: notification.message,
                duration: 6000, // Hiện trong 6 giây
              });
            } else if (notification.type === "BUDGET_WARNING") {
              toast.warning(notification.title, {
                description: notification.message,
                duration: 5000, // Hiện trong 5 giây
              });
            } else {
              toast.info(notification.title, {
                description: notification.message,
                duration: 4000,
              });
            }

            // 3. Nếu là thông báo liên quan đến ngân sách, tự động kích hoạt tải lại tiến độ
            // Giúp thanh Progress bar trên Dashboard tự đổi sang màu đỏ ngay lập tức mà không cần F5
            if (
              notification.type === "BUDGET_WARNING" ||
              notification.type === "BUDGET_EXCEEDED"
            ) {
              const now = new Date();
              useBudgetStore
                .getState()
                .fetchBudgetProgress(now.getMonth() + 1, now.getFullYear());
            }
          } catch (error) {
            console.error("Lỗi parse WebSocket message:", error);
          }
        });
      },

      // Bắt lỗi nếu giao thức STOMP gặp sự cố
      onStompError: (frame) => {
        console.error("❌ STOMP Error:", frame.headers["message"], frame.body);
      },

      // In log khi kết nối bị đóng
      onWebSocketClose: () => {
        console.log("🔌 WebSocket Disconnected");
      },
    });

    // Kích hoạt tiến trình kết nối
    this.client.activate();
  }

  // Hàm ngắt kết nối an toàn khi người dùng đăng xuất
  public disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.currentToken = null;
      console.log("🛑 WebSocket đã ngắt kết nối");
    }
  }
}

// Xuất ra một instance duy nhất (Singleton pattern) để dùng chung cho toàn bộ App
export const webSocketService = new WebSocketService();
