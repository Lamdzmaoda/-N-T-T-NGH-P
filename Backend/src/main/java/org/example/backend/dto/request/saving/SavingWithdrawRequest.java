package org.example.backend.dto.request.saving;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavingWithdrawRequest {
    @NotBlank(message = "Vui lòng chọn ví nhận tiền")
    String walletId;
    @NotNull(message = "Số tiền rút không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền rút tối thiểu là 1,000 VND")
    BigDecimal amount;
    String note;
}