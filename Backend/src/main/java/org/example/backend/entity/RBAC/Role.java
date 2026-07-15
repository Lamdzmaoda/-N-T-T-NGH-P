package org.example.backend.entity.RBAC;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Lombok: Mặc định mọi trường là 'private'
@Entity
public class Role {
    @Id
    String name;
    // Tên đăng nhập (Username)
    String description;
    @ManyToMany
    Set<Permission> permissions;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
