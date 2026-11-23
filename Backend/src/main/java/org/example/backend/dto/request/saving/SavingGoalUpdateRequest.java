package org.example.backend.dto.request.saving;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavingGoalUpdateRequest {
    @NotBlank(message = "Tên mục tiêu không được để trống")
    String name;
    @NotNull(message = "Số tiền mục tiêu không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền mục tiêu tối thiểu là 1,000 VND")
    BigDecimal targetAmount;
    LocalDate targetDate;
    String color;
    String icon;
}
