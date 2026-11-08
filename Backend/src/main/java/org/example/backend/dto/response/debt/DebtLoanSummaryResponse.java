package org.example.backend.dto.response.debt;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

/**
 * DTO chứa 4 chỉ số vàng và dữ liệu tổng quan công nợ của người dùng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtLoanSummaryResponse {
    // 1. Chỉ số người khác nợ mình (Khoản phải thu - LOAN)
    BigDecimal totalLent;       // Tổng số tiền đã cho vay từ trước đến nay
    BigDecimal remainingLent;   // Tổng số tiền người khác CÒN NỢ MÌNH (Chờ thu hồi)

    // 2. Chỉ số mình nợ người khác (Khoản phải trả - DEBT)
    BigDecimal totalBorrowed;      // Tổng số tiền mình đã đi vay
    BigDecimal remainingBorrowed;  // Tổng số tiền MÌNH CÒN NỢ người khác

    // 3. Công nợ ròng (Net Balance = remainingLent - remainingBorrowed)
    // Nếu dương (+): Người khác nợ mình nhiều hơn -> Vị thế tài chính an toàn
    // Nếu âm (-): Mình đang nợ người khác nhiều hơn -> Cần cảnh giác
    BigDecimal netBalance;

    // 4. Số khoản nợ đang bị quá hạn cần xử lý gấp
    long overdueCount;
}