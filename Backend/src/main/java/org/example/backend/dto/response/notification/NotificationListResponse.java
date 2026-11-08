package org.example.backend.dto.response.notification;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationListResponse {
    List<NotificationResponse> notifications;
    long unreadCount; // Số lượng thông báo chưa đọc
}
