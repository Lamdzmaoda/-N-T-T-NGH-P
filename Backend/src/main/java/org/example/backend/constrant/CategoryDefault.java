package org.example.backend.constrant;

import org.example.backend.entity.Category;
import org.example.backend.enums.CategoryType;

import java.util.List;

public class CategoryDefault {

    public static final List<Category> defaultCategories = List.of(
            // Khoản chi (EXPENSE) - 7 danh mục
            Category.builder().name("Ăn uống").type(CategoryType.EXPENSE).icon("utensils").color("#FF5722")
                    .isDefault(true).build(),
            Category.builder().name("Mua sắm").type(CategoryType.EXPENSE).icon("shopping-bag").color("#E91E63")
                    .isDefault(true).build(),
            Category.builder().name("Di chuyển").type(CategoryType.EXPENSE).icon("car").color("#2196F3").isDefault(true)
                    .build(),
            Category.builder().name("Hóa đơn & Tiện ích").type(CategoryType.EXPENSE).icon("file-invoice")
                    .color("#FF9800").isDefault(true).build(),
            Category.builder().name("Giải trí").type(CategoryType.EXPENSE).icon("gamepad").color("#9C27B0")
                    .isDefault(true).build(),
            Category.builder().name("Sức khỏe").type(CategoryType.EXPENSE).icon("heart-pulse").color("#4CAF50")
                    .isDefault(true).build(),
            Category.builder().name("Giáo dục").type(CategoryType.EXPENSE).icon("graduation-cap").color("#00BCD4")
                    .isDefault(true).build(),
            // Khoản thu (INCOME) - 4 danh mục
            Category.builder().name("Tiền lương").type(CategoryType.INCOME).icon("wallet").color("#4CAF50")
                    .isDefault(true).build(),
            Category.builder().name("Thưởng").type(CategoryType.INCOME).icon("gift").color("#FFC107").isDefault(true)
                    .build(),
            Category.builder().name("Đầu tư").type(CategoryType.INCOME).icon("chart-line").color("#3F51B5")
                    .isDefault(true).build(),
            Category.builder().name("Thu nhập phụ").type(CategoryType.INCOME).icon("coins").color("#009688")
                    .isDefault(true).build());

    private CategoryDefault() {
    }
}
