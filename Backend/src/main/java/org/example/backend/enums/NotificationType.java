package org.example.backend.enums;

public enum NotificationType {
    BUDGET_WARNING,      // Cảnh báo ngân sách chạm mốc 80% (Màu cam)
    BUDGET_EXCEEDED,     // Báo động ngân sách vượt 100% (Màu đỏ)
    FRIEND_REQUEST,      // Lời mời kết bạn
    GROUP_INVITATION,    // Lời mời vào nhóm chia tiền
    GROUP_EXPENSE_ADDED, // Có khoản chi tiêu chung mới trong nhóm
    SETTLEMENT_REMINDER, // Nhắc thanh toán nợ cuộc vui / tiền trọ
    CHAT_MESSAGE,        // Tin nhắn mới trong nhóm
    SYSTEM,               // Thông báo hệ thống (Màu xanh)
    DEBT_CONFIRMATION_REQUEST // Yêu cầu xác nhận công nợ từ người khác
}
