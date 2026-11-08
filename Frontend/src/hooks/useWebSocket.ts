import { webSocketService } from "@/services/WebSocketService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";

/**
 * Hook quản lý vòng đời của kết nối WebSocket theo trạng thái đăng nhập của người dùng.
 * - Khi có Token: Tự động khởi tạo kết nối WebSocket.
 * - Khi mất Token (Đăng xuất / hết hạn phiên): Tự động ngắt kết nối để giải phóng tài nguyên.
 */
export function useWebSocket() {
  // Lấy access token hiện tại từ Auth Store
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Nếu đã đăng nhập và có token: Mở kết nối WebSocket
    if (token) {
      webSocketService.connect(token);
    } else {
      // Nếu chưa đăng nhập hoặc vừa bấm Đăng xuất: Ngắt kết nối ngay
      webSocketService.disconnect();
    }

    return () => {
      // Khi unmount component, giữ kết nối thông suốt nếu token vẫn còn hợp lệ
    };
  }, [token]); // Chạy lại mỗi khi token thay đổi (đăng nhập, refresh token, đăng xuất)
}
