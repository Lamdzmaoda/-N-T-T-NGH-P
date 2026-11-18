package org.example.backend.service.auth;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.client.GoogleIdentityClient;
import org.example.backend.constrant.PredefinedRole;
import org.example.backend.dto.request.auth.ChangePasswordRequest;
import org.example.backend.dto.request.auth.UserRequest;
import org.example.backend.dto.request.auth.UserUpdateRequest;
import org.example.backend.dto.response.auth.AuthenticationResponse;
import org.example.backend.dto.response.auth.UserResponse;
import org.example.backend.entity.RBAC.Role;
import org.example.backend.entity.User.ProfileUser;
import org.example.backend.entity.User.User;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.mapper.auth.UserMapper;
import org.example.backend.repository.auth.RoleRepository;
import org.example.backend.repository.auth.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;


import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;


    private final AuthenticationService authenticationService;


    public UserResponse createUser(UserRequest userRequest) {
        if(userRepository.existsByUsername(userRequest.getUsername())){
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(userRequest);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // ✅ Gán role mặc định USER cho người dùng mới đăng ký
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(PredefinedRole.USER_ROLE).ifPresent(roles::add);
        user.setRoles(roles);

        user = userRepository.save(user);

        ProfileUser profileUser = ProfileUser.builder()
                .user(user)
                .bio("")
                .avatar_url("")
                .build();
        user.setProfile(profileUser);

        // ✅ Lưu lại lần nữa để cascade ProfileUser lưu vào database
        user = userRepository.save(user);

        return userMapper.toUserResponse(user);
    }
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper :: toUserResponse).toList();

    }
    @PostAuthorize("returnObject.username == authentication.name")
    public UserResponse getUser(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo() {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse updateUser(UserUpdateRequest request, String userId) {
        User user = userRepository.findById(userId).orElseThrow();

        userMapper.updateUser(request, user);
        ProfileUser profileUser = user.getProfile();
        if(profileUser == null){
            profileUser = ProfileUser.builder().user(user).build();
        }
        if(request.getAvatarUrl() != null){
            profileUser.setAvatar_url(request.getAvatarUrl());
        }
        if(request.getBio() != null){
            profileUser.setBio(request.getBio());
        }
        user.setProfile(profileUser);
        return userMapper.toUserResponse(userRepository.save(user));
    }
    @PostAuthorize("returnObject.username == authentication.name")
    public void updatePassword(ChangePasswordRequest request){
        var user = authenticationService.getUserByContext();

        if(!passwordEncoder.matches(request.getOldPassword(), user.getPassword()))
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        if(passwordEncoder.matches(request.getNewPassword(), user.getPassword())){
            throw new AppException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }
        if(!request.getNewPassword().equals(request.getConfirmPassword())){
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }



    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setIsActive(false);
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public UserResponse uploadAvatar(MultipartFile file) {
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));


        ProfileUser profileUser = user.getProfile();
        if (profileUser == null) {
            profileUser = ProfileUser.builder()
                    .user(user)
                    .build();
        }
        user.setProfile(profileUser);

        return userMapper.toUserResponse(userRepository.save(user));
    }
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse toggleUserStatus(String userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean currentStatus = user.getIsActive() != null ? user.getIsActive() : true;

        user.setIsActive(!currentStatus);

        return userMapper.toUserResponse(userRepository.save(user));
    }
    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getUsersWithFilters(
            String keyword,
            String role,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ){
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        Page<User> userPage = userRepository.findUsersWithFilters(keyword, role, start, end, pageable);

        return userPage.map(userMapper::toUserResponse);
    }
}
