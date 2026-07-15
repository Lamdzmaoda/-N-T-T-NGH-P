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
    String userId;
    String title;
    String body;
    NotificationType type;
    Boolean isRead;
    String refId;
    LocalDateTime createAt;
}
