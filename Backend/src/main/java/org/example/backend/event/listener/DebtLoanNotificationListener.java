package org.example.backend.event.listener;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.response.notification.NotificationResponse;
import org.example.backend.entity.Notification;
import org.example.backend.entity.User.User;
import org.example.backend.entity.debt.DebtLoan;
import org.example.backend.enums.DebtLoanType;
import org.example.backend.enums.NotificationType;
import org.example.backend.event.createEvent.DebtLoanEvent;
import org.example.backend.service.notification.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.Locale;

/**
 * Lắng nghe các sự kiện công nợ để lưu thông báo vào DB và bắn WebSocket STOMP.
 * - AFTER_COMMIT: Đảm bảo dữ liệu nợ đã commit DB thành công mới bắn thông báo.
 * - REQUIRES_NEW: Mở transaction mới độc lập để lưu notification.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DebtLoanNotificationListener {
    NotificationService notificationService;
    SimpMessagingTemplate simpMessagingTemplate;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleDebtLoanEvent(DebtLoanEvent event) {
        DebtLoan debt = event.getDebtLoan();
        User actor = event.getActor();
        DebtLoanEvent.DebtLoanAction action = event.getAction();

        String actorName = (actor.getFull_name() != null && !actor.getFull_name().isBlank())
                ? actor.getFull_name() : actor.getUsername();
        String formattedAmount = NumberFormat.getInstance(Locale.of("vi", "VN")).format(debt.getAmount());

        switch (action) {
            case REQUEST_CONFIRMATION -> {
                // Người nhận: Đối tác (partnerUser)
                User recipient = debt.getPartnerUser();
                if (recipient == null) return;
                String actionType = (debt.getType() == DebtLoanType.LOAN) ? "cho bạn vay" : "mượn bạn";
                String title = "Yêu cầu xác nhận công nợ từ " + actorName;
                String message = String.format("%s vừa ghi nhận %s %s ₫ (Lý do: %s). Vui lòng xác nhận!",
                        actorName, actionType, formattedAmount,
                        debt.getNote() != null ? debt.getNote() : "Khoản vay cá nhân");
                sendNotification(recipient, title, message, NotificationType.DEBT_CONFIRMATION_REQUEST);
            }
            case CONFIRMED -> {
                // Người nhận: Người tạo nợ ban đầu (debt.getUser())
                User recipient = debt.getUser();
                String title = "Khoản nợ đã được xác nhận";
                String message = String.format("%s đã xác nhận khoản nợ %s ₫ của bạn!", actorName, formattedAmount);
                sendNotification(recipient, title, message, NotificationType.SYSTEM);
            }
            case REJECTED -> {
                // Người nhận: Người tạo nợ ban đầu (debt.getUser())
                User recipient = debt.getUser();
                String title = "Yêu cầu công nợ bị từ chối";
                String message = String.format("%s đã từ chối xác nhận khoản nợ %s ₫ của bạn.", actorName, formattedAmount);
                sendNotification(recipient, title, message, NotificationType.SYSTEM);
            }
            case REMINDED -> {
                // Người nhận: Người nợ (partnerUser)
                User recipient = debt.getPartnerUser();
                if (recipient == null) return;
                String remainingStr = NumberFormat.getInstance(Locale.of("vi", "VN")).format(debt.getRemainingAmount());
                String title = "Nhắc thanh toán nợ từ " + actorName;
                String message = String.format("Bạn có khoản nợ %s ₫ cho '%s' chưa hoàn tất. Vui lòng kiểm tra và thanh toán sớm!",
                        remainingStr,
                        debt.getNote() != null ? debt.getNote() : "Khoản vay cá nhân");
                sendNotification(recipient, title, message, NotificationType.SETTLEMENT_REMINDER);
            }
        }
    }
    private void sendNotification(User recipient, String title, String message, NotificationType type) {
        // 1. Lưu vào MySQL
        Notification notif = notificationService.createNotification(recipient, title, message, type, "/debts");
        // 2. Bắn gói tin WebSocket STOMP
        simpMessagingTemplate.convertAndSendToUser(
                recipient.getId(),
                "/queue/notifications",
                NotificationResponse.builder()
                        .id(notif.getId())
                        .title(notif.getTitle())
                        .message(notif.getMessage())
                        .type(notif.getType())
                        .isRead(false)
                        .actionUrl(notif.getActionUrl())
                        .createdAt(notif.getCreatedAt() != null ? notif.getCreatedAt() : LocalDateTime.now())
                        .build()
        );
        log.info("Đã bắn thông báo công nợ [{}] tới User: {}", type, recipient.getUsername());
    }
}
