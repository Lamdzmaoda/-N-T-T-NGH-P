package org.example.backend.entity.TransportNotif;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;
import org.example.backend.enums.NotificationType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    String title;
    @Column(columnDefinition = "TEXT")
    String body;
    @Enumerated(EnumType.STRING)
    NotificationType type;
    Boolean is_read;
    String ref_id;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}