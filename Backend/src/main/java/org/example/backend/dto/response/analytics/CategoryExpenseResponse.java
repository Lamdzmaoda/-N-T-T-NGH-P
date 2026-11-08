package org.example.backend.dto.response.analytics;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryExpenseResponse {
    String categoryId;
    String categoryName;
    String categoryColor;
    String categoryIcon;
    BigDecimal amount;     // Tổng số tiền chi tiêu cho danh mục này
    Double percentage;     // Tỉ lệ % trên tổng chi tiêu tháng (ví dụ: 35.5)
}
