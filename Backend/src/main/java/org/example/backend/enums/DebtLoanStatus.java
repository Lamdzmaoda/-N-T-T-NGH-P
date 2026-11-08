package org.example.backend.enums;

public enum DebtLoanStatus {
    ACTIVE,  // Đang có hiệu lực (còn nợ)
    PAID,    // Đã thanh toán xong (remainingAmount = 0)
    OVERDUE,  // Quá hạn trả nợ
    PENDING_CONFIRMATION,   // Chờ đối tác xác nhận (khi tạo nợ liên kết User khác)
    REJECTED                // Đối tác từ chối khoản nợ
}
