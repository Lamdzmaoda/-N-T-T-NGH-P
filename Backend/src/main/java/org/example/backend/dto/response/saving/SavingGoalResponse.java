package org.example.backend.dto.response.saving;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.SavingGoalStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavingGoalResponse {
    String id;
    String name;

    // Thông tin ví lưu trữ tiền thực tế
    String walletId;
    String walletName;
    BigDecimal targetAmount;
    BigDecimal currentAmount;
    LocalDate targetDate;
    String color;
    String icon;
    SavingGoalStatus status;
    // Các trường đòn bẩy tính toán sẵn cho Frontend
    Double progressPercentage;
    BigDecimal remainingAmount;
    Long daysRemaining;
    Boolean isCompleted;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}