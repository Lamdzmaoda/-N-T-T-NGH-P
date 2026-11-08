package org.example.backend.dto.response.debt;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(
        JsonInclude.Include
                .NON_NULL) // Chỉ render ra JSON những trường nào có giá trị (trường null sẽ bị ẩn đi)
public class DebtRepaymentResponse {
    String id;
    String debtLoanId;
    BigDecimal amount;
    BigDecimal remainingAmountAfter; // Số tiền nợ còn lại ngay sau lần trả này
    LocalDateTime repaymentDate;
    String paymentMethod;
    String note;
    LocalDateTime createdAt;
}