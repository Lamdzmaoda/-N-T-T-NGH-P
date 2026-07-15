package org.example.backend.service.auth;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.request.auth.PermissionRequest;
import org.example.backend.dto.response.auth.PermissionResponse;
import org.example.backend.entity.RBAC.Permission;
import org.example.backend.mapper.auth.PermissionMapper;
import org.example.backend.repository.auth.PermissionRepository;
import org.springframework.stereotype.Service;

import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class PermissionService {
    PermissionRepository permissionRepository;
    PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest request){
        Permission permission = permissionMapper.toPermission(request);
        permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);

    }
    public List<PermissionResponse> getPermission(){
        var permission = permissionRepository.findAll();
        return permission.stream().map(permissionMapper::toPermissionResponse).toList();
    }

    public void delete(String permissionName){
        permissionRepository.deleteById(permissionName);

    }
}
