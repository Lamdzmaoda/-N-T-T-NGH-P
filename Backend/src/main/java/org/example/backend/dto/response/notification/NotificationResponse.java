package org.example.backend.dto.response.notification;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.NotificationType;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String title;
    String message;
    NotificationType type;
    Boolean isRead;
    String actionUrl;
    LocalDateTime createdAt;
}
