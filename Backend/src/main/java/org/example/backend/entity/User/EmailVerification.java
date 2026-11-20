package org.example.backend.entity.User;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class EmailVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String email;

    @Column(nullable = false, length = 6)
    String otp;

    @Column(nullable = false)
    LocalDateTime expiryTime;

    @Builder.Default
    boolean isUsed = false;

    LocalDateTime createdAt;
}
