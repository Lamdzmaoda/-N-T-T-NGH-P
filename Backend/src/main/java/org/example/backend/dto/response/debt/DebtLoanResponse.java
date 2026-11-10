package org.example.backend.dto.response.debt;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.response.auth.UserSearchResponse;
import org.example.backend.enums.DebtLoanStatus;
import org.example.backend.enums.DebtLoanType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(
        JsonInclude.Include
                .NON_NULL) // Chỉ render ra JSON những trường nào có giá trị (trường null sẽ bị ẩn đi)
public class DebtLoanResponse {
    String id;
    String personName;
    String phone;
    String partnerUserId;
    BigDecimal amount;
    BigDecimal remainingAmount;
    DebtLoanType type;
    DebtLoanStatus status;
    LocalDate dueDate;
    String note;
    String bankName;
    String bankAccount;
    String bankAccountName;
    boolean isOverdue;
    LocalDateTime createdAt;
    UserSearchResponse creator;     // Thông tin người tạo khoản nợ
    LocalDateTime lastRemindedAt; // Thời điểm nhắc nợ gần nhất (phục vụ bộ đếm 24h)
}

