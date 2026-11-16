package org.example.backend.service.notification;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.response.notification.NotificationListResponse;
import org.example.backend.dto.response.notification.NotificationResponse;
import org.example.backend.entity.Notification;
import org.example.backend.entity.User.User;
import org.example.backend.enums.NotificationType;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.example.backend.repository.notification.NotificationRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service quản lý toàn bộ thao tác truy vấn và cập nhật thông báo của người dùng.
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    NotificationRepository notificationRepository;
    AuthenticationService authenticationService;

    /**
     * Lấy danh sách thông báo và số lượng tin nhắn chưa đọc của người dùng đang đăng nhập.
     */
    public NotificationListResponse getMyNotifications() {
        User user = authenticationService.getUserByContext();

        // Lấy danh sách thông báo sắp xếp mới nhất lên đầu
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        // Đếm tổng số thông báo chưa đọc (is_read = false) để hiển thị badge đỏ trên quả chuông
        long unreadCount = notificationRepository.countByUserIdAndIsReadFalse(user.getId());

        List<NotificationResponse> dtoList = notifications.stream()
                .map(this::mapToResponse)
                .toList();

        return NotificationListResponse.builder()
                .notifications(dtoList)
                .unreadCount(unreadCount)
                .build();
    }

    /**
     * Đánh dấu một thông báo cụ thể là đã đọc (is_read = true).
     */
    @Transactional
    public void markAsRead(String notificationId) {
        User user = authenticationService.getUserByContext();

        Notification notification = notificationRepository.findByIdAndUserId(notificationId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Đánh dấu toàn bộ thông báo của người dùng là đã đọc.
     */
    @Transactional
    public void markAllAsRead() {
        User user = authenticationService.getUserByContext();
        notificationRepository.markAllAsRead(user.getId());
    }

    /**
     * Tạo và lưu một bản ghi thông báo mới vào cơ sở dữ liệu.
     * Gán luôn thời điểm hiện tại để trả về ngay cho WebSocket mà không phải đợi Hibernate flush.
     */
    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type, String actionUrl) {
        LocalDateTime now = LocalDateTime.now();
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .actionUrl(actionUrl)
                .isRead(false)
                .createdAt(now) // Gán thời gian tạo tức thì
                .build();
        return notificationRepository.save(notification);
    }

    /**
     * Chuyển đổi từ Entity Notification sang DTO NotificationResponse.
     */
    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.getIsRead())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
