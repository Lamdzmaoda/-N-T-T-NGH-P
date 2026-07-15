package org.example.backend.service.auth;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.auth.RoleRequest;
import org.example.backend.dto.response.auth.RoleResponse;
import org.example.backend.mapper.auth.RoleMapper;
import org.example.backend.repository.auth.PermissionRepository;
import org.example.backend.repository.auth.RoleRepository;
import org.springframework.stereotype.Service;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.HashSet;
import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class RoleService {
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionRepository permissionRepository;

    public RoleResponse createRole(RoleRequest roleRequest) {
        var role = roleMapper.toRole(roleRequest);

        var permissions = permissionRepository.findAllById(roleRequest.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        roleRepository.save(role);

        return roleMapper.toRoleResponse(role);
    }
    public List<RoleResponse> getRoles() {
        var roles = roleRepository.findAll();
        return roles.stream().map(roleMapper::toRoleResponse).toList();
    }
    public void deleteRole(String roleId) {
        roleRepository.deleteById(roleId);
    }
}
