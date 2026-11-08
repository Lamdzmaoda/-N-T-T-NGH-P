package org.example.backend.dto.response.budget;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BudgetProgressResponse {
    String id;              // ID ngân sách
    String categoryId;      // ID danh mục
    String categoryName;    // Tên danh mục (ví dụ: Ăn uống, Mua sắm...)
    String categoryColor;   // Màu danh mục
    String categoryIcon;    // Icon danh mục
    BigDecimal spent;       // Số tiền thực tế đã chi tiêu trong tháng
    BigDecimal limit;       // Hạn mức tối đa đã thiết lập
    Double percent;         // % tiến độ chi tiêu (ví dụ: 85.0)
    String barColor;        // Màu thanh progress ("bg-blue-600", "bg-orange-500", "bg-rose-500")
    Boolean isExceeded;     // true nếu chi tiêu đã vượt 100% hạn mức
}
