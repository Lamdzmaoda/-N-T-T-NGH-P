package org.example.backend.mapper.notification;


import org.example.backend.dto.response.notification.NotificationResponse;
import org.example.backend.entity.TransportNotif.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
@Mapper(componentModel = "spring")
public interface NotificationMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "is_read", target = "isRead")
    @Mapping(source = "ref_id", target = "refId")
    @Mapping(source = "create_at", target = "createAt")
    NotificationResponse toNotificationResponse(Notification notification);
}