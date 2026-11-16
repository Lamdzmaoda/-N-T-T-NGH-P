package org.example.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.enums.NotificationType;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                // Đánh chỉ mục hỗn hợp để truy vấn thông báo chưa đọc siêu tốc
                @Index(name = "idx_user_read_created", columnList = "user_id, is_read, created_at")
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    // Người nhận thông báo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;
    @Column(nullable = false, length = 200)
    String title;
    @Column(nullable = false, columnDefinition = "TEXT")
    String message;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    NotificationType type;
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    Boolean isRead = false;
    // Đường dẫn chuyển hướng khi user click (ví dụ: "/budgets" hoặc "/groups/123")
    @Column(name = "action_url")
    String actionUrl;
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

}
