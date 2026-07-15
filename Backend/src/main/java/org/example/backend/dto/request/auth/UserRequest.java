package org.example.backend.dto.request.auth;

import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.RBAC.Role;
import org.example.backend.validator.DobConstraint;

import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserRequest {
    @Size(min = 3, message = "USER_INVALID")
    String username;
    String email;
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;
    String phone;
    @DobConstraint(min = 18, message = "INVALID_DOB")
    LocalDate dob;
    String full_name;
}
