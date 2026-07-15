package org.example.backend.mapper.auth;

import org.example.backend.dto.request.auth.PermissionRequest;
import org.example.backend.dto.response.auth.PermissionResponse;
import org.example.backend.entity.RBAC.Permission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);
    PermissionResponse toPermissionResponse(Permission permission);

}
