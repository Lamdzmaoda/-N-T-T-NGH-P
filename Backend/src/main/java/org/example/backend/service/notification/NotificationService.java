package org.example.backend.service.notification;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.response.notification.NotificationResponse;
import org.example.backend.entity.TransportNotif.Notification;
import org.example.backend.entity.User.User;
import org.example.backend.enums.NotificationType;
import org.example.backend.mapper.notification.NotificationMapper;
import org.example.backend.repository.notification.NotificationRepository;
import org.example.backend.service.auth.AuthenticationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class NotificationService {
    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;
    AuthenticationService authenticationService;

    private static final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe() {
        User user = authenticationService.getUserByContext();
        String userId = user.getId();
        // Timeout 10 minutes (600,000 ms)
        SseEmitter emitter = new SseEmitter(600_000L);

        try {
            emitter.send(SseEmitter.event().name("CONNECT").data("Connected"));
        } catch (Exception e) {
            log.error("Lỗi gửi CONNECT qua SSE cho User: {}", userId, e);
        }

        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        return emitter;
    }

    public List<NotificationResponse> getNotifications() {
        User user = authenticationService.getUserByContext();
        return notificationRepository.findByUserId(user.getId()).stream()
                .map(notificationMapper::toNotificationResponse)
                .collect(Collectors.toList());
    }
    public long getUnreadCount() {
        User user = authenticationService.getUserByContext();
        return notificationRepository.countUnreadNotifications(user.getId());
    }
    @Transactional
    public void markAsRead(String id) {
        User user = authenticationService.getUserByContext();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy thông báo!"));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền đọc thông báo này!");
        }
        notification.setIs_read(true);
        notificationRepository.save(notification);
    }
    @Transactional
    public void markAllAsRead() {
        User user = authenticationService.getUserByContext();
        List<Notification> unreadNotifications = notificationRepository.findByUserId(user.getId()).stream()
                .filter(n -> Boolean.FALSE.equals(n.getIs_read()))
                .collect(Collectors.toList());
        for (Notification notification : unreadNotifications) {
            notification.setIs_read(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
    @Transactional
    public void createNotification(User user, String title, String body, NotificationType type, String refId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .body(body)
                .type(type)
                .is_read(false)
                .ref_id(refId)
                .build();
        notificationRepository.save(notification);
        log.info("Đã tạo thông báo tự động cho User: {}, Loại: {}", user.getUsername(), type);

        // Đẩy thời gian thực qua SSE nếu user đang online
        SseEmitter emitter = emitters.get(user.getId());
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("NOTIFICATION")
                        .data(notificationMapper.toNotificationResponse(notification)));
            } catch (Exception e) {
                emitters.remove(user.getId());
                log.warn("Lỗi gửi thông báo qua SSE, xóa emitter cho User: {}", user.getId());
            }
        }
    }

}
