package org.example.backend.dto.request.debt;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.DebtLoanType;
import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DebtLoanRequest {
    @NotBlank(message = "Tên đối tác không được để trống")
    String personName;
    String phone;
    String partnerUserId;
    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    BigDecimal amount;
    @NotNull(message = "Loại công nợ không được để trống")
    DebtLoanType type; // LOAN hoặc DEBT
    @FutureOrPresent(message = "Hạn trả nợ phải từ ngày hôm nay trở đi")
    LocalDate dueDate;
    String note;
    String bankName;
    String bankAccount;
    String bankAccountName;
}
