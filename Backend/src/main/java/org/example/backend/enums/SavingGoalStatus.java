package org.example.backend.enums;

public enum SavingGoalStatus {
    IN_PROGRESS, // Đang trong quá trình tích lũy
    COMPLETED,   // Đã đạt mục tiêu (currentAmount >= targetAmount)
    FULFILLED,   // Đã hiện thực hóa / đã dùng tiền mua sắm món đồ đó
    CANCELLED    // Người dùng hủy mục tiêu
}
