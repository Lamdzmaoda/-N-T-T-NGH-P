package org.example.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.enums.SavingGoalStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "saving_goals")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SavingGoal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    // Phân quyền theo người dùng (Multi-tenancy)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    // Ví chuyên dụng loại SAVING lưu trữ tiền thật của mục tiêu này
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    Wallet wallet;
    @Column(name = "name", nullable = false, length = 150)
    String name;
    // Số tiền mục tiêu kỳ vọng
    @Column(name = "target_amount", nullable = false, precision = 19, scale = 4)
    BigDecimal targetAmount;
    // Hạn định đạt mục tiêu
    @Column(name = "target_date")
    LocalDate targetDate;
    // Mã màu hex hiển thị UI (VD: #10B981)
    @Builder.Default
    @Column(name = "color", length = 30)
    String color = "#10B981";
    // Icon hiển thị UI (VD: piggy-bank, car, plane)
    @Builder.Default
    @Column(name = "icon", length = 50)
    String icon = "piggy-bank";
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    SavingGoalStatus status = SavingGoalStatus.IN_PROGRESS;
    // Xóa mềm
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    Boolean isDeleted = false;
    @Column(name = "deleted_at")
    LocalDateTime deletedAt;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
