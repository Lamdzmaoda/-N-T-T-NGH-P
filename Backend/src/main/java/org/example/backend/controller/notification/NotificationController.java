package org.example.backend.controller.notification;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.response.notification.NotificationListResponse;
import org.example.backend.service.notification.NotificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Notification Management", description = "Các API thông báo ")
public class NotificationController {
    NotificationService notificationService;

    /**
     * API: Lấy danh sách thông báo & số lượng chưa đọc của user
     * URL: GET /api/notifications
     */
    @GetMapping
    public ApiResponse<NotificationListResponse> getMyNotifications() {
        return ApiResponse.<NotificationListResponse>builder()
                .result(notificationService.getMyNotifications())
                .build();
    }
    /**
     * API: Đánh dấu đã đọc 1 thông báo
     * URL: PATCH /api/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ApiResponse<String> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ApiResponse.<String>builder()
                .result("Đã đánh dấu đã đọc")
                .build();
    }
    /**
     * API: Đánh dấu tất cả thông báo là đã đọc
     * URL: PATCH /api/notifications/read-all
     */
    @PatchMapping("/read-all")
    public ApiResponse<String> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.<String>builder()
                .result("Đã đánh dấu tất cả là đã đọc")
                .build();
    }
}
