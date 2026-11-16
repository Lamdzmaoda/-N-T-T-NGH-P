package org.example.backend.event.listener;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.dto.response.notification.NotificationResponse;
import org.example.backend.entity.Budget;
import org.example.backend.entity.Category;
import org.example.backend.entity.Notification;
import org.example.backend.entity.Transaction;
import org.example.backend.entity.User.User;
import org.example.backend.enums.NotificationType;
import org.example.backend.enums.TransactionType;
import org.example.backend.event.createEvent.TransactionCreatedEvent;
import org.example.backend.repository.budget.BudgetRepository;
import org.example.backend.repository.transaction.TransactionRepository;
import org.example.backend.service.notification.NotificationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Trái tim xử lý tính toán ngân sách và bắn cảnh báo thời gian thực (Real-time).
 * Áp dụng kiến trúc Hướng sự kiện (Event-driven Architecture): Tách rời hoàn toàn khỏi TransactionService.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BudgetAlertListener {
    BudgetRepository budgetRepository;             // Truy vấn hạn mức ngân sách
    TransactionRepository transactionRepository;   // Truy vấn danh sách giao dịch chi tiêu trong tháng
    NotificationService notificationService;       // Lưu thông báo vào bảng MySQL notifications
    SimpMessagingTemplate simpMessagingTemplate;   // Công cụ của Spring để đẩy gói tin WebSocket

    /**
     * Lắng nghe sự kiện TransactionCreatedEvent được phát ra từ TransactionService.
     * - AFTER_COMMIT: Đảm bảo giao dịch chi tiêu đã INSERT thành công vào MySQL mới tính toán.
     * - REQUIRES_NEW: Mở một transaction mới độc lập để lưu Notification và cập nhật cờ chống spam vào DB.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTransactionCreated(TransactionCreatedEvent event) {
        // Lấy thông tin giao dịch vừa tạo từ sự kiện
        Transaction tx = event.getTransaction();

        // Chỉ xử lý nếu là giao dịch CHI TIÊU (EXPENSE) và có danh mục cụ thể
        if (tx.getType() != TransactionType.EXPENSE || tx.getCategory() == null) {
            return;
        }

        User user = tx.getUser();
        Category category = tx.getCategory();
        LocalDateTime txDate = tx.getTransactionDate();
        int month = txDate.getMonthValue();
        int year = txDate.getYear();

        // 1. Kiểm tra xem người dùng có thiết lập ngân sách cho danh mục này trong tháng/năm không
        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), category.getId(), month, year
        );

        // Không có thiết lập ngân sách thì kết thúc xử lý
        if (budgetOpt.isEmpty()) {
            return;
        }

        Budget budget = budgetOpt.get();
        BigDecimal limit = budget.getAmount();

        // Bỏ qua nếu hạn mức không hợp lệ (<= 0)
        if (limit.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        // 2. Xác định mốc thời gian từ đầu tháng đến cuối tháng của giao dịch
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        // Lấy toàn bộ giao dịch trong tháng của người dùng
        List<Transaction> monthTxs = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                user.getId(), start, end
        );

        // 3. Tính tổng số tiền đã chi tiêu thực tế của danh mục này trong tháng
        BigDecimal totalSpent = monthTxs.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE
                        && t.getCategory() != null
                        && t.getCategory().getId().equals(category.getId()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Tính tỷ lệ phần trăm đã tiêu: (totalSpent / limit) * 100
        Double percent = totalSpent.divide(limit, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();

        // Định dạng tiền tệ kiểu Việt Nam (ví dụ: 500.000)
        NumberFormat vnFormat = NumberFormat.getInstance(new Locale("vi", "VN"));
        String spentStr = vnFormat.format(totalSpent);
        String limitStr = vnFormat.format(limit);

        // 5. Kiểm tra các ngưỡng cảnh báo và cờ chống spam:
        // Ngưỡng 1: Đã vượt 100% và chưa từng báo 100% trong tháng này
        if (percent >= 100.0 && !budget.getNotifiedAt100()) {
            String title = "Vượt quá ngân sách";
            String message = String.format("Bạn đã chi tiêu %s / %s ₫ (%s%%) danh mục %s. Vui lòng cân đối lại chi tiêu!",
                    spentStr, limitStr, percent, category.getName());

            sendAndSaveAlert(user, budget, title, message, NotificationType.BUDGET_EXCEEDED, true);

        // Ngưỡng 2: Đã đạt từ 80% trở lên và chưa từng báo 80% trong tháng này
        } else if (percent >= 80.0 && !budget.getNotifiedAt80()) {
            String title = "Cảnh báo ngân sách " + category.getName();
            String message = String.format("Bạn đã chi tiêu %s / %s ₫ (%s%%) hạn mức danh mục %s tháng %d.",
                    spentStr, limitStr, percent, category.getName(), month);

            sendAndSaveAlert(user, budget, title, message, NotificationType.BUDGET_WARNING, false);
        }
    }

    /**
     * Hàm phụ trợ: Lưu thông báo vào MySQL, cập nhật cờ chống spam và đẩy tin qua WebSocket.
     */
    private void sendAndSaveAlert(User user, Budget budget, String title, String message,
                                  NotificationType notificationType, boolean set100) {
        // Lưu thông báo mới vào bảng MySQL notifications
        Notification notification = notificationService.createNotification(
                user, title, message, notificationType, "/budgets"
        );

        // Đánh dấu cờ đã cảnh báo để không bị spam thông báo mỗi khi tiêu thêm tiền
        budget.setNotifiedAt80(true);
        if (set100) budget.setNotifiedAt100(true);
        budgetRepository.save(budget); // Lưu trạng thái cờ vào DB

        // Đảm bảo thời gian tạo luôn có giá trị để Frontend hiển thị đồng hồ chuẩn
        LocalDateTime createdAt = notification.getCreatedAt() != null ? notification.getCreatedAt() : LocalDateTime.now();

        // Đóng gói Payload DTO gửi sang WebSocket
        NotificationResponse payload = NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(false)
                .actionUrl(notification.getActionUrl())
                .createdAt(createdAt)
                .build();

        // BẮN THÔNG BÁO WEBSOCKET ĐẾN KÊNH CÁ NHÂN CỦA USER:
        // Đích đến thực tế: /user/{userId}/queue/notifications
        simpMessagingTemplate.convertAndSendToUser(
                user.getId(),
                "/queue/notifications",
                payload
        );
        log.info("Đã bắn thông báo WebSocket [{}] tới User {}", notificationType, user.getUsername());
    }
}
