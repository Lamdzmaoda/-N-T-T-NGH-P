package org.example.backend.mapper.auth;

import org.example.backend.dto.request.auth.UserRequest;
import org.example.backend.dto.request.auth.UserUpdateRequest;
import org.example.backend.dto.response.auth.UserResponse;
import org.example.backend.entity.User.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserRequest userRequest);
    @Mapping(source = "profile.avatar_url", target = "avatarUrl")
    @Mapping(source = "profile.bio", target = "bio")
    UserResponse toUserResponse(User user);
    @Mapping(target = "roles", ignore = true)
    void updateUser(UserUpdateRequest request, @MappingTarget User user);
}
