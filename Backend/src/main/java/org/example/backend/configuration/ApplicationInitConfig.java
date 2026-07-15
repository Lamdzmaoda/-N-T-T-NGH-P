package org.example.backend.configuration;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.example.backend.constrant.PredefinedRole;
import org.example.backend.entity.RBAC.Role;
import org.example.backend.entity.User.User;
import org.example.backend.repository.auth.RoleRepository;
import org.example.backend.repository.auth.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

@Configuration
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {

    PasswordEncoder passwordEncoder;

    @NonFinal
    static final String ADMIN_USER_NAME = "admin";

    @NonFinal
    static final String ADMIN_PASSWORD = "admin";
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository,RoleRepository roleRepository) {
        return args -> {
            var existingAdmin = userRepository.findByUsername(ADMIN_USER_NAME);
            if(existingAdmin.isEmpty()){
                // Lưu role USER nếu chưa có
                if (roleRepository.findById(PredefinedRole.USER_ROLE).isEmpty()) {
                    roleRepository.save(Role.builder()
                            .name(PredefinedRole.USER_ROLE)
                            .description("User role")
                            .build());
                }
                // Lưu role ADMIN nếu chưa có
                Role adminRole;
                var optAdminRole = roleRepository.findById(PredefinedRole.ADMIN_ROLE);
                if (optAdminRole.isEmpty()) {
                    adminRole = roleRepository.save(Role.builder()
                            .name(PredefinedRole.ADMIN_ROLE)
                            .description("Admin role")
                            .build());
                } else {
                    adminRole = optAdminRole.get();
                }
                var roles = new HashSet<Role>();
                roles.add(adminRole);

                User user = User.builder()
                        .username(ADMIN_USER_NAME)
                        .password(passwordEncoder.encode(ADMIN_PASSWORD))
                        .email(ADMIN_USER_NAME + "@example.com")
                        .roles(roles)
                        .build();
               userRepository.save(user);
            } else {
                // Đảm bảo mật khẩu admin luôn là "admin" được mã hóa BCrypt chính xác
                User user = existingAdmin.get();
                user.setPassword(passwordEncoder.encode(ADMIN_PASSWORD));
                userRepository.save(user);
            }
        };
    }
}
