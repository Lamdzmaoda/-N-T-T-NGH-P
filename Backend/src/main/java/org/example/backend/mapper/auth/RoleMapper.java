package org.example.backend.mapper.auth;

import org.example.backend.dto.request.auth.RoleRequest;
import org.example.backend.dto.response.auth.RoleResponse;
import org.example.backend.entity.RBAC.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest roleRequest);
    RoleResponse toRoleResponse(Role role);

}
