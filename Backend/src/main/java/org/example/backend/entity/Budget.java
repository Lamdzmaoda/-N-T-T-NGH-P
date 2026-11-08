package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "budgets",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_budget_user_category_month_year",
                        columnNames = {"user_id", "category_id", "month", "year"}
                )
        }
)
@Data // Getters, Setters, ToString, Equals, HashCode
@Builder // Builder pattern
@AllArgsConstructor // All args constructor
@NoArgsConstructor // No args constructor
@FieldDefaults(level = AccessLevel.PRIVATE) // All fields are private by default
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    // Ngân sách thuộc về User nào (Bắt buộc)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    // Ngân sách áp dụng cho Danh mục nào (Bắt buộc)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    Category category;
    @Column(nullable = false, precision = 19, scale = 4)
    BigDecimal amount;
    // Tháng áp dụng (1 - 12)
    @Column(nullable = false)
    Integer month;
    // Năm áp dụng (ví dụ: 2026)
    @Column(nullable = false)
    Integer year;
    // Cờ chống spam: Đã bắn cảnh báo mốc 80% chưa?
    @Builder.Default
    @Column(name = "notified_at_80", nullable = false)
    Boolean notifiedAt80 = false;
    // Cờ chống spam: Đã bắn cảnh báo mốc 100% chưa?
    @Builder.Default
    @Column(name = "notified_at_100", nullable = false)
    Boolean notifiedAt100 = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
