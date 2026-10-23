package org.example.backend.controller.auth;

import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.request.auth.AuthenticationRequest;
import org.example.backend.dto.request.auth.IntrospectRequest;
import org.example.backend.dto.request.auth.LogoutRequest;
import org.example.backend.dto.request.auth.RefreshRequest;
import org.example.backend.dto.response.auth.AuthenticationResponse;
import org.example.backend.dto.response.auth.IntrospectResponse;
import org.example.backend.exception.AppException;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.text.ParseException;

@Slf4j // Hỗ trợ ghi log ra console
@RestController // Đánh dấu là REST API Controller trả về JSON
@RequestMapping("/auth") // Đường dẫn gốc là /users
@RequiredArgsConstructor // Tự động tạo Constructor để Spring tiêm (Inject) các Service vào
@FieldDefaults(
        level = AccessLevel.PRIVATE,
        makeFinal = true) // Tự động biến các biến khai báo thành 'private final'
public class AuthenticationController {
    AuthenticationService authenticationService;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest authenticationRequest,
            HttpServletResponse response) throws AppException, ParseException, JOSEException {
        var result = authenticationService.authenticate(authenticationRequest);
        
        Cookie refreshCookie = new Cookie("refreshToken", result.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 3600); // 7 days
        response.addCookie(refreshCookie);

        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }
    @PostMapping("/logout")
    ApiResponse<Void> logout(
            @RequestBody LogoutRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) throws ParseException, JOSEException {
        
        String token = request.getToken();
        if (token == null || token.isEmpty()) {
            if (servletRequest.getCookies() != null) {
                for (var c : servletRequest.getCookies()) {
                    if ("refreshToken".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }
        
        if (token != null && !token.isEmpty()) {
            authenticationService.logout(LogoutRequest.builder().token(token).build());
        }
        
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ApiResponse.<Void>builder()
                .build();
    }
    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(
            @RequestBody RefreshRequest request,
            HttpServletRequest servletRequest,
            HttpServletResponse response) throws ParseException, JOSEException {
        
        String token = request.getToken();
        if (token == null || token.isEmpty()) {
            if (servletRequest.getCookies() != null) {
                for (var c : servletRequest.getCookies()) {
                    if ("refreshToken".equals(c.getName())) {
                        token = c.getValue();
                        break;
                    }
                }
            }
        }
        
        var result = authenticationService.refreshToken(RefreshRequest.builder().token(token).build());
        
        Cookie refreshCookie = new Cookie("refreshToken", result.getRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(7 * 24 * 3600); // 7 days
        response.addCookie(refreshCookie);

        return ApiResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
}
