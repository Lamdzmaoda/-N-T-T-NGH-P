package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;

/**
 * Bộ lọc (ChannelInterceptor) bảo mật cho WebSocket STOMP.
 * Nhiệm vụ: Đọc Bearer token từ header lúc Client gửi frame CONNECT,
 * xác thực tính hợp lệ và thiết lập Principal định danh User cho kết nối.
 */
@Slf4j // Hỗ trợ in log ra màn hình console
@Component // Đăng ký lớp này là 1 Spring Bean
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    // Service xử lý giải mã và kiểm tra tính hợp lệ của JWT Token
    private final AuthenticationService authenticationService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // Trích xuất các header của gói tin STOMP (CONNECT, SUBSCRIBE, SEND...)
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Chỉ kiểm tra xác thực duy nhất lúc Client gửi lệnh CONNECT (bắt đầu mở kết nối)
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Đọc header "Authorization" mà Frontend gửi lên trong connectHeaders
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            // Kiểm tra định dạng chuẩn "Bearer <token>"
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                // Cắt bỏ 7 ký tự đầu "Bearer " để lấy chuỗi token JWT thuần túy
                String token = authHeader.substring("Bearer ".length());
                try {
                    // Giải mã token, kiểm tra chữ ký & hạn sử dụng để lấy userId chính chủ
                    String userId = authenticationService.extractUserIdFromToken(token);

                    if (userId != null) {
                        // Tạo đối tượng Principal với định danh là userId
                        Principal principal = new UsernamePasswordAuthenticationToken(
                                userId, null, Collections.emptyList()
                        );
                        // Gán danh tính này vào phiên kết nối WebSocket để Spring định tuyến tin nhắn cá nhân
                        accessor.setUser(principal);
                        log.info("WebSocket kết nối thành công cho User ID: {}", userId);
                    }
                } catch (Exception e) {
                    log.error("Xác thực WebSocket JWT thất bại: {}", e.getMessage());
                }
            }
        }
        // Cho phép gói tin đi tiếp vào chuỗi xử lý của Message Broker
        return message;
    }
}
