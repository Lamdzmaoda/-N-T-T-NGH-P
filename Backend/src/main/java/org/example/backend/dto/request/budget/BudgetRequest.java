package org.example.backend.dto.request.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetRequest {
    @NotBlank(message = "CATEGORY_REQUIRED")
    String categoryId;
    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "1000", message = "AMOUNT_MUST_BE_GREATER_THAN_ZERO")
    BigDecimal amount; // Hạn mức (tối thiểu 1.000 đ)
    Integer month; // Tháng (nếu client không truyền thì lấy tháng hiện tại)
    Integer year;  // Năm (nếu client không truyền thì lấy năm hiện tại)
}
