package org.example.backend.entity.User;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.RBAC.Role;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Lombok: Mặc định mọi trường là 'private'
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @Column( unique = true)
    String username;
    @Email
    @Column(nullable = false)
    String email;
    String password;
    String phone;
    @JsonFormat(pattern = "dd/MM/yyyy")
    LocalDate dob;
    String full_name;
    @ManyToMany
    Set<Role> roles;
    // Trạng thái tài khoản: true = Đang hoạt động, false = Đã khóa
    @Builder.Default
    Boolean isActive = true;
    // Loại tài khoản: NORMAL (đăng ký bằng mật khẩu) hoặc GOOGLE
    @Builder.Default
    String provider = "NORMAL";
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    ProfileUser profile;
}
