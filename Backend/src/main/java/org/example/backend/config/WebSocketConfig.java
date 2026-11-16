package org.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Cấu hình hệ thống WebSocket STOMP Message Broker.
 * Lớp này chịu trách nhiệm đăng ký endpoint kết nối cho Client và định tuyến luồng tin nhắn.
 */
@Configuration // Đánh dấu lớp cấu hình Spring Bean
@EnableWebSocketMessageBroker // Kích hoạt máy chủ trung chuyển tin nhắn STOMP qua WebSocket
@RequiredArgsConstructor // Tự động inject dependency (WebSocketAuthInterceptor) qua Constructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Inject bộ chặn xác thực Token khi Client bắt tay kết nối STOMP
    private final WebSocketAuthInterceptor webSocketAuthInterceptor;

    /**
     * Cấu hình bộ định tuyến tin nhắn (Message Broker) trong bộ nhớ:
     * - /topic: Kênh tin nhắn nhóm/công khai (Broadcast 1 tới nhiều)
     * - /queue: Kênh tin nhắn cá nhân (Point-to-Point 1 tới 1)
     * - /app: Tiền tố nhận lệnh từ Client gửi ngược lên Server
     * - /user: Tiền tố định tuyến tin nhắn riêng cho từng User cụ thể
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Bật Simple Broker quản lý tin nhắn trong RAM cho các tiền tố /topic và /queue
        config.enableSimpleBroker("/topic", "/queue");

        // Tiền tố cho các message ánh xạ tới các hàm @MessageMapping trong Controller
        config.setApplicationDestinationPrefixes("/app");

        // Tiền tố định tuyến riêng cho từng user (kết hợp với convertAndSendToUser)
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Đăng ký endpoint HTTP bắt tay kết nối WebSocket ban đầu.
     * Lưu ý: Kết hợp với context-path '/api' trong application.yaml,
     * URL kết nối thực tế ở Client sẽ là: http://localhost:8080/api/ws
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // Cho phép mọi nguồn (CORS) từ Frontend gọi tới
                .setAllowedOriginPatterns("*")
                // Bật SockJS để tự động fallback sang HTTP polling nếu mạng/proxy chặn WebSocket thuần
                .withSockJS();
    }

    /**
     * Đăng ký Interceptor chặn kênh Inbound (tin nhắn từ Client vào Server)
     * Dùng để trích xuất Bearer JWT và gán Principal người dùng trước khi session hình thành.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
