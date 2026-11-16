export type NotificationType =
  | "BUDGET_WARNING"      // Cảnh báo ngân sách chạm 80% (Màu cam)
  | "BUDGET_EXCEEDED"     // Báo động ngân sách vượt 100% (Màu đỏ)
  | "FRIEND_REQUEST"      // Lời mời kết bạn
  | "GROUP_INVITATION"    // Lời mời vào nhóm chia tiền
  | "GROUP_EXPENSE_ADDED" // Có chi tiêu chung mới trong nhóm
  | "SETTLEMENT_REMINDER" // Nhắc thanh toán nợ
  | "CHAT_MESSAGE"        // Tin nhắn mới
  | "SYSTEM";             // Hệ thống

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  unreadCount: number;
}