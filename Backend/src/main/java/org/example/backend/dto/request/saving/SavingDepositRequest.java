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
public class SavingDepositRequest {
    @NotBlank(message = "Vui lòng chọn ví nguồn để nạp tiền")
    String walletId;
    @NotNull(message = "Số tiền nạp không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền nạp tối thiểu là 1,000 VND")
    BigDecimal amount;
    String note;
}
