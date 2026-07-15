package org.example.backend.controller.notification;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.response.notification.NotificationResponse;
import org.example.backend.service.notification.NotificationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {
    NotificationService notificationService;

    @GetMapping(value = "/subscribe", produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribe() {
        return notificationService.subscribe();
    }

    @GetMapping
    public ApiResponse<List<NotificationResponse>> getNotifications() {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getNotifications())
                .build();
    }
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.<Long>builder()
                .result(notificationService.getUnreadCount())
                .build();
    }
    @PutMapping("/{id}/read")
    public ApiResponse<String> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ApiResponse.<String>builder()
                .result("Đã đánh dấu đọc thông báo!")
                .build();
    }
    @PutMapping("/read-all")
    public ApiResponse<String> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.<String>builder()
                .result("Đã đánh dấu đọc tất cả thông báo!")
                .build();
    }
}
