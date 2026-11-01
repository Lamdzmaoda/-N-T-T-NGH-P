package org.example.backend.dto.response.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.RBAC.Role;

import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse{
    String id;
    String username;
    String email;
    String phone;
    LocalDate dob;
    String full_name;
    Set<RoleResponse> roles;
    String avatarUrl;
    String bio;
}


