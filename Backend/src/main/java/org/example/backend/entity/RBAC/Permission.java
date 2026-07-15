package org.example.backend.entity.RBAC;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Lombok: Mặc định mọi trường là 'private'
@Entity
public class Permission {
    @Id
    String name;
    // Tên đăng nhập (Username)
    String description;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
